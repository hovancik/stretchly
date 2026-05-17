import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { getFocusAssist } from 'windows-focus-assist'
import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'

// SHQueryUserNotificationState values surfaced by windows-focus-assist that
// indicate another app is presenting in full screen.
//   3 = QUNS_RUNNING_D3D_FULL_SCREEN (exclusive-fullscreen D3D app)
//   4 = QUNS_PRESENTATION_MODE       (PowerPoint slideshow, fullscreen video)
const WINDOWS_FULLSCREEN_STATES = new Set([3, 4])

const DEFAULT_CHECK_INTERVAL_MS = 2000

// Persistent PowerShell worker for Windows: emits "1" / "0" once per second
// indicating whether the foreground window's rect covers the active monitor
// entirely. This catches borderless-windowed games and browser F11 which
// SHQueryUserNotificationState alone misses.
const WIN_BOUNDS_WORKER_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public class StretchlyFs {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern IntPtr MonitorFromWindow(IntPtr hWnd, uint flags);
  [DllImport("user32.dll")] public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MONITORINFO info);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int left, top, right, bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct MONITORINFO {
    public int cbSize; public RECT rcMonitor; public RECT rcWork; public uint dwFlags;
  }
}
'@ -Language CSharp | Out-Null
while ($true) {
  try {
    $hwnd = [StretchlyFs]::GetForegroundWindow()
    $r = New-Object StretchlyFs+RECT
    $okR = [StretchlyFs]::GetWindowRect($hwnd, [ref]$r)
    $mon = [StretchlyFs]::MonitorFromWindow($hwnd, 2)
    $mi = New-Object StretchlyFs+MONITORINFO; $mi.cbSize = 40
    $okM = [StretchlyFs]::GetMonitorInfo($mon, [ref]$mi)
    $covers = $okR -and $okM -and ($r.left -le $mi.rcMonitor.left) -and ($r.top -le $mi.rcMonitor.top) -and ($r.right -ge $mi.rcMonitor.right) -and ($r.bottom -ge $mi.rcMonitor.bottom)
    if ($covers) { Write-Output '1' } else { Write-Output '0' }
  } catch { Write-Output '0' }
  [Console]::Out.Flush()
  Start-Sleep -Milliseconds 1000
}
`.trim()

class FullscreenAppManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorFullscreenApp = settings.get('monitorFullscreenApp')
    this.timer = null
    this.isOnFullscreenApp = false
    this._errorLogged = {}
    this._waylandWarned = false
    this._unsupportedPlatformLogged = false
    this._winBoundsWorker = null
    this._winForegroundCoversMonitor = false

    if (this.monitorFullscreenApp) {
      this.start()
    }
  }

  start () {
    this.monitorFullscreenApp = true
    if (this.timer) {
      return
    }
    if (process.platform === 'win32') {
      this._startWindowsBoundsWorker()
    }
    this._poll()
    log.info('Stretchly: starting fullscreen app monitoring')
  }

  stop () {
    this.monitorFullscreenApp = false
    this.isOnFullscreenApp = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this._stopWindowsBoundsWorker()
    log.info('Stretchly: stopping fullscreen app monitoring')
  }

  _poll () {
    this.timer = setInterval(async () => {
      const detected = await this._detectFullscreen()
      if (!this.isOnFullscreenApp && detected) {
        this.isOnFullscreenApp = true
        this.emit('fullscreenAppStarted')
      } else if (this.isOnFullscreenApp && !detected) {
        this.isOnFullscreenApp = false
        this.emit('fullscreenAppFinished')
      }
    }, DEFAULT_CHECK_INTERVAL_MS)
  }

  async _detectFullscreen () {
    if (!this.monitorFullscreenApp) {
      return false
    }
    try {
      switch (process.platform) {
        case 'win32':
          return this._detectFullscreenWindows()
        case 'darwin':
          return await this._detectFullscreenMac()
        case 'linux':
          return await this._detectFullscreenLinux()
        default:
          this._logPlatformUnsupportedOnce()
          return false
      }
    } catch (error) {
      this._logErrorOnce('detect', error)
      return false
    }
  }

  _detectFullscreenWindows () {
    // OR of two signals:
    //   1. Win32 user notification state == D3D fullscreen / presentation
    //      (catches exclusive-fullscreen games and PowerPoint slideshows).
    //   2. Foreground window's rect covers the entire active monitor
    //      (catches borderless-windowed games and browser F11, which the
    //      notification state alone reports as BUSY rather than fullscreen).
    let stateFullscreen = false
    try {
      const { value } = getFocusAssist()
      stateFullscreen = WINDOWS_FULLSCREEN_STATES.has(value)
    } catch (error) {
      this._logErrorOnce('win32-state', error)
    }
    return stateFullscreen || this._winForegroundCoversMonitor
  }

  _startWindowsBoundsWorker () {
    if (this._winBoundsWorker) {
      return
    }
    try {
      this._winBoundsWorker = spawn(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', WIN_BOUNDS_WORKER_SCRIPT],
        { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }
      )
    } catch (error) {
      this._logErrorOnce('win32-worker-spawn', error)
      return
    }

    let buffer = ''
    this._winBoundsWorker.stdout.on('data', (chunk) => {
      buffer += chunk.toString()
      let idx
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim()
        buffer = buffer.slice(idx + 1)
        if (line === '1') {
          this._winForegroundCoversMonitor = true
        } else if (line === '0') {
          this._winForegroundCoversMonitor = false
        }
      }
    })
    this._winBoundsWorker.stderr.on('data', (chunk) => {
      const text = chunk.toString().trim()
      if (text) {
        this._logErrorOnce('win32-worker-stderr', new Error(text.slice(0, 200)))
      }
    })
    this._winBoundsWorker.on('error', (error) => {
      this._logErrorOnce('win32-worker', error)
    })
    this._winBoundsWorker.on('exit', () => {
      this._winBoundsWorker = null
      this._winForegroundCoversMonitor = false
    })
  }

  _stopWindowsBoundsWorker () {
    if (!this._winBoundsWorker) {
      return
    }
    try {
      this._winBoundsWorker.kill()
    } catch (error) {
      this._logErrorOnce('win32-worker-kill', error)
    }
    this._winBoundsWorker = null
    this._winForegroundCoversMonitor = false
  }

  async _detectFullscreenMac () {
    // Asks System Events whether the frontmost window of the focused process
    // is in macOS full-screen mode. Returns 'true', 'false' or errors out
    // (for example, when the focused app has no accessible window).
    const script = 'tell application "System Events" to get value of attribute ' +
      '"AXFullScreen" of (first window of (first application process whose frontmost is true))'
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout } = await asyncExec(`osascript -e '${script}'`)
      return stdout.trim() === 'true'
    } catch (error) {
      this._logErrorOnce('darwin', error)
      return false
    }
  }

  async _detectFullscreenLinux () {
    const sessionType = (process.env.XDG_SESSION_TYPE || '').toLowerCase()
    if (sessionType === 'wayland') {
      // Wayland forbids most clients from inspecting other windows, so there
      // is no reliable, portable detection — fall back to "not fullscreen".
      if (!this._waylandWarned) {
        log.info('Stretchly: fullscreen app detection is not supported on Wayland')
        this._waylandWarned = true
      }
      return false
    }
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout: idOut } = await asyncExec('xdotool getactivewindow')
      const windowId = idOut.trim()
      if (!windowId) {
        return false
      }
      const { stdout: stateOut } = await asyncExec(`xprop -id ${windowId} _NET_WM_STATE`)
      return stateOut.includes('_NET_WM_STATE_FULLSCREEN')
    } catch (error) {
      this._logErrorOnce('linux', error)
      return false
    }
  }

  _getOrCreateAsyncExec () {
    if (!this.__asyncExec) {
      this.__asyncExec = promisify(exec)
    }
    return this.__asyncExec
  }

  _logErrorOnce (scope, error) {
    const key = `${scope}-${error.code || error.message.substring(0, 20)}`
    if (this._errorLogged[key]) {
      return
    }
    this._errorLogged[key] = true
    log.error(`Stretchly: fullscreen app detection error (${scope}):`, error)
  }

  _logPlatformUnsupportedOnce () {
    if (this._unsupportedPlatformLogged) {
      return
    }
    this._unsupportedPlatformLogged = true
    log.info(`Stretchly: fullscreen app detection not supported on ${process.platform}`)
  }
}

export default FullscreenAppManager
