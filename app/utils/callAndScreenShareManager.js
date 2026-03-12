import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

class CallAndScreenShareManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorCallsAndSharing = settings.get('monitorCallsAndSharing')
    this.timer = null
    this.isInCallOrSharing = false
    this._lastTeamsResult = false
    this._lastScreenShareResult = false
    this._pauseStartTime = null
    this._stableStateCount = 0
    this._pendingState = false
    this._errorLogged = {}

    if (this.monitorCallsAndSharing && process.platform === 'darwin') {
      this.start()
    }
  }

  start () {
    if (process.platform !== 'darwin') return
    this.monitorCallsAndSharing = true
    this._checkCallAndScreenShare()
    log.info('Stretchly: starting call and screen share monitoring')
  }

  stop () {
    this.monitorCallsAndSharing = false
    this.isInCallOrSharing = false
    this._lastTeamsResult = false
    this._lastScreenShareResult = false
    this._pauseStartTime = null
    this._stableStateCount = 0
    clearInterval(this.timer)
    this.timer = null
    log.info('Stretchly: stopping call and screen share monitoring')
  }

  get isSchedulerCleared () {
    return this.isInCallOrSharing
  }

  get isInTeamsActivity () {
    return this._lastTeamsResult
  }

  get isScreenSharing () {
    return this._lastScreenShareResult
  }

  get elapsedMs () {
    return this._pauseStartTime ? Date.now() - this._pauseStartTime : 0
  }

  async _detectTeamsActivity () {
    if (!this.monitorCallsAndSharing) return false
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout } = await asyncExec(
        'osascript -e \'tell application "System Events" to get name of every process whose name is "MSTeams" or whose name is "Microsoft Teams"\''
      )
      if (!stdout.trim()) return false
      return await this._isMicOrCameraActive()
    } catch (e) {
      this._logErrorOnce('teams-activity', e)
      return false
    }
  }

  async _isMicOrCameraActive () {
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout: camPids } = await asyncExec(
        'pgrep -x VDCAssistant 2>/dev/null || pgrep -x AppleCameraAssistant 2>/dev/null || true'
      )
      if (camPids.trim().length > 0) return true
      const { stdout: micCount } = await asyncExec(
        'ioreg -r -d 1 -c IOAudioEngine 2>/dev/null | grep -E "^\\+-o|IOAudioEngineState" | grep -B1 "= 1" | grep -ci input || echo 0'
      )
      return parseInt(micCount.trim(), 10) > 0
    } catch (e) {
      this._logErrorOnce('mic-camera-check', e)
      return false
    }
  }

  async _detectScreenSharing () {
    if (!this.monitorCallsAndSharing) return false
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout } = await asyncExec(
        'osascript -e \'tell application "System Events" to get name of every process whose name contains "screencaptureui" or name contains "Screen Sharing"\''
      )
      const trimmed = stdout.trim()
      return trimmed.length > 0 && trimmed !== '{}'
    } catch (e) {
      this._logErrorOnce('screen-sharing', e)
      return false
    }
  }

  _getOrCreateAsyncExec () {
    if (!this.__asyncExec) {
      this.__asyncExec = promisify(exec)
    }
    return this.__asyncExec
  }

  _logErrorOnce (context, error) {
    const errorKey = `${context}-${error.code || error.message.substring(0, 20)}`
    if (!this._errorLogged[errorKey]) {
      log.error(`Stretchly: call/screen share detection error in ${context}:`, error)
      this._errorLogged[errorKey] = true
    }
  }

  _checkCallAndScreenShare () {
    const interval = this.settings.get('callsAndSharingCheckInterval') || 2000
    this.timer = setInterval(async () => {
      this._lastTeamsResult = await this._detectTeamsActivity()
      this._lastScreenShareResult = await this._detectScreenSharing()
      const active = this._lastTeamsResult || this._lastScreenShareResult

      if (active === this._pendingState) {
        this._stableStateCount++
      } else {
        this._pendingState = active
        this._stableStateCount = 1
      }

      if (this._stableStateCount < 2) return

      if (!this.isInCallOrSharing && active) {
        this.isInCallOrSharing = true
        this._pauseStartTime = Date.now()
        this.emit('callOrSharingStarted')
      }
      if (this.isInCallOrSharing && !active) {
        this.isInCallOrSharing = false
        this._pauseStartTime = null
        this.emit('callOrSharingFinished')
      }
    }, interval)
  }
}

export default CallAndScreenShareManager
