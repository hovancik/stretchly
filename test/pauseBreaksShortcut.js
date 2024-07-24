import { vi } from 'vitest'
import { expect } from 'chai'
import { calculateInterval, registerPauseBreaksShortcuts, setupBreak, onShortcut } from '../app/utils/pauseBreaksShortcut'

describe('pauseBreaksShortcut', () => {
  describe('calculateInterval', () => {
    it('should return correct interval for pauseBreaksFor30MinutesShortcut', () => {
      const interval = calculateInterval('pauseBreaksFor30MinutesShortcut')
      expect(interval).toBe(30 * 60 * 1000)
    })

    it('should return correct interval for pauseBreaksFor1HourShortcut', () => {
      const interval = calculateInterval('pauseBreaksFor1HourShortcut')
      expect(interval).toBe(3600 * 1000)
    })

    it('should return correct interval for pauseBreaksFor2HoursShortcut', () => {
      const interval = calculateInterval('pauseBreaksFor2HoursShortcut')
      expect(interval).toBe(2 * 3600 * 1000)
    })

    it('should return correct interval for pauseBreaksFor5HoursShortcut', () => {
      const interval = calculateInterval('pauseBreaksFor5HoursShortcut')
      expect(interval).toBe(5 * 3600 * 1000)
    })

    it('should return correct interval for pauseBreaksUntilMorningShortcut', () => {
      const settings = { get: () => 6 }
      const interval = calculateInterval('pauseBreaksUntilMorningShortcut', settings)
      expect(interval).toBeGreaterThan(0)
      expect(interval).toBeLessThan(24 * 60 * 60 * 1000)
    })
  })

  describe('onShortcut', () => {
    it('calls pauseBreaks for pauseBreaksFor30MinutesShortcut', () => {
      const pauseBreaks = vi.fn()

      onShortcut({
        name: 'pauseBreaksFor30MinutesShortcut',
        settings: null,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(pauseBreaks).toHaveBeenCalledWith(30 * 60 * 1000)
    })

    it('for pauseBreaksUntilMorningShortcut calls pauseBreaks with correct interval', () => {
      const pauseBreaks = vi.fn()
      const settings = { get: () => 6 }

      onShortcut({
        name: 'pauseBreaksUntilMorningShortcut',
        settings,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(pauseBreaks).toHaveBeenCalled()

      // Check the interval parameter passed to pauseBreaks
      const intervalExpected = calculateInterval('pauseBreaksUntilMorningShortcut', settings)
      const intervalActual = pauseBreaks.mock.calls[0][0]

      // expect interval to be within 10 seconds of expected value
      expect(Math.abs(intervalActual - intervalExpected)).toBeLessThan(10 * 1000)
    })

    describe('skipToNextScheduledBreakShortcut', () => {
      it('skips to next scheduled break', () => {
        const log = { info: vi.fn() }
        const skipToBreak = vi.fn()
        const skipToMicrobreak = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { _scheduledBreakType: 'break' }

        onShortcut({
          name: 'skipToNextScheduledBreakShortcut',
          settings: null,
          breakPlanner,
          functions: { skipToBreak, skipToMicrobreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next scheduled Break by shortcut')
        expect(skipToBreak).toHaveBeenCalled()
        expect(skipToMicrobreak).not.toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })

      it('skips to next scheduled microbreak', () => {
        const log = { info: vi.fn() }
        const skipToBreak = vi.fn()
        const skipToMicrobreak = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { _scheduledBreakType: 'microbreak' }

        onShortcut({
          name: 'skipToNextScheduledBreakShortcut',
          settings: null,
          breakPlanner,
          functions: { skipToBreak, skipToMicrobreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next scheduled Break by shortcut')
        expect(skipToBreak).not.toHaveBeenCalled()
        expect(skipToMicrobreak).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('pauseBreaksToggleShortcut', () => {
      it('pauses breaks indefinitely', () => {
        const pauseBreaks = vi.fn()
        const breakPlanner = { isPaused: false }

        onShortcut({
          name: 'pauseBreaksToggleShortcut',
          settings: null,
          breakPlanner,
          functions: { pauseBreaks }
        })

        expect(pauseBreaks).toHaveBeenCalledWith(1)
      })

      it('resumes breaks when they are paused', () => {
        const resumeBreaks = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { isPaused: true }

        onShortcut({
          name: 'pauseBreaksToggleShortcut',
          settings: null,
          breakPlanner,
          functions: { resumeBreaks, pauseBreaks }
        })

        expect(resumeBreaks).toHaveBeenCalledWith(false)
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })
  })

  describe('setupBreak', () => {
    it('should register a shortcut and call pauseBreaks with the correct interval', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak({
        name: 'pauseBreaksFor30MinutesShortcut',
        shortcutText: 'Ctrl+Shift+P',
        settings: null,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+P', expect.any(Function))
      globalShortcut.register.mock.calls[0][1]()
      expect(pauseBreaks).toHaveBeenCalledWith(30 * 60 * 1000)
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration successful (Ctrl+Shift+P)')
    })

    it('should log a warning if shortcut registration fails', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(false) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak({
        name: 'pauseBreaksFor30MinutesShortcut',
        shortcutText: 'Ctrl+Shift+P',
        settings: null,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(log.warn).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration failed')
    })
  })

  describe('registerPauseBreaksShortcuts', () => {
    it('should register all shortcuts from settings', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      const intervals = {
        pauseBreaksFor30MinutesShortcut: 0,
        pauseBreaksFor1HourShortcut: 1,
        pauseBreaksFor2HoursShortcut: 2,
        pauseBreaksFor5HoursShortcut: 3,
        pauseBreaksUntilMorningShortcut: 4,
        pauseBreaksToggleShortcut: 5,
        skipToNextScheduledBreakShortcut: 6
      }

      const settings = { get: vi.fn((name) => intervals[name]) }

      registerPauseBreaksShortcuts({
        settings,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      // Check shortcut registration
      // ------------

      expect(globalShortcut.register).toHaveBeenCalledTimes(7)

      for (let i = 0; i < 7; i++) {
        expect(globalShortcut.register.mock.calls[i][0]).toBe(i)
      }

      // Check log
      // ------------

      expect(log.info).toHaveBeenCalledTimes(7)

      for (let i = 0; i < 7; i++) {
        expect(log.info.mock.calls[i][0]).toMatch(`registration successful (${i})`)
      }
    })

    it('should skip empty shortcuts', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      const settings = { get: vi.fn((name) => name === 'pauseBreaksFor30MinutesShortcut' ? 'key' : '') }

      registerPauseBreaksShortcuts({
        settings,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(globalShortcut.register).toHaveBeenCalledTimes(1)
      expect(globalShortcut.register).toHaveBeenCalledWith('key', expect.any(Function))
      expect(log.info).toHaveBeenCalledTimes(1)
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration successful (key)')
    })
  })
})
