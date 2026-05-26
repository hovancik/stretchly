import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { shQueryUserNotificationState } from 'windows-notification-state'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const DEFAULT_CHECK_INTERVAL_MS = 2000

// SHQueryUserNotificationState values (QUERY_USER_NOTIFICATION_STATE enum)
// for which a notification — or in our case, a break — should not appear.
// See https://learn.microsoft.com/windows/win32/api/shellapi/ne-shellapi-query_user_notification_state
//   2 QUNS_BUSY                  — a fullscreen app is running or the user
//                                  enabled Presentation Settings. On modern
//                                  Windows this is what Chrome F11, fullscreen
//                                  video and most games actually report.
//   3 QUNS_RUNNING_D3D_FULL_SCREEN — a legacy exclusive-mode D3D app.
//   4 QUNS_PRESENTATION_MODE     — Windows Presentation Settings explicitly on.
const WINDOWS_FULLSCREEN_STATES = new Set([2, 3, 4])

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

    if (this.monitorFullscreenApp) {
      this.start()
    }
  }

  start () {
    this.monitorFullscreenApp = true
    if (this.timer) {
      return
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
    try {
      return WINDOWS_FULLSCREEN_STATES.has(shQueryUserNotificationState())
    } catch (error) {
      this._logErrorOnce('win32-state', error)
      return false
    }
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
