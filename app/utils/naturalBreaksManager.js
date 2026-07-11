import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { desktopIdle } from 'node-desktop-idle-v2'
import { powerMonitor } from 'electron'

class NaturalBreaksManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.usingNaturalBreaks = settings.get('naturalBreaks')
    this.naturalBreaksCheckInterval = settings.get('naturalBreaksCheckInterval')
    this.timer = null
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    if (this.usingNaturalBreaks) {
      this.start()
    }
  }

  start () {
    if (this.timer) return
    this.usingNaturalBreaks = true
    desktopIdle.startMonitoring()
    this._checkIdleTime()
    log.info('Stretchly: starting Idle time monitoring')
  }

  stop () {
    if (!this.timer) return
    this.usingNaturalBreaks = false
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    clearInterval(this.timer)
    this.timer = null
    desktopIdle.stopMonitoring()
    log.info('Stretchly: stopping Idle time monitoring')
  }

  get idleTime () {
    if (this.usingNaturalBreaks) {
      // On macOS, powerMonitor.getSystemIdleTime() can report false idle values
      // (observed on macOS 26 / Darwin 25: it oscillates between a few seconds and
      // values above naturalBreaksInactivityResetTime even during active use). Because
      // the inflated value is non-zero, the accurate native fallback is never reached,
      // causing clearBreakScheduler/naturalBreakFinished churn that keeps resetting the
      // break countdown so breaks never fire. Use the native IOHID source directly on
      // darwin; keep the existing behaviour on other platforms.
      if (process.platform === 'darwin') {
        return desktopIdle.getIdleTime() * 1000
      }
      return (powerMonitor.getSystemIdleTime() || desktopIdle.getIdleTime()) * 1000
    } else {
      return 0
    }
  }

  _checkIdleTime () {
    let lastIdleTime = 0
    this.timer = setInterval(() => {
      const idleTime = this.idleTime
      if (!this.isOnNaturalBreak && idleTime > 20000) {
        this.isOnNaturalBreak = true
      }
      if (this.isOnNaturalBreak && idleTime < 20000) {
        this.isOnNaturalBreak = false
        if (lastIdleTime > this.settings.get('naturalBreaksInactivityResetTime')) {
          this.isSchedulerCleared = false
          this.emit('naturalBreakFinished')
        }
      }
      if (this.isOnNaturalBreak && idleTime > this.settings.get('naturalBreaksInactivityResetTime')) {
        this.isSchedulerCleared = true
        this.emit('clearBreakScheduler')
      }
      lastIdleTime = idleTime
    }, this.naturalBreaksCheckInterval)
  }
}

export default NaturalBreaksManager
