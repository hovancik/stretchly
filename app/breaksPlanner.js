import Scheduler from './utils/scheduler.js'
import EventEmitter from 'events'
import NaturalBreaksManager from './utils/naturalBreaksManager.js'
import DndManager from './utils/dndManager.js'
import AppExclusionsManager from './utils/appExclusionsManager.js'
import log from 'electron-log/main.js'

class BreaksPlanner extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.breakNumber = 0
    this.postponesNumber = 0
    this.scheduler = null
    this.isPaused = false
    this.pollersSuspended = false
    this.naturalBreaksManager = new NaturalBreaksManager(settings)
    this.dndManager = new DndManager(settings)
    this.appExclusionsManager = new AppExclusionsManager(settings)

    this.on('miniBreakStarted', (shouldPlaySound) => {
      const interval = this.settings.get('miniBreakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishMiniBreak', shouldPlaySound, true), interval, 'finishMiniBreak')
      this.scheduler.plan()
    })

    this.on('breakStarted', (shouldPlaySound) => {
      const interval = this.settings.get('breakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishBreak', shouldPlaySound, true), interval, 'finishBreak')
      this.scheduler.plan()
    })

    this.naturalBreaksManager.on('clearBreakScheduler', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
        this.clear()
        log.info('Stretchly: pausing breaks because of idle time')
      }
    })

    this.naturalBreaksManager.on('naturalBreakFinished', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak' && !this.dndManager.isOnDnd) {
        this.reset()
        log.info('Stretchly: resuming breaks after idle time')
        this.emit('updateToolTip')
      }
    })

    this.dndManager.on('dndStarted', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
        this.clear()
        log.info('Stretchly: pausing breaks for Do Not Distrub')
        this.emit('updateToolTip')
      } else {
        this.dndManager.isOnDnd = false
      }
    })

    this.dndManager.on('dndFinished', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak') {
        this.reset()
        log.info('Stretchly: resuming breaks for Do Not Distrub')
        this.emit('updateToolTip')
      }
    })

    this.appExclusionsManager.on('appExclusionStarted', (rule, exclusion) => {
      if (rule === 'pause') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
          this.clear()
          log.info(`Stretchly: pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else if (!this.isPaused && this.scheduler.reference === 'finishBreak') {
          this.emit('finishBreak', false, false)
          this.clear()
          log.info(`Stretchly: closing current and pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else if (!this.isPaused && this.scheduler.reference === 'finishMiniBreak') {
          this.emit('finishMiniBreak', false, false)
          this.clear()
          log.info(`Stretchly: closing current and pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else {
          this.appExclusionsManager.isOnAppExclusion = false
        }
      } else if (rule === 'resume') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak') {
          this.reset()
          log.info(`Stretchly: resuming breaks as 'resume' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        }
      }
    })

    this.appExclusionsManager.on('appExclusionFinished', (rule) => {
      if (rule === 'pause') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak') {
          this.reset()
          log.info("Stretchly: resuming breaks as no 'pause' exclusion found running")
          this.emit('updateToolTip')
        }
      } else if (rule === 'resume') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
          this.clear()
          log.info("Stretchly: pausing breaks as no 'resume' exclusion found running")
          this.emit('updateToolTip')
        } else {
          this.appExclusionsManager.isOnAppExclusion = true
        }
      }
    })
  }

  nextBreak () {
    this.postponesNumber = 0
    if (this.scheduler) this.scheduler.cancel()
    const shouldBreak = this.settings.get('break')
    const shouldMiniBreak = this.settings.get('miniBreak')
    const interval = this.settings.get('miniBreakInterval')
    const breakNotification = this.settings.get('breakNotification')
    const breakNotificationInterval = this.settings.get('breakNotificationInterval')
    const miniBreakNotification = this.settings.get('miniBreakNotification')
    const miniBreakNotificationInterval = this.settings.get('miniBreakNotificationInterval')
    if (!shouldBreak && shouldMiniBreak) {
      if (miniBreakNotification) {
        this.scheduler = new Scheduler(() => this.emit('startMiniBreakNotification'), interval - miniBreakNotificationInterval, 'startMiniBreakNotification')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startMiniBreak'), interval, 'startMiniBreak')
      }
    } else if (shouldBreak && !shouldMiniBreak) {
      if (breakNotification) {
        this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval * (this.settings.get('breakInterval') + 1) - breakNotificationInterval, 'startBreakNotification')
      } else {
        this.scheduler = new Scheduler(() => this.emit('startBreak'), interval * (this.settings.get('breakInterval') + 1), 'startBreak')
      }
    } else if (shouldBreak && shouldMiniBreak) {
      this.breakNumber = this.breakNumber + 1
      const breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        if (breakNotification) {
          this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval - breakNotificationInterval, 'startBreakNotification')
        } else {
          this.scheduler = new Scheduler(() => this.emit('startBreak'), interval, 'startBreak')
        }
      } else {
        if (miniBreakNotification) {
          this.scheduler = new Scheduler(() => this.emit('startMiniBreakNotification'), interval - miniBreakNotificationInterval, 'startMiniBreakNotification')
        } else {
          this.scheduler = new Scheduler(() => this.emit('startMiniBreak'), interval, 'startMiniBreak')
        }
      }
    }
    this.scheduler.plan()
  }

  nextBreakAfterNotification () {
    this.scheduler.cancel()
    const scheduledBreakType = this._scheduledBreakType
    const breakNotificationInterval = this.settings.get(`${scheduledBreakType}NotificationInterval`)
    const eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}`
    this.scheduler = new Scheduler(() => this.emit(eventName), breakNotificationInterval, eventName)
    this.scheduler.plan()
  }

  postponeCurrentBreak () {
    this.scheduler.cancel()
    this.postponesNumber += 1
    let postponeTime, eventName
    const scheduledBreakType = this._scheduledBreakType
    const notification = this.settings.get(`${scheduledBreakType}Notification`)
    if (notification && this.settings.get(`${scheduledBreakType}PostponeTime`) > this.settings.get(`${scheduledBreakType}NotificationInterval`)) {
      postponeTime = this.settings.get(`${scheduledBreakType}PostponeTime`) - this.settings.get(`${scheduledBreakType}NotificationInterval`)
      eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}Notification`
    } else {
      postponeTime = this.settings.get(`${scheduledBreakType}PostponeTime`)
      eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}`
    }
    this.scheduler = new Scheduler(() => this.emit(eventName), postponeTime, eventName)
    this.scheduler.plan()
    this.emit('updateToolTip')
  }

  skipToMiniBreak (delay = 100) {
    this.scheduler.cancel()
    const shouldBreak = this.settings.get('break')
    const shouldMiniBreak = this.settings.get('miniBreak')
    if (shouldBreak && shouldMiniBreak) {
      const breakInterval = this.settings.get('breakInterval') + 1
      if (this.breakNumber % breakInterval === 0) {
        this.breakNumber = 1
      }
    }
    this.scheduler = new Scheduler(() => this.emit('startMiniBreak'), delay, 'startMiniBreak')
    this.scheduler.plan()
    this.emit('updateToolTip')
  }

  skipToBreak (delay = 100) {
    this.scheduler.cancel()
    const shouldBreak = this.settings.get('break')
    const shouldMiniBreak = this.settings.get('miniBreak')
    if (shouldBreak && shouldMiniBreak) {
      const breakInterval = this.settings.get('breakInterval') + 1
      this.breakNumber = breakInterval
    }
    this.scheduler = new Scheduler(() => this.emit('startBreak'), delay, 'startBreak')
    this.scheduler.plan()
    this.emit('updateToolTip')
  }

  clear () {
    this.scheduler.cancel()
    this.breakNumber = 0
    this.postponesNumber = 0
  }

  pause (milliseconds) {
    this.clear()
    this.isPaused = true
    this.pollersSuspended = true
    this.naturalBreaksManager.stop()
    this.dndManager.stop()
    this.appExclusionsManager.stop()
    if (milliseconds !== 1) {
      this.scheduler = new Scheduler(() => this.emit('resumeBreaks'), milliseconds, 'resumeBreaks')
      this.scheduler.plan()
    }
  }

  resume () {
    this.scheduler.cancel()
    this.isPaused = false
    this.appExclusionsManager.reset()
    this.nextBreak()
    if (this.pollersSuspended) {
      this.pollersSuspended = false
      if (this.settings.get('naturalBreaks')) this.naturalBreaksManager.start()
      if (this.settings.get('monitorDnd')) this.dndManager.start()
      this.appExclusionsManager.reinitialize(this.settings)
    }
  }

  correctScheduler () {
    if (this.scheduler) this.scheduler.correct()
  }

  reset () {
    this.clear()
    this.resume()
  }

  get _scheduledBreakType () {
    const shouldBreak = this.settings.get('break')
    const shouldMiniBreak = this.settings.get('miniBreak')
    const breakInterval = this.settings.get('breakInterval') + 1
    let scheduledBreakType
    if (shouldBreak && shouldMiniBreak) {
      scheduledBreakType = this.breakNumber % breakInterval !== 0 ? 'miniBreak' : 'break'
    } else if (!shouldBreak) {
      scheduledBreakType = 'miniBreak'
    } else if (!shouldMiniBreak) {
      scheduledBreakType = 'break'
    }
    return scheduledBreakType
  }

  naturalBreaks (shouldUse) {
    if (shouldUse) {
      this.naturalBreaksManager.start()
    } else {
      this.naturalBreaksManager.stop()
    }
  }

  doNotDisturb (shouldUse) {
    if (shouldUse) {
      this.dndManager.start()
    } else {
      this.dndManager.stop()
      if (!this.isPaused && this.scheduler.reference === null) {
        this.reset()
      }
    }
  }

  get timeToNextBreak () {
    if (!this.scheduler) return null
    if (this.scheduler.reference === 'startMiniBreak' || this.scheduler.reference === 'startBreak') {
      return this.scheduler.timeLeft
    }
    if (this.scheduler.reference === 'startBreakNotification') {
      return this.scheduler.timeLeft + (this.settings.get('breakNotification')
        ? this.settings.get('breakNotificationInterval')
        : 0)
    }
    if (this.scheduler.reference === 'startMiniBreakNotification') {
      return this.scheduler.timeLeft + (this.settings.get('miniBreakNotification')
        ? this.settings.get('miniBreakNotificationInterval')
        : 0)
    }
    return null
  }

  get _progressInterval () {
    if (!this.scheduler) return null
    const { reference, delay } = this.scheduler

    if (reference === 'startMiniBreak' || reference === 'startBreak') {
      return delay
    }

    if (reference === 'startBreakNotification') {
      return delay + this.settings.get('breakNotificationInterval')
    }

    if (reference === 'startMiniBreakNotification') {
      return delay + this.settings.get('miniBreakNotificationInterval')
    }

    return null
  }

  get progressPercentage () {
    const total = this._progressInterval
    const remaining = this.timeToNextBreak
    if (total === null || total <= 0 || remaining === null) return 0

    const progress = 1 - (remaining / total)
    return Math.max(0, Math.min(100, Math.round(progress * 100)))
  }
}

export default BreaksPlanner
