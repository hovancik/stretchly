import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { desktopIdle } from 'node-desktop-idle-v2'
import { powerMonitor } from 'electron'

class NaturalBreaksManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.usingNaturalBreaks = settings.get('naturalBreaks')
    this.timer = null
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    this.isMonitoringStarted = false
    if (this.usingNaturalBreaks) {
      this.start()
    }
  }

  start () {
    this.usingNaturalBreaks = true
    if (!this.isMonitoringStarted) {
      desktopIdle.startMonitoring()
      this.isMonitoringStarted = true
    }
    this._checkIdleTime()
    log.info('Stretchly: starting Idle time monitoring')
  }

  stop () {
    this.usingNaturalBreaks = false
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    clearTimeout(this.timer)
    this.timer = null
    if (this.isMonitoringStarted) {
      desktopIdle.stopMonitoring()
      this.isMonitoringStarted = false
    }
    log.info('Stretchly: stopping Idle time monitoring')
  }

  get idleTime () {
    if (this.usingNaturalBreaks) {
      const idleSeconds = powerMonitor.getSystemIdleTime() || desktopIdle.getIdleTime()
      if (idleSeconds === -1) {
        log.warn('Stretchly: Failed to get idle time, monitoring not started')
        return 0
      }
      return idleSeconds * 1000
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
    }, 1000)
  }
}

export default NaturalBreaksManager
