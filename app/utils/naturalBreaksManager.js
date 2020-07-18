const EventEmitter = require('events')

class NaturalBreaksManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.usingNaturalBreaks = settings.get('naturalBreaks')
    this.timer = null
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    if (this.usingNaturalBreaks) {
      this.start()
    }
  }

  start () {
    this.usingNaturalBreaks = true
    this._checkIdleTime()
  }

  stop () {
    this.usingNaturalBreaks = false
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    clearTimeout(this.timer)
    this.timer = null
  }

  get idleTime () {
    if (this.usingNaturalBreaks) {
      return require('electron').powerMonitor.getSystemIdleTime() * 1000
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

module.exports = NaturalBreaksManager
