const Scheduler = require('./utils/scheduler')
const Utils = require('./utils/utils')
const EventEmitter = require('events')

class BreaksPlanner extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.breakNumber = 0
    this.scheduler = null
    this.isPaused = false

    this.nextBreakDuration = 0
    this.idleCheckTimer = null
    this.scheduleStartIdleTime = 0
    this.inNaturalBreak = false
    this.lastIdleTime = 0

    this.on('microbreakStarted', (shouldPlaySound) => {
      let interval = this.settings.get('microbreakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishMicrobreak', shouldPlaySound), interval, 'finishMicrobreak')
      this.scheduler.plan()
    })

    this.on('breakStarted', (shouldPlaySound) => {
      let interval = this.settings.get('breakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishBreak', shouldPlaySound), interval, 'finishBreak')
      this.scheduler.plan()
    })
  }

  nextBreak () {
    if (this.scheduler) this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let interval = this.settings.get('microbreakInterval')
    if (!shouldBreak && shouldMicrobreak) {
      this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
      this.nextBreakDuration = this.settings.get('microbreakDuration')
    } else if (shouldBreak && !shouldMicrobreak) {
      this.scheduler = new Scheduler(() => this.emit('startBreak'), interval * (this.settings.get('breakInterval') + 1), 'startBreak')
      this.nextBreakDuration = this.settings.get('breakDuration')
    } else if (shouldBreak && shouldMicrobreak) {
      this.breakNumber = this.breakNumber + 1
      let breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        this.scheduler = new Scheduler(() => this.emit('startBreak'), interval, 'startBreak')
        this.nextBreakDuration = this.settings.get('breakDuration')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
        this.nextBreakDuration = this.settings.get('microbreakDuration')
      }
    }
    if (this.settings.get('countIdleTime') && !this.idleCheckTimer) {
      // we need to turn on the idle check timer
      this.idleCheckTimer = setInterval(this.checkIdleTime.bind(this), 5000)
      if (!this.getIdleTime) {
        this.getIdleTime = require('@paulcbetts/system-idle-time').getIdleTime
      }
    }
    if (this.getIdleTime) {
      this.scheduleStartIdleTime = this.getIdleTime()
    }
    this.scheduler.plan()
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
    this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), 100, 'startMicrobreak')
    this.scheduler.plan()
  }

  skipToBreak () {
    this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    if (shouldBreak && shouldMicrobreak) {
      let breakInterval = this.settings.get('breakInterval') + 1
      this.breakNumber = breakInterval
    }
    this.scheduler = new Scheduler(() => this.emit('startBreak'), 100, 'startBreak')
    this.scheduler.plan()
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
    if (time < this.scheduleStartIdleTime) {
      // user has moved in this wait-for-break
      this.scheduleStartIdleTime = 0
    }
    let elapsedTime = Math.max(time - this.scheduleStartIdleTime, 0)
    if (elapsedTime >= this.settings.get('breakDuration') && !this.inNaturalBreak) {
      // we have rested a whole break
      let interval = this.settings.get('microbreakInterval')
      this.breakNumber += interval - (this.breakNumber % interval)
    }
    if (elapsedTime >= this.nextBreakDuration && !this.inNaturalBreak) {
      // time to skip the break or microbreak
      if (this.scheduler) {
        this.scheduler.cancel()
        this.inNaturalBreak = true
      }
    }
    if (time < this.lastIdleTime) {
      // the user moved
      if (this.inNaturalBreak) {
         // schedule the break
         this.nextBreak()
         this.inNaturalBreak = false
      }
    }
    this.lastIdleTime = time
  }

  clear () {
    this.scheduler.cancel()
    this.breakNumber = 0
  }

  pause (milliseconds) {
    this.clear()
    this.isPaused = true
    if (milliseconds !== 1) {
      this.scheduler = new Scheduler(() => this.emit('resumeBreaks'), milliseconds, 'resumeBreaks')
      this.scheduler.plan()
    }
  }

  resume () {
    this.scheduler.cancel()
    this.isPaused = false
    this.nextBreak()
  }

  reset () {
    this.clear()
    this.resume()
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
        let breakType
        switch (this.scheduler.reference) {
          case 'startMicrobreak': {
            breakType = 'microbreak'
            break
          }
          case 'startBreak': {
            breakType = 'break'
            break
          }
          default: {
            breakType = null
            break
          }
        }
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
}

module.exports = BreaksPlanner
