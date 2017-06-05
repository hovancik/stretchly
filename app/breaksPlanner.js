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

    this.on('microbreakStarted', (shouldPlaySound) => {
      let interval = this.settings.get('microbreakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishMicrobreak', shouldPlaySound), interval)
      this.scheduler.plan()
    })

    this.on('breakStarted', (shouldPlaySound) => {
      let interval = this.settings.get('breakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishBreak', shouldPlaySound), interval)
      this.scheduler.plan()
    })
  }

  nextBreak () {
    if (this.scheduler) this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let interval = this.settings.get('microbreakInterval')
    if (!shouldBreak && shouldMicrobreak) {
      this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'microbreak')
    } else if (shouldBreak && !shouldMicrobreak) {
      this.scheduler = new Scheduler(() => this.emit('startBreak'), interval * (this.settings.get('breakInterval') + 1), 'break')
    } else if (shouldBreak && shouldMicrobreak) {
      this.breakNumber = this.breakNumber + 1
      let breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        this.scheduler = new Scheduler(() => this.emit('startBreak'), interval, 'break')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'microbreak')
      }
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
    this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), 100)
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
    this.scheduler = new Scheduler(() => this.emit('startBreak'), 100)
    this.scheduler.plan()
  }

  clear () {
    this.scheduler.cancel()
    this.breakNumber = 0
  }

  pause (milliseconds) {
    this.clear()
    this.isPaused = true
    if (milliseconds !== 1) {
      this.scheduler = new Scheduler(() => this.emit('resumeBreaks'), milliseconds)
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
        let breakType = this.scheduler.reference
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
