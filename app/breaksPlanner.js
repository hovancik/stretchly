const Scheduler = require('./utils/scheduler')
const EventEmitter = require('events')
const NaturalBreaksManager = require('./utils/naturalBreaksManager')

class BreaksPlanner extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.breakNumber = 0
    this.scheduler = null
    this.isPaused = false
    this.naturalBreaksManager = new NaturalBreaksManager(settings)

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

    this.naturalBreaksManager.on('clearBreakScheduler', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
        this.clear()
      }
    })

    this.naturalBreaksManager.on('naturalBreakFinished', (idleTime) => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak') {
        this.reset()
      }
    })
  }

  nextBreak () {
    if (this.scheduler) this.scheduler.cancel()
    let shouldBreak = this.settings.get('break')
    let shouldMicrobreak = this.settings.get('microbreak')
    let interval = this.settings.get('microbreakInterval')
    let breakNotification = this.settings.get('breakNotification')
    let breakNotificationInterval = this.settings.get('breakNotificationInterval')
    let microbreakNotification = this.settings.get('microbreakNotification')
    let microbreakNotificationInterval = this.settings.get('microbreakNotificationInterval')
    if (!shouldBreak && shouldMicrobreak) {
      if (microbreakNotification) {
        this.scheduler = new Scheduler(() => this.emit('startMicrobreakNotification'), interval - microbreakNotificationInterval, 'startMicrobreakNotification')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
      }
    } else if (shouldBreak && !shouldMicrobreak) {
      if (breakNotification) {
        this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval * (this.settings.get('breakInterval') + 1) - breakNotificationInterval, 'startBreakNotification')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startBreak'), interval * (this.settings.get('breakInterval') + 1), 'startBreak')
      }
    } else if (shouldBreak && shouldMicrobreak) {
      this.breakNumber = this.breakNumber + 1
      let breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        if (breakNotification) {
          this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval - breakNotificationInterval, 'startBreakNotification')
        } else {
          this.scheduler = new Scheduler(() => this.emit('startBreak'), interval, 'startBreak')
        }
      } else {
        if (microbreakNotification) {
          this.scheduler = new Scheduler(() => this.emit('startMicrobreakNotification'), interval - microbreakNotificationInterval, 'startMicrobreakNotification')
        } else {
          this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
        }
      }
    }
    this.scheduler.plan()
  }

  nextBreakAfterNotification (name) {
    if (this.scheduler) this.scheduler.cancel()
    let breakNotificationInterval
    if (name === 'startMicrobreak') {
      breakNotificationInterval = this.settings.get('microbreakNotificationInterval')
    } else {
      breakNotificationInterval = this.settings.get('breakNotificationInterval')
    }
    this.scheduler = new Scheduler(() => this.emit(name), breakNotificationInterval, name)
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

  naturalBreaks (shouldUse) {
    if (shouldUse) {
      this.naturalBreaksManager.start()
    } else {
      this.naturalBreaksManager.stop()
    }
  }
}

module.exports = BreaksPlanner
