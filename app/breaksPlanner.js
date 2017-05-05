const Scheduler = require('./utils/scheduler')
const Utils = require('./utils/utils')

class BreaksPlanner {
  constructor (settings, microbreakFunc, breakFunc, resumeBreaksFunc) {
    this.settings = settings
    this.microbreakFunc = microbreakFunc
    this.breakFunc = breakFunc
    this.resumeBreaksFunc = resumeBreaksFunc
    this.breakNumber = 0
    this.scheduler = null
    this.isPaused = false
  }

  get nextBreak () {
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let interval = this.settings.get('microbreakInterval')
    if (!shouldBreak && shouldMicrobreak) {
      this.scheduler = new Scheduler(this.microbreakFunc, interval)
    } else if (shouldBreak && !shouldMicrobreak) {
      this.scheduler = new Scheduler(this.breakFunc, interval * (this.settings.get('breakInterval') + 1))
    } else if (shouldBreak && shouldMicrobreak) {
      this.breakNumber = this.breakNumber + 1
      let breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        this.scheduler = new Scheduler(this.breakFunc, interval)
      } else {
        this.scheduler = new Scheduler(this.microbreakFunc, interval)
      }
    }
    return this.scheduler
  }

  skipToMicrobreak () {
    this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let breakInterval = this.settings.get('breakInterval') + 1
    if (shouldBreak && shouldMicrobreak) {
      if (this.breakNumber % breakInterval === 0) {
        this.breakNumber = 1
      }
    }
    this.scheduler = new Scheduler(this.microbreakFunc, 100)
    return this.scheduler
  }

  skipToBreak () {
    this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    if (shouldBreak && shouldMicrobreak) {
      let breakInterval = this.settings.get('breakInterval') + 1
      this.breakNumber = breakInterval
    }
    this.scheduler = new Scheduler(this.breakFunc, 100)
    return this.scheduler
  }

  clear () {
    this.scheduler.cancel()
    this.breakNumber = 0
  }

  pause (milliseconds) {
    this.clear()
    this.isPaused = true
    if (milliseconds !== 1) {
      this.scheduler = new Scheduler(this.resumeBreaksFunc, milliseconds)
      this.scheduler.plan()
    }
  }

  resume () {
    this.scheduler.cancel()
    this.isPaused = false
    return this.nextBreak
  }

  reset () {
    this.clear()
    this.resume().plan()
  }

  get status () {
    let statusMessage = ''
    if (this.scheduler) {
      if (this.isPaused) {
        let timeLeft = this.scheduler.timeLeft
        if (timeLeft) {
          statusMessage += `\nPaused - ${Utils.formatPauseTimeLeft(timeLeft)} till breaks resume\nas regularly scheduled`
        } else {
          statusMessage += '\nPaused indefinitely'
        }
      } else {
        let breakType = this.nextBreakType()
        if (breakType) {
          statusMessage += `\n${Utils.formatTillBreak(this.scheduler.timeLeft)} to ${breakType}`
          if (breakType === 'microbreak') {
            let breakInterval = this.settings.get('breakInterval') + 1
            let breakNumber = this.breakNumber % breakInterval
            statusMessage += `\nNext break following ${breakInterval - breakNumber} more microbreak(s)`
          }
        }
      }
    }
    return statusMessage
  }

  nextBreakType () {
    if (this.scheduler.func === this.microbreakFunc) {
      return 'microbreak'
    }
    if (this.scheduler.func === this.breakFunc) {
      return 'break'
    }
    console.log('Error determining break type')
    return false
  }
}

module.exports = BreaksPlanner
