import { expect, vi } from 'vitest'
import defaultSettings from '../app/utils/defaultSettings'
import BreaksPlanner from '../app/breaksPlanner'

describe('breaksPlanner pending breaks', () => {
  let settings, planner

  beforeEach(() => {
    vi.useFakeTimers()
    settings = new Map(Object.entries(structuredClone(defaultSettings)))
    settings.set('monitorDnd', false)
    settings.set('naturalBreaks', false)
    settings.set('appExclusions', [])
    settings.set('microbreakInterval', 10000)
    settings.set('microbreakNotification', false)
    settings.set('break', false)
    planner = new BreaksPlanner(settings)
    planner.appExclusionsManager.appExclusion = { rule: 'pause' }
    planner.nextBreak()
  })

  afterEach(() => {
    planner.scheduler.cancel()
    planner.naturalBreaksManager.stop()
    planner.dndManager.stop()
    planner.appExclusionsManager.stop()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const start = (source) => {
    if (source === 'DND') {
      planner.dndManager.isOnDnd = true
      planner.dndManager.emit('dndStarted')
    } else {
      planner.appExclusionsManager.isOnAppExclusion = true
      planner.appExclusionsManager.emit('appExclusionStarted', 'pause', 'excluded-app')
    }
  }

  const finish = (source) => {
    if (source === 'DND') {
      planner.dndManager.isOnDnd = false
      planner.dndManager.emit('dndFinished')
    } else {
      planner.appExclusionsManager.isOnAppExclusion = false
      planner.appExclusionsManager.emit('appExclusionFinished', 'pause')
    }
  }

  describe.each(['DND', 'app exclusion'])('%s', (source) => {
    it.each([
      [1000, 5000],
      [8000, 100]
    ])('resumes after %i ms with %i ms until the pending break', (duration, delay) => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      vi.advanceTimersByTime(4000)
      start(source)
      vi.advanceTimersByTime(duration)
      expect(started).not.toHaveBeenCalled()
      finish(source)
      vi.advanceTimersByTime(delay - 1)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(20000)
      expect(started).toHaveBeenCalledTimes(1)
      expect(planner.pendingBreak).toBeNull()
    })

    it.each([
      ['startMicrobreak', false, false],
      ['startMicrobreakNotification', false, true],
      ['startBreak', true, false],
      ['startBreakNotification', true, true]
    ])('preserves the scheduled %s event', (reference, longBreak, notification) => {
      settings.set('break', longBreak)
      settings.set('microbreak', !longBreak)
      settings.set('breakInterval', 0)
      settings.set('breakNotification', notification)
      settings.set('microbreakNotification', notification)
      settings.set('breakNotificationInterval', 2000)
      settings.set('microbreakNotificationInterval', 2000)
      planner.nextBreak()
      const started = vi.fn()
      planner.on(reference, started)
      const deadline = Date.now() + planner.scheduler.timeLeft
      vi.advanceTimersByTime(4000)
      start(source)
      expect(planner.pendingBreak).toEqual({ reference, deadline })
      vi.advanceTimersByTime(1000)
      finish(source)
      expect(planner.scheduler.reference).toBe(reference)
      vi.advanceTimersByTime(deadline - Date.now() - 1)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('preserves long-break cadence and postponement count', () => {
      settings.set('break', true)
      settings.set('breakInterval', 1)
      settings.set('breakNotification', false)
      settings.set('breakPostponeTime', 10000)
      planner.skipToBreak()
      planner.postponeCurrentBreak()
      vi.advanceTimersByTime(4000)
      start(source)
      expect(planner.breakNumber).toBe(2)
      expect(planner.postponesNumber).toBe(1)
      vi.advanceTimersByTime(1000)
      finish(source)
      expect(planner.scheduler.reference).toBe('startBreak')
      expect(planner.scheduler.timeLeft).toBe(5000)
      expect(planner.breakNumber).toBe(2)
      expect(planner.postponesNumber).toBe(1)
      planner.nextBreak()
      expect(planner.scheduler.reference).toBe('startMicrobreak')
    })

    it('skipping discards the pending timer without duplicate breaks', () => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      vi.advanceTimersByTime(4000)
      start(source)
      planner.skipToMicrobreak(5000)
      expect(planner.pendingBreak).toBeNull()
      vi.advanceTimersByTime(1000)
      finish(source)
      vi.advanceTimersByTime(20000)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('counts down from the end of a natural break while still suppressed', () => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      vi.advanceTimersByTime(4000)
      start(source)
      vi.advanceTimersByTime(8000)
      planner.naturalBreaksManager.emit('naturalBreakFinished')
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 10000 })
      expect(planner.scheduler.reference).toBeNull()
      vi.advanceTimersByTime(4000)
      finish(source)
      vi.advanceTimersByTime(5999)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('does not resume while a natural break is still active', () => {
      start(source)
      planner.naturalBreaksManager.isSchedulerCleared = true
      planner.naturalBreaksManager.emit('clearBreakScheduler')
      finish(source)
      expect(planner.scheduler.reference).toBeNull()
      planner.naturalBreaksManager.isSchedulerCleared = false
      planner.naturalBreaksManager.emit('naturalBreakFinished')
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.timeLeft).toBe(10000)
    })

    it('an indefinite manual pause discards the pending timer', () => {
      start(source)
      planner.pause(1)
      expect(planner.pendingBreak).toBeNull()
      finish(source)
      expect(planner.isPaused).toBe(true)
      expect(planner.scheduler.reference).toBeNull()
      planner.resume()
      expect(planner.scheduler.timeLeft).toBe(10000)
    })

    it('a timed manual pause preserves an already pending timer', () => {
      vi.advanceTimersByTime(4000)
      start(source)
      const pending = planner.pendingBreak
      planner.pause(1000)
      expect(planner.pendingBreak).toBe(pending)
      finish(source)
      expect(planner.isPaused).toBe(true)
      expect(planner.scheduler.reference).toBe('resumeBreaks')
      vi.advanceTimersByTime(1000)
      planner.resume()
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      expect(planner.scheduler.timeLeft).toBe(5000)
    })

    it('a reset discards the pending timer', () => {
      start(source)
      planner.reset()
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.timeLeft).toBe(10000)
    })
  })

  describe('timed manual pauses', () => {
    it.each([
      [1000, 5000],
      [8000, 100]
    ])('automatically resumes after %i ms with %i ms until the break', (duration, delay) => {
      const started = vi.fn()
      const resumed = vi.fn(() => planner.resume())
      planner.on('startMicrobreak', started)
      planner.on('resumeBreaks', resumed)
      vi.advanceTimersByTime(4000)
      const deadline = Date.now() + planner.scheduler.timeLeft
      planner.pause(duration)
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline })
      expect(planner.scheduler.reference).toBe('resumeBreaks')
      expect(planner.isPaused).toBe(true)
      vi.advanceTimersByTime(duration - 1)
      expect(resumed).not.toHaveBeenCalled()
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(resumed).toHaveBeenCalledTimes(1)
      expect(planner.isPaused).toBe(false)
      expect(planner.pendingBreak).toBeNull()
      vi.advanceTimersByTime(delay - 1)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(20000)
      expect(started).toHaveBeenCalledTimes(1)
      expect(resumed).toHaveBeenCalledTimes(1)
    })

    it('early resume cancels automatic resume and keeps the original deadline', () => {
      const started = vi.fn()
      const resumed = vi.fn()
      planner.on('startMicrobreak', started)
      planner.on('resumeBreaks', resumed)
      vi.advanceTimersByTime(4000)
      planner.pause(20000)
      vi.advanceTimersByTime(1000)
      planner.resume()
      expect(planner.scheduler.timeLeft).toBe(5000)
      vi.advanceTimersByTime(4999)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(20000)
      expect(started).toHaveBeenCalledTimes(1)
      expect(resumed).not.toHaveBeenCalled()
    })

    it.each([
      ['startMicrobreakNotification', false, true],
      ['startBreak', true, false],
      ['startBreakNotification', true, true]
    ])('preserves %s across a timed pause', (reference, longBreak, notification) => {
      settings.set('break', longBreak)
      settings.set('microbreak', !longBreak)
      settings.set('breakInterval', 0)
      settings.set('breakNotification', notification)
      settings.set('microbreakNotification', notification)
      settings.set('breakNotificationInterval', 2000)
      settings.set('microbreakNotificationInterval', 2000)
      planner.nextBreak()
      const started = vi.fn()
      planner.on(reference, started)
      planner.on('resumeBreaks', () => planner.resume())
      const deadline = Date.now() + planner.scheduler.timeLeft
      vi.advanceTimersByTime(4000)
      planner.pause(1000)
      vi.advanceTimersByTime(1000)
      expect(planner.scheduler.reference).toBe(reference)
      vi.advanceTimersByTime(deadline - Date.now() - 1)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('preserves the original timer when the pause duration is changed', () => {
      const resumed = vi.fn(() => planner.resume())
      planner.on('resumeBreaks', resumed)
      vi.advanceTimersByTime(4000)
      planner.pause(1000)
      const pending = planner.pendingBreak
      vi.advanceTimersByTime(500)
      planner.pause(2000)
      expect(planner.pendingBreak).toBe(pending)
      vi.advanceTimersByTime(1999)
      expect(resumed).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(resumed).toHaveBeenCalledTimes(1)
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      expect(planner.scheduler.timeLeft).toBe(3500)
    })

    it('switching to an indefinite pause discards the timer and cancels automatic resume', () => {
      const resumed = vi.fn()
      planner.on('resumeBreaks', resumed)
      planner.pause(1000)
      planner.pause(1)
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.reference).toBeNull()
      vi.advanceTimersByTime(20000)
      expect(resumed).not.toHaveBeenCalled()
      planner.resume()
      expect(planner.scheduler.timeLeft).toBe(10000)
    })

    it('a reset discards the timer and cancels automatic resume', () => {
      const resumed = vi.fn()
      planner.on('resumeBreaks', resumed)
      vi.advanceTimersByTime(4000)
      planner.pause(1000)
      planner.reset()
      expect(planner.pendingBreak).toBeNull()
      expect(planner.isPaused).toBe(false)
      expect(planner.scheduler.timeLeft).toBe(10000)
      vi.advanceTimersByTime(1000)
      expect(resumed).not.toHaveBeenCalled()
    })

    it('preserves long-break cadence and postponement count', () => {
      settings.set('break', true)
      settings.set('breakInterval', 1)
      settings.set('breakNotification', false)
      settings.set('breakPostponeTime', 10000)
      planner.skipToBreak()
      planner.postponeCurrentBreak()
      vi.advanceTimersByTime(4000)
      planner.pause(1000)
      expect(planner.breakNumber).toBe(2)
      expect(planner.postponesNumber).toBe(1)
      vi.advanceTimersByTime(1000)
      planner.resume()
      expect(planner.scheduler.reference).toBe('startBreak')
      expect(planner.scheduler.timeLeft).toBe(5000)
      expect(planner.breakNumber).toBe(2)
      expect(planner.postponesNumber).toBe(1)
      planner.nextBreak()
      expect(planner.scheduler.reference).toBe('startMicrobreak')
    })

    it('does not save a break-finish timer', () => {
      planner.scheduler.cancel()
      planner.emit('microbreakStarted', true)
      planner.pause(1000)
      expect(planner.pendingBreak).toBeNull()
      vi.advanceTimersByTime(1000)
      planner.resume()
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      expect(planner.scheduler.timeLeft).toBe(10000)
    })

    it('does not save the resume timer when there is no pending break', () => {
      planner.clear()
      planner.pause(1000)
      planner.pause(2000)
      expect(planner.pendingBreak).toBeNull()
      planner.resume()
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      expect(planner.scheduler.timeLeft).toBe(10000)
    })

    it('keeps idle monitoring running while stopping the other pollers', () => {
      settings.set('monitorDnd', true)
      settings.set('naturalBreaks', true)
      const managers = [planner.naturalBreaksManager, planner.dndManager, planner.appExclusionsManager]
      const stops = managers.map(manager => vi.spyOn(manager, 'stop'))
      const naturalStart = vi.spyOn(planner.naturalBreaksManager, 'start').mockImplementation(() => {})
      const dndStart = vi.spyOn(planner.dndManager, 'start').mockImplementation(() => {})
      const appReinitialize = vi.spyOn(planner.appExclusionsManager, 'reinitialize')
      planner.pause(1000)
      expect(stops[0]).not.toHaveBeenCalled()
      expect(stops[1]).toHaveBeenCalledTimes(1)
      expect(stops[2]).toHaveBeenCalledTimes(1)
      expect(naturalStart).toHaveBeenCalledTimes(1)
      expect(planner.pollersSuspended).toBe(true)
      planner.resume()
      expect(naturalStart).toHaveBeenCalledTimes(2)
      expect(dndStart).toHaveBeenCalledTimes(1)
      expect(appReinitialize).toHaveBeenCalledExactlyOnceWith(settings)
      expect(planner.pollersSuspended).toBe(false)
      expect(planner.scheduler.timeLeft).toBe(10000)
      naturalStart.mockRestore()
      dndStart.mockRestore()
    })

    it('a completed natural break refreshes the timer without ending the manual pause', () => {
      start('app exclusion')
      planner.pause(1000)
      const resumeScheduler = planner.scheduler
      planner.naturalBreaksManager.emit('naturalBreakFinished')
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 10000 })
      expect(planner.isPaused).toBe(true)
      expect(planner.scheduler).toBe(resumeScheduler)
      expect(planner.scheduler.reference).toBe('resumeBreaks')
    })
  })

  describe('notification and break scheduling', () => {
    it.each([
      ['DND', 'microbreak', 'Microbreak'],
      ['DND', 'break', 'Break'],
      ['app exclusion', 'microbreak', 'Microbreak'],
      ['app exclusion', 'break', 'Break'],
      ['timed manual pause', 'microbreak', 'Microbreak'],
      ['timed manual pause', 'break', 'Break']
    ])('restores a %s-paused %s notification and starts the break once', (source, type, eventType) => {
      settings.set('microbreak', type === 'microbreak')
      settings.set('break', type === 'break')
      settings.set('breakInterval', 0)
      settings.set(`${type}Notification`, true)
      settings.set(`${type}NotificationInterval`, 2000)
      planner.nextBreak()
      const notification = vi.fn(() => planner.nextBreakAfterNotification())
      const started = vi.fn()
      planner.on(`start${eventType}Notification`, notification)
      planner.on(`start${eventType}`, started)
      vi.advanceTimersByTime(4000)
      if (source === 'timed manual pause') {
        planner.on('resumeBreaks', () => planner.resume())
        planner.pause(1000)
        vi.advanceTimersByTime(1000)
      } else {
        start(source)
        vi.advanceTimersByTime(1000)
        finish(source)
      }
      vi.advanceTimersByTime(2999)
      expect(notification).not.toHaveBeenCalled()
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(notification).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(1999)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(20000)
      expect(notification).toHaveBeenCalledTimes(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    describe.each([
      ['microbreak', 'Microbreak'],
      ['break', 'Break']
    ])('%s postponement', (type, eventType) => {
      it.each([1000, 2000, 5000])('starts exactly once after a %i ms postponement', (postponeTime) => {
        settings.set('microbreak', type === 'microbreak')
        settings.set('break', type === 'break')
        settings.set(`${type}Notification`, true)
        settings.set(`${type}NotificationInterval`, 2000)
        settings.set(`${type}PostponeTime`, postponeTime)
        const notification = vi.fn(() => planner.nextBreakAfterNotification())
        const started = vi.fn()
        planner.on(`start${eventType}Notification`, notification)
        planner.on(`start${eventType}`, started)
        planner.postponeCurrentBreak()
        expect(planner.postponesNumber).toBe(1)
        if (postponeTime > 2000) {
          vi.advanceTimersByTime(postponeTime - 2000 - 1)
          expect(notification).not.toHaveBeenCalled()
          vi.advanceTimersByTime(1)
          expect(notification).toHaveBeenCalledTimes(1)
          expect(started).not.toHaveBeenCalled()
          vi.advanceTimersByTime(1999)
        } else {
          vi.advanceTimersByTime(postponeTime - 1)
          expect(notification).not.toHaveBeenCalled()
        }
        expect(started).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(started).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(20000)
        expect(notification).toHaveBeenCalledTimes(postponeTime > 2000 ? 1 : 0)
        expect(started).toHaveBeenCalledTimes(1)
      })
    })

    it.each([false, true])('runs Mini, Long, then Mini with notifications %s', (notifications) => {
      settings.set('break', true)
      settings.set('breakInterval', 1)
      settings.set('microbreakNotification', notifications)
      settings.set('breakNotification', notifications)
      settings.set('microbreakNotificationInterval', 2000)
      settings.set('breakNotificationInterval', 2000)
      settings.set('microbreakDuration', 1000)
      settings.set('breakDuration', 1000)
      const events = []
      for (const [type, eventType] of [['microbreak', 'Microbreak'], ['break', 'Break']]) {
        planner.on(`start${eventType}Notification`, () => {
          events.push(`${type} notification`)
          planner.nextBreakAfterNotification()
        })
        planner.on(`start${eventType}`, () => {
          events.push(`${type} start`)
          planner.emit(`${type}Started`, false)
        })
        planner.on(`finish${eventType}`, (sound, planNext) => {
          events.push(`${type} finish`)
          expect(sound).toBe(false)
          expect(planNext).toBe(true)
          planner.nextBreak()
        })
      }
      planner.nextBreak()
      for (const type of ['microbreak', 'break', 'microbreak']) {
        const previous = [...events]
        vi.advanceTimersByTime(notifications ? 7999 : 9999)
        expect(events).toEqual(previous)
        if (notifications) {
          vi.advanceTimersByTime(1)
          expect(events).toEqual([...previous, `${type} notification`])
          vi.advanceTimersByTime(1999)
          expect(events).toEqual([...previous, `${type} notification`])
        }
        vi.advanceTimersByTime(1)
        expect(events.at(-1)).toBe(`${type} start`)
        vi.advanceTimersByTime(999)
        expect(events.at(-1)).toBe(`${type} start`)
        vi.advanceTimersByTime(1)
        expect(events.at(-1)).toBe(`${type} finish`)
      }
      expect(events).toEqual(['microbreak', 'break', 'microbreak'].flatMap(type => [
        ...(notifications ? [`${type} notification`] : []),
        `${type} start`,
        `${type} finish`
      ]))
    })
  })

  describe('resume guards', () => {
    it.each([
      ['microbreak', 'Microbreak'],
      ['break', 'Break']
    ])('idle events do not interrupt an active %s', (type, eventType) => {
      settings.set(`${type}Duration`, 10000)
      const finished = vi.fn()
      planner.on(`finish${eventType}`, finished)
      planner.scheduler.cancel()
      planner.emit(`${type}Started`, false)
      const scheduler = planner.scheduler
      vi.advanceTimersByTime(4000)
      planner.naturalBreaksManager.emit('clearBreakScheduler')
      planner.naturalBreaksManager.emit('naturalBreakFinished')
      expect(planner.scheduler).toBe(scheduler)
      expect(planner.scheduler.reference).toBe(`finish${eventType}`)
      vi.advanceTimersByTime(5999)
      expect(finished).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(finished).toHaveBeenCalledExactlyOnceWith(false, true)
    })

    it.each(['DND', 'pause exclusion', 'resume exclusion'])('%s events cannot end a timed manual pause', (source) => {
      planner.on('resumeBreaks', () => planner.resume())
      planner.pause(20000)
      const pending = planner.pendingBreak
      const scheduler = planner.scheduler
      if (source === 'DND') {
        start('DND')
        finish('DND')
      } else {
        const rule = source === 'pause exclusion' ? 'pause' : 'resume'
        planner.appExclusionsManager.appExclusion = { rule }
        planner.appExclusionsManager.isOnAppExclusion = true
        planner.appExclusionsManager.emit('appExclusionStarted', rule, 'excluded-app')
        planner.appExclusionsManager.isOnAppExclusion = false
        planner.appExclusionsManager.emit('appExclusionFinished', rule)
      }
      expect(planner.pendingBreak).toBe(pending)
      expect(planner.scheduler).toBe(scheduler)
      expect(planner.scheduler.reference).toBe('resumeBreaks')
      vi.advanceTimersByTime(19999)
      expect(planner.isPaused).toBe(true)
      vi.advanceTimersByTime(1)
      expect(planner.isPaused).toBe(false)
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      expect(planner.scheduler.timeLeft).toBe(100)
    })
  })

  describe('idle monitoring across pause sources', () => {
    let idleTime

    beforeEach(() => {
      settings.set('naturalBreaks', true)
      settings.set('naturalBreaksInactivityResetTime', 300000)
      settings.set('microbreakInterval', 600000)
      planner.nextBreak()
      idleTime = 0
      vi.spyOn(planner.naturalBreaksManager, 'idleTime', 'get').mockImplementation(() => idleTime)
      planner.naturalBreaksManager.start()
    })

    const pollIdle = (milliseconds) => {
      idleTime = milliseconds
      vi.advanceTimersByTime(planner.naturalBreaksManager.naturalBreaksCheckInterval)
    }

    it('clears normal scheduling after the idle threshold and starts a fresh interval on return', () => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      pollIdle(300000)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(false)
      expect(planner.scheduler.reference).toBe('startMicrobreak')
      pollIdle(300001)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(true)
      expect(planner.scheduler.reference).toBeNull()
      expect(planner.pendingBreak).toBeNull()
      vi.advanceTimersByTime(600000)
      expect(started).not.toHaveBeenCalled()
      pollIdle(0)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(false)
      expect(planner.scheduler.timeLeft).toBe(600000)
      vi.advanceTimersByTime(599999)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it.each(['DND', 'app exclusion', 'timed manual pause'])('resets after sufficient idle time during %s', (source) => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      const manual = source === 'timed manual pause'
      if (manual) {
        planner.pause(900000)
      } else {
        start(source)
      }
      const pending = planner.pendingBreak
      const scheduler = planner.scheduler
      pollIdle(300001)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(true)
      expect(planner.pendingBreak).toBe(pending)
      expect(planner.scheduler).toBe(scheduler)
      pollIdle(0)
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 600000 })
      expect(planner.scheduler).toBe(scheduler)
      vi.advanceTimersByTime(100000)
      expect(started).not.toHaveBeenCalled()
      if (manual) {
        expect(planner.isPaused).toBe(true)
        expect(planner.scheduler.reference).toBe('resumeBreaks')
        planner.resume()
      } else {
        finish(source)
      }
      expect(planner.scheduler.timeLeft).toBe(500000)
      vi.advanceTimersByTime(499999)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('preserves the manual auto-resume deadline after a completed natural break', () => {
      const resumed = vi.fn(() => planner.resume())
      planner.on('resumeBreaks', resumed)
      planner.pause(900000)
      const resumeDeadline = Date.now() + planner.scheduler.timeLeft
      pollIdle(300001)
      pollIdle(0)
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 600000 })
      expect(planner.isPaused).toBe(true)
      expect(Date.now() + planner.scheduler.timeLeft).toBe(resumeDeadline)
      vi.advanceTimersByTime(resumeDeadline - Date.now() - 1)
      expect(resumed).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(resumed).toHaveBeenCalledTimes(1)
      expect(planner.scheduler.timeLeft).toBe(100)
    })

    it.each(['automatic', 'early'])('waits for activity when %s resume occurs during a natural break', (mode) => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      planner.on('resumeBreaks', () => planner.resume())
      planner.pause(10000)
      pollIdle(300001)
      const pending = planner.pendingBreak
      if (mode === 'automatic') {
        vi.advanceTimersByTime(planner.scheduler.timeLeft)
      } else {
        planner.resume()
      }
      expect(planner.isPaused).toBe(false)
      expect(planner.pollersSuspended).toBe(false)
      expect(planner.pendingBreak).toBe(pending)
      expect(planner.scheduler.reference).toBeNull()
      vi.advanceTimersByTime(600000)
      expect(started).not.toHaveBeenCalled()
      pollIdle(0)
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.timeLeft).toBe(600000)
      vi.advanceTimersByTime(600000)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('retains the original deadline after a short idle period', () => {
      planner.pause(900000)
      const pending = planner.pendingBreak
      pollIdle(60000)
      pollIdle(0)
      expect(planner.pendingBreak).toBe(pending)
      planner.resume()
      expect(Date.now() + planner.scheduler.timeLeft).toBe(pending.deadline)
    })

    it('preserves idle monitoring state when changing a timed pause', () => {
      planner.pause(900000)
      const timer = planner.naturalBreaksManager.timer
      pollIdle(300001)
      planner.pause(1000000)
      expect(planner.naturalBreaksManager.timer).toBe(timer)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(true)
      pollIdle(0)
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 600000 })
      expect(planner.isPaused).toBe(true)
      expect(planner.scheduler.reference).toBe('resumeBreaks')
    })

    it('stops idle monitoring on an indefinite pause and restarts it on a timed pause', () => {
      planner.pause(900000)
      pollIdle(300001)
      planner.pause(1)
      expect(planner.naturalBreaksManager.timer).toBeNull()
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(false)
      planner.pause(900000)
      expect(planner.naturalBreaksManager.timer).not.toBeNull()
      pollIdle(300001)
      expect(planner.naturalBreaksManager.isSchedulerCleared).toBe(true)
    })

    it('does not start idle monitoring when natural breaks are disabled', () => {
      settings.set('naturalBreaks', false)
      planner.naturalBreaks(false)
      planner.pause(900000)
      expect(planner.naturalBreaksManager.timer).toBeNull()
      expect(planner.pendingBreak).not.toBeNull()
    })

    it.each(['DND', 'app exclusion', 'timed manual pause'])('shows an overdue break after 6 idle minutes and 24 working minutes during %s', (source) => {
      const started = vi.fn()
      planner.on('startMicrobreak', started)
      vi.advanceTimersByTime(120000)
      const pauseStart = Date.now()
      if (source === 'timed manual pause') {
        planner.on('resumeBreaks', () => planner.resume())
        planner.pause(1800000)
      } else {
        start(source)
      }
      idleTime = 360000
      vi.advanceTimersByTime(360000 - planner.naturalBreaksManager.naturalBreaksCheckInterval)
      pollIdle(0)
      const deadline = Date.now() + 600000
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline })
      expect(Date.now() - pauseStart).toBe(360000)
      vi.advanceTimersByTime(1440000 - 1)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      if (source !== 'timed manual pause') finish(source)
      expect(Date.now() - pauseStart).toBe(1800000)
      expect(planner.scheduler.timeLeft).toBe(100)
      vi.advanceTimersByTime(99)
      expect(started).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(started).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(600000)
      expect(started).toHaveBeenCalledTimes(1)
    })

    it.each([
      ['microbreak', 'Microbreak', false],
      ['microbreak', 'Microbreak', true],
      ['break', 'Break', false],
      ['break', 'Break', true]
    ])('refreshes %s (%s, notifications %s) after repeated natural breaks', (type, eventType, notification) => {
      settings.set('microbreak', type === 'microbreak')
      settings.set('break', type === 'break')
      settings.set('breakInterval', 0)
      settings.set(`${type}Notification`, notification)
      settings.set(`${type}NotificationInterval`, 2000)
      planner.nextBreak()
      start('DND')
      for (let i = 0; i < 2; i++) {
        pollIdle(300001)
        pollIdle(0)
        expect(planner.pendingBreak).toEqual({
          reference: `start${eventType}${notification ? 'Notification' : ''}`,
          deadline: Date.now() + 600000 - (notification ? 2000 : 0)
        })
        vi.advanceTimersByTime(100000)
      }
      const started = vi.fn()
      planner.on(`start${eventType}`, started)
      const notified = vi.fn(() => planner.nextBreakAfterNotification())
      planner.on(`start${eventType}Notification`, notified)
      finish('DND')
      vi.advanceTimersByTime(notification ? 498000 : 500000)
      if (notification) {
        expect(notified).toHaveBeenCalledTimes(1)
        expect(started).not.toHaveBeenCalled()
        vi.advanceTimersByTime(2000)
      }
      expect(started).toHaveBeenCalledTimes(1)
    })

    it('resets cadence and postponement count without overwriting the manual resume timer', () => {
      settings.set('break', true)
      settings.set('breakInterval', 1)
      planner.skipToBreak()
      planner.postponeCurrentBreak()
      planner.pause(1800000)
      const scheduler = planner.scheduler
      const resumeDeadline = Date.now() + scheduler.timeLeft
      pollIdle(300001)
      pollIdle(0)
      expect(planner.breakNumber).toBe(1)
      expect(planner.postponesNumber).toBe(0)
      expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 600000 })
      expect(planner.scheduler).toBe(scheduler)
      expect(Date.now() + planner.scheduler.timeLeft).toBe(resumeDeadline)
    })

    it('does not create a pending countdown during an indefinite pause', () => {
      planner.pause(1)
      planner.naturalBreaksManager.emit('naturalBreakFinished')
      expect(planner.pendingBreak).toBeNull()
      expect(planner.scheduler.reference).toBeNull()
      expect(planner.isPaused).toBe(true)
    })
  })

  it.each([
    ['DND', 'app exclusion', 'DND', 'app exclusion'],
    ['DND', 'app exclusion', 'app exclusion', 'DND'],
    ['app exclusion', 'DND', 'DND', 'app exclusion'],
    ['app exclusion', 'DND', 'app exclusion', 'DND']
  ])('overlap: start %s then %s, finish %s then %s', (firstStart, secondStart, firstFinish, secondFinish) => {
    const started = vi.fn()
    planner.on('startMicrobreak', started)
    vi.advanceTimersByTime(4000)
    start(firstStart)
    const pending = planner.pendingBreak
    vi.advanceTimersByTime(1000)
    start(secondStart)
    expect(planner.pendingBreak).toBe(pending)
    expect(planner.dndManager.isOnDnd).toBe(true)
    expect(planner.appExclusionsManager.isSchedulerCleared).toBe(true)
    finish(firstFinish)
    expect(planner.pendingBreak).toBe(pending)
    expect(planner.scheduler.reference).toBeNull()
    vi.advanceTimersByTime(8000)
    expect(started).not.toHaveBeenCalled()
    finish(secondFinish)
    vi.advanceTimersByTime(99)
    expect(started).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(started).toHaveBeenCalledTimes(1)
  })

  it('disabling DND does not resume an active pause exclusion', () => {
    planner.doNotDisturb(true)
    start('DND')
    start('app exclusion')
    planner.doNotDisturb(false)
    expect(planner.scheduler.reference).toBeNull()
    expect(planner.pendingBreak).not.toBeNull()
    finish('app exclusion')
    expect(planner.scheduler.timeLeft).toBe(10000)
  })

  it('disabling DND restores the pending deadline', () => {
    vi.advanceTimersByTime(4000)
    planner.doNotDisturb(true)
    start('DND')
    planner.doNotDisturb(false)
    expect(planner.pendingBreak).toBeNull()
    expect(planner.scheduler.timeLeft).toBe(6000)
  })

  it('keeps both pause sources active after a natural break refreshes the pending timer', () => {
    start('app exclusion')
    planner.naturalBreaksManager.emit('naturalBreakFinished')
    start('DND')
    expect(planner.dndManager.isOnDnd).toBe(true)
    expect(planner.pendingBreak).toEqual({ reference: 'startMicrobreak', deadline: Date.now() + 10000 })
    finish('app exclusion')
    expect(planner.scheduler.reference).toBeNull()
    finish('DND')
    expect(planner.scheduler.timeLeft).toBe(10000)
  })

  it.each(['microbreakStarted', 'breakStarted'])('DND leaves an active %s running', (event) => {
    planner.scheduler.cancel()
    planner.emit(event, true)
    const scheduler = planner.scheduler
    start('DND')
    expect(planner.dndManager.isOnDnd).toBe(false)
    expect(planner.pendingBreak).toBeNull()
    expect(planner.scheduler).toBe(scheduler)
    expect(planner.scheduler.reference).not.toBeNull()
  })

  it('keeps resume exclusions using a fresh interval', () => {
    planner.appExclusionsManager.appExclusion = { rule: 'resume' }
    planner.appExclusionsManager.isOnAppExclusion = false
    planner.appExclusionsManager.emit('appExclusionFinished', 'resume')
    expect(planner.pendingBreak).toBeNull()
    expect(planner.scheduler.reference).toBeNull()
    vi.advanceTimersByTime(8000)
    planner.appExclusionsManager.isOnAppExclusion = true
    planner.appExclusionsManager.emit('appExclusionStarted', 'resume', 'excluded-app')
    expect(planner.scheduler.timeLeft).toBe(10000)
  })

  it.each([
    ['microbreakStarted', 'finishMicrobreak'],
    ['breakStarted', 'finishBreak']
  ])('a pause exclusion closes an active %s without saving it', (event, finishEvent) => {
    planner.scheduler.cancel()
    planner.emit(event, true)
    const finished = vi.fn()
    planner.on(finishEvent, finished)
    start('app exclusion')
    expect(finished).toHaveBeenCalledExactlyOnceWith(false, false)
    expect(planner.pendingBreak).toBeNull()
    expect(planner.scheduler.reference).toBeNull()
    finish('app exclusion')
    expect(planner.scheduler.timeLeft).toBe(10000)
  })
})
