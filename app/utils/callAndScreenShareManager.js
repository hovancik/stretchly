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
        'osascript -e \'tell application "System Events" to get name of every window of (processes whose name contains "Teams")\''
      )
      const windowTitles = stdout.trim()
      if (!windowTitles || windowTitles === '') return false
      const callIndicators = ['Call', 'Meeting', '|']
      return callIndicators.some(indicator => windowTitles.includes(indicator))
    } catch (e) {
      this._logErrorOnce('teams-activity', e)
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
      if (trimmed.length > 0 && trimmed !== '{}') return true
      const { stdout: teamsOut } = await asyncExec(
        'osascript -e \'tell application "System Events" to get name of every window of (processes whose name contains "Teams")\''
      )
      const lower = teamsOut.toLowerCase()
      return lower.includes('sharing') || lower.includes('presenter')
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
