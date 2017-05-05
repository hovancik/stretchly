const Scheduler = require('./utils/scheduler')

class BreaksPlanner {
  constructor (settings, microbreakFunc, breakFunc) {
    this.settings = settings
    this.microbreakFunc = microbreakFunc
    this.breakFunc = breakFunc
    this.breakNumber = 0
    this.scheduler = null
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

  pause () {
    this.scheduler.cancel()
    this.breakNumber = 0
  }

  resume () {
    return this.nextBreak
  }

  reset () {
    this.pause()
    this.resume().plan()
  }
}

module.exports = BreaksPlanner
