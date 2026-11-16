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
    this.pendingBreak = null
    this.naturalBreaksManager = new NaturalBreaksManager(settings)
    this.dndManager = new DndManager(settings)
    this.appExclusionsManager = new AppExclusionsManager(settings)

    this.on('miniBreakStarted', (shouldPlaySound) => {
      const interval = this.settings.get('miniBreakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishMiniBreak', shouldPlaySound, true), interval, 'finishMiniBreak')
      this.scheduler.plan()
    })

    this.on('longBreakStarted', (shouldPlaySound) => {
      const interval = this.settings.get('longBreakDuration')
      this.scheduler = new Scheduler(() => this.emit('finishLongBreak', shouldPlaySound, true), interval, 'finishLongBreak')
      this.scheduler.plan()
    })

    this.naturalBreaksManager.on('clearBreakScheduler', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak' && this.scheduler.reference !== null) {
        this.clear()
        log.info('Stretchly: pausing breaks because of idle time')
      }
    })

    this.naturalBreaksManager.on('naturalBreakFinished', () => {
      if (this.isPaused || this.dndManager.isOnDnd || this.appExclusionsManager.isSchedulerCleared) {
        this.pendingBreak = null
        if ((!this.isPaused && (this.dndManager.isOnDnd || this.appExclusionsManager.appExclusion?.rule === 'pause')) || this.scheduler.reference === 'resumeBreaks') {
          this.breakNumber = 0
          this.postponesNumber = 0
          const scheduler = this._createNextBreakScheduler()
          this.pendingBreak = { reference: scheduler.reference, deadline: Date.now() + scheduler.delay }
        }
      } else if (this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak') {
        this.reset()
        log.info('Stretchly: resuming breaks after idle time')
        this.emit('updateToolTip')
      }
    })

    this.dndManager.on('dndStarted', () => {
      if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak' && this.scheduler.reference !== null) {
        this._savePendingBreak()
        log.info('Stretchly: pausing breaks for Do Not Distrub')
        this.emit('updateToolTip')
      } else if (this.isPaused || (!this.pendingBreak && !this.appExclusionsManager.isSchedulerCleared && !this.naturalBreaksManager.isSchedulerCleared)) {
        this.dndManager.isOnDnd = false
      }
    })

    this.dndManager.on('dndFinished', () => {
      if (!this.isPaused && !this.appExclusionsManager.isSchedulerCleared && !this.naturalBreaksManager.isSchedulerCleared && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak') {
        if (this.pendingBreak) {
          this._restorePendingBreak()
        } else {
          this.reset()
        }
        log.info('Stretchly: resuming breaks for Do Not Distrub')
        this.emit('updateToolTip')
      }
    })

    this.appExclusionsManager.on('appExclusionStarted', (rule, exclusion) => {
      if (rule === 'pause') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak' && this.scheduler.reference !== null) {
          this._savePendingBreak()
          log.info(`Stretchly: pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else if (!this.isPaused && this.scheduler.reference === 'finishLongBreak') {
          this.emit('finishLongBreak', false, false)
          this.clear()
          log.info(`Stretchly: closing current and pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else if (!this.isPaused && this.scheduler.reference === 'finishMiniBreak') {
          this.emit('finishMiniBreak', false, false)
          this.clear()
          log.info(`Stretchly: closing current and pausing breaks as 'pause' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        } else if (this.isPaused || (!this.pendingBreak && !this.dndManager.isOnDnd && !this.naturalBreaksManager.isSchedulerCleared)) {
          this.appExclusionsManager.isOnAppExclusion = false
        }
      } else if (rule === 'resume') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak') {
          this.reset()
          log.info(`Stretchly: resuming breaks as 'resume' exclusion found running: '${exclusion}'`)
          this.emit('updateToolTip')
        }
      }
    })

    this.appExclusionsManager.on('appExclusionFinished', (rule) => {
      if (rule === 'pause') {
        if (!this.isPaused && !this.dndManager.isOnDnd && !this.naturalBreaksManager.isSchedulerCleared && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak') {
          if (this.pendingBreak) {
            this._restorePendingBreak()
          } else {
            this.reset()
          }
          log.info("Stretchly: resuming breaks as no 'pause' exclusion found running")
          this.emit('updateToolTip')
        }
      } else if (rule === 'resume') {
        if (!this.isPaused && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak' && this.scheduler.reference !== null) {
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
    this.pendingBreak = null
    if (this.scheduler) this.scheduler.cancel()
    this.scheduler = this._createNextBreakScheduler()
    this.scheduler.plan()
  }

  _createNextBreakScheduler () {
    const shouldLongBreak = this.settings.get('longBreak')
    const shouldMiniBreak = this.settings.get('miniBreak')
    const interval = this.settings.get('miniBreakInterval')
    const longBreakNotification = this.settings.get('longBreakNotification')
    const longBreakNotificationInterval = this.settings.get('longBreakNotificationInterval')
    const miniBreakNotification = this.settings.get('miniBreakNotification')
    const miniBreakNotificationInterval = this.settings.get('miniBreakNotificationInterval')
    if (!shouldLongBreak && shouldMiniBreak) {
      if (miniBreakNotification) {
        return new Scheduler(() => this.emit('startMiniBreakNotification'), interval - miniBreakNotificationInterval, 'startMiniBreakNotification')
      } else {
        return new Scheduler(() => this.emit('startMiniBreak'), interval, 'startMiniBreak')
      }
    } else if (shouldLongBreak && !shouldMiniBreak) {
      if (longBreakNotification) {
        return new Scheduler(() => this.emit('startLongBreakNotification'), interval * (this.settings.get('longBreakInterval') + 1) - longBreakNotificationInterval, 'startLongBreakNotification')
      } else {
        return new Scheduler(() => this.emit('startLongBreak'), interval * (this.settings.get('longBreakInterval') + 1), 'startLongBreak')
      }
    } else if (shouldLongBreak && shouldMiniBreak) {
      this.breakNumber = this.breakNumber + 1
      const longBreakInterval = this.settings.get('longBreakInterval') + 1
      if (this.breakNumber % longBreakInterval === 0) {
        if (longBreakNotification) {
          return new Scheduler(() => this.emit('startLongBreakNotification'), interval - longBreakNotificationInterval, 'startLongBreakNotification')
        } else {
          return new Scheduler(() => this.emit('startLongBreak'), interval, 'startLongBreak')
        }
      } else {
        if (miniBreakNotification) {
          return new Scheduler(() => this.emit('startMiniBreakNotification'), interval - miniBreakNotificationInterval, 'startMiniBreakNotification')
        } else {
          return new Scheduler(() => this.emit('startMiniBreak'), interval, 'startMiniBreak')
        }
      }
    }
  }

  nextBreakAfterNotification () {
    this.scheduler.cancel()
    const scheduledBreakType = this.scheduledBreakType
    const breakNotificationInterval = this.settings.get(`${scheduledBreakType}NotificationInterval`)
    const eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}`
    this.scheduler = new Scheduler(() => this.emit(eventName), breakNotificationInterval, eventName)
    this.scheduler.plan()
  }

  postponeCurrentBreak () {
    this.pendingBreak = null
    this.scheduler.cancel()
    this.postponesNumber += 1
    let postponeTime, eventName
    const scheduledBreakType = this.scheduledBreakType
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
    this.pendingBreak = null
    this.scheduler.cancel()
    const shouldLongBreak = this.settings.get('longBreak')
    const shouldMiniBreak = this.settings.get('miniBreak')
    if (shouldLongBreak && shouldMiniBreak) {
      const longBreakInterval = this.settings.get('longBreakInterval') + 1
      if (this.breakNumber % longBreakInterval === 0) {
        this.breakNumber = 1
      }
    }
    this.scheduler = new Scheduler(() => this.emit('startMiniBreak'), delay, 'startMiniBreak')
    this.scheduler.plan()
    this.emit('updateToolTip')
  }

  skipToLongBreak (delay = 100) {
    this.pendingBreak = null
    this.scheduler.cancel()
    const shouldLongBreak = this.settings.get('longBreak')
    const shouldMiniBreak = this.settings.get('miniBreak')
    if (shouldLongBreak && shouldMiniBreak) {
      const longBreakInterval = this.settings.get('longBreakInterval') + 1
      this.breakNumber = longBreakInterval
    }
    this.scheduler = new Scheduler(() => this.emit('startLongBreak'), delay, 'startLongBreak')
    this.scheduler.plan()
    this.emit('updateToolTip')
  }

  _savePendingBreak () {
    const { reference, timeLeft } = this.scheduler
    const deadline = Date.now() + timeLeft
    const breakNumber = this.breakNumber
    const postponesNumber = this.postponesNumber
    this.clear()
    this.breakNumber = breakNumber
    this.postponesNumber = postponesNumber
    this.pendingBreak = { reference, deadline }
  }

  _restorePendingBreak () {
    const { reference, deadline } = this.pendingBreak
    this.pendingBreak = null
    this.scheduler.cancel()
    const delay = Math.max(deadline - Date.now(), 100)
    this.scheduler = new Scheduler(() => this.emit(reference), delay, reference)
    this.scheduler.plan()
  }

  clear () {
    this.pendingBreak = null
    this.scheduler.cancel()
    this.breakNumber = 0
    this.postponesNumber = 0
  }

  pause (milliseconds) {
    if (milliseconds !== 1 && !this.isPaused && this.scheduler.reference !== null && this.scheduler.reference !== 'finishMiniBreak' && this.scheduler.reference !== 'finishLongBreak') {
      this._savePendingBreak()
    } else if (milliseconds !== 1 && this.pendingBreak) {
      this.scheduler.cancel()
    } else {
      this.clear()
    }
    this.isPaused = true
    this.pollersSuspended = true
    if (milliseconds !== 1 && this.settings.get('naturalBreaks')) {
      this.naturalBreaksManager.start()
    } else {
      this.naturalBreaksManager.stop()
    }
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
    if (!this.naturalBreaksManager.isSchedulerCleared) {
      if (this.pendingBreak) {
        this._restorePendingBreak()
      } else {
        this.nextBreak()
      }
    }
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

  get scheduledBreakType () {
    const shouldLongBreak = this.settings.get('longBreak')
    const shouldMiniBreak = this.settings.get('miniBreak')
    const longBreakInterval = this.settings.get('longBreakInterval') + 1
    let scheduledBreakType
    if (shouldLongBreak && shouldMiniBreak) {
      scheduledBreakType = this.breakNumber % longBreakInterval !== 0 ? 'miniBreak' : 'longBreak'
    } else if (!shouldLongBreak) {
      scheduledBreakType = 'miniBreak'
    } else if (!shouldMiniBreak) {
      scheduledBreakType = 'longBreak'
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
      if (!this.isPaused && !this.appExclusionsManager.isSchedulerCleared && !this.naturalBreaksManager.isSchedulerCleared && this.scheduler.reference === null) {
        if (this.pendingBreak) {
          this._restorePendingBreak()
        } else {
          this.reset()
        }
      }
    }
  }

  get timeToNextBreak () {
    if (!this.scheduler) return null
    if (this.scheduler.reference === 'startMiniBreak' || this.scheduler.reference === 'startLongBreak') {
      return this.scheduler.timeLeft
    }
    if (this.scheduler.reference === 'startLongBreakNotification') {
      return this.scheduler.timeLeft + (this.settings.get('longBreakNotification')
        ? this.settings.get('longBreakNotificationInterval')
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

    if (reference === 'startMiniBreak' || reference === 'startLongBreak') {
      return delay
    }

    if (reference === 'startLongBreakNotification') {
      return delay + this.settings.get('longBreakNotificationInterval')
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
