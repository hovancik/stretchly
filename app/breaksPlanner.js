const Scheduler = require('./utils/scheduler')

class BreaksPlanner {
  constructor (settings, microbreakFunc, breakFunc) {
    this.settings = settings
    this.microbreakFunc = microbreakFunc
    this.breakFunc = breakFunc
    this.breakNumber = 0
    this.scheduler = null
    this.nextBreakDuration = 0
    this.idleCheckTimer = null
    this.breakStartIdleTime = 0
  }

  get nextBreak () {
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let interval = this.settings.get('microbreakInterval')
    if (!shouldBreak && shouldMicrobreak) {
      this.scheduler = new Scheduler(this.microbreakFunc, interval)
      this.nextBreakDuration = this.settings.get('microbreakDuration')
    } else if (shouldBreak && !shouldMicrobreak) {
      this.scheduler = new Scheduler(this.breakFunc, interval * (this.settings.get('breakInterval') + 1))
      this.nextBreakDuration = settings.get('breakDuration')
    } else if (shouldBreak && shouldMicrobreak) {
      this.breakNumber = this.breakNumber + 1
      let breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        this.scheduler = new Scheduler(this.breakFunc, interval)
        this.nextBreakDuration = settings.get('breakDuration')
      } else {
        this.scheduler = new Scheduler(this.microbreakFunc, interval)
        this.nextBreakDuration = this.settings.get('microbreakDuration')
      }
    }
    if (this.settings.get('countIdleTime') && !this.idleCheckTimer) {
      // we need to turn on the idle check timer
      console.log('setting up to check idle time');
      this.idleCheckTimer = setInterval(this.checkIdleTime.bind(this), 5000)
      if (!this.getIdleTime) {
        this.getIdleTime = require('@paulcbetts/system-idle-time').getIdleTime
      }
    }
    if (this.getIdleTime) {
      this.breakStartIdleTime = this.getIdleTime()
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

  checkIdleTime () {
    if (!this.getIdleTime) {
      return
    }
    if (!this.settings.get('countIdleTime')) {
      clearInterval(this.idleCheckTimer)
      return
    }
    let time = this.getIdleTime()
    console.log('idle for %s ms', time)
    if (time < this.breakStartIdleTime) {
      // reset idle because user has moved
      this.breakStartIdleTime = 0
    }
    console.log('break start at %s', this.breakStartIdleTime)
    let elapsedTime = Math.max(time - this.breakStartIdleTime, 0)
    if (elapsedTime >= this.nextBreakDuration) {
      // time to reset the break
      console.log("skipping microbreak")
      if (this.scheduler) {
        this.scheduler.cancel()
      }
      if (elapsedTime >= this.settings.get('breakDuration')) {
        // we have rested a whole break
        console.log("skipping a full break")
        let interval = this.settings.get('microbreakInterval')
        this.breakNumber += interval - (this.breakNumber % interval)
      }
      this.nextBreak.plan()
    }
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
    this.resume()
  }
}

module.exports = BreaksPlanner
