import { vi } from 'vitest'
import { expect } from 'chai'
import { calculateInterval, registerBreakShortcuts, setupBreak, onShortcut } from '../app/utils/breakShortcuts'

describe('breakShortcuts', () => {
  describe('calculateInterval', () => {
    it('should return correct interval for pauseBreaksUntilMorningShortcut', () => {
      const settings = { get: () => 6 }
      const interval = calculateInterval('pauseBreaksUntilMorningShortcut', settings)
      expect(interval).toBeGreaterThan(0)
      expect(interval).toBeLessThan(24 * 60 * 60 * 1000)
    })
  })

  describe('onShortcut', () => {
    it('calls pauseBreaks for a configured duration', () => {
      const log = { info: vi.fn() }
      const pauseBreaks = vi.fn()

      onShortcut({
        name: 'pauseBreaksDurations',
        duration: 5400000,
        settings: null,
        breakPlanner: null,
        functions: { pauseBreaks },
        log
      })

      expect(pauseBreaks).toHaveBeenCalledWith(5400000)
      expect(log.info).toHaveBeenCalledWith('Stretchly: pausing breaks by shortcut (pauseBreaksDurations)')
    })

    it('for pauseBreaksUntilMorningShortcut calls pauseBreaks with correct interval', () => {
      const log = { info: vi.fn() }
      const pauseBreaks = vi.fn()
      const settings = { get: () => 6 }

      onShortcut({
        name: 'pauseBreaksUntilMorningShortcut',
        settings,
        breakPlanner: null,
        functions: { pauseBreaks },
        log
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
        const skipToMiniBreak = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { _scheduledBreakType: 'break' }

        onShortcut({
          name: 'skipToNextScheduledBreakShortcut',
          settings: null,
          breakPlanner,
          functions: { skipToBreak, skipToMiniBreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next scheduled break by shortcut')
        expect(skipToBreak).toHaveBeenCalled()
        expect(skipToMiniBreak).not.toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })

      it('skips to next scheduled Mini break', () => {
        const log = { info: vi.fn() }
        const skipToBreak = vi.fn()
        const skipToMiniBreak = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { _scheduledBreakType: 'miniBreak' }

        onShortcut({
          name: 'skipToNextScheduledBreakShortcut',
          settings: null,
          breakPlanner,
          functions: { skipToBreak, skipToMiniBreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next scheduled break by shortcut')
        expect(skipToBreak).not.toHaveBeenCalled()
        expect(skipToMiniBreak).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('resetBreaksShortcut', () => {
      it('rest breaks', () => {
        const log = { info: vi.fn() }
        const resetBreaks = vi.fn()
        const pauseBreaks = vi.fn()

        onShortcut({
          name: 'resetBreaksShortcut',
          settings: null,
          breakPlanner: null,
          functions: { resetBreaks, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: resetting breaks by shortcut')
        expect(resetBreaks).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('startLastBreakAgainShortcut', () => {
      it('starts the last break again', () => {
        const log = { info: vi.fn() }
        const startLastBreakAgain = vi.fn()
        const pauseBreaks = vi.fn()

        onShortcut({
          name: 'startLastBreakAgainShortcut',
          settings: null,
          breakPlanner: null,
          functions: { startLastBreakAgain, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: starting last break again by shortcut')
        expect(startLastBreakAgain).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('skipToNextLongBreakShortcut', () => {
      it('skips to next scheduled long break', () => {
        const log = { info: vi.fn() }
        const skipToBreak = vi.fn()
        const pauseBreaks = vi.fn()

        onShortcut({
          name: 'skipToNextLongBreakShortcut',
          settings: null,
          breakPlanner: null,
          functions: { skipToBreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next Long break by shortcut')
        expect(skipToBreak).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('skipToNextMiniBreakShortcut', () => {
      it('skips to next scheduled Mini break', () => {
        const log = { info: vi.fn() }
        const skipToMiniBreak = vi.fn()
        const pauseBreaks = vi.fn()

        onShortcut({
          name: 'skipToNextMiniBreakShortcut',
          settings: null,
          breakPlanner: null,
          functions: { skipToMiniBreak, pauseBreaks },
          log
        })

        expect(log.info).toHaveBeenCalledWith('Stretchly: skipping to next Mini break by shortcut')
        expect(skipToMiniBreak).toHaveBeenCalled()
        expect(pauseBreaks).not.toHaveBeenCalled()
      })
    })

    describe('pauseBreaksToggleShortcut', () => {
      it('pauses breaks indefinitely', () => {
        const log = { info: vi.fn() }
        const pauseBreaks = vi.fn()
        const breakPlanner = { isPaused: false }

        onShortcut({
          name: 'pauseBreaksToggleShortcut',
          settings: null,
          breakPlanner,
          functions: { pauseBreaks },
          log
        })

        expect(pauseBreaks).toHaveBeenCalledWith(1)
        expect(log.info).toHaveBeenCalledWith('Stretchly: pausing breaks by shortcut')
      })

      it('resumes breaks when they are paused', () => {
        const log = { info: vi.fn() }
        const resumeBreaks = vi.fn()
        const pauseBreaks = vi.fn()
        const breakPlanner = { isPaused: true }

        onShortcut({
          name: 'pauseBreaksToggleShortcut',
          settings: null,
          breakPlanner,
          functions: { resumeBreaks, pauseBreaks },
          log
        })

        expect(resumeBreaks).toHaveBeenCalledWith(false)
        expect(pauseBreaks).not.toHaveBeenCalled()
        expect(log.info).toHaveBeenCalledWith('Stretchly: resuming breaks by shortcut')
      })
    })
  })

  describe('setupBreak', () => {
    it('should register a shortcut and call pauseBreaks with the correct interval', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak({
        name: 'pauseBreaksDurations',
        duration: 5400000,
        shortcutText: 'Ctrl+Shift+P',
        settings: null,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+P', expect.any(Function))
      globalShortcut.register.mock.calls[0][1]()
      expect(pauseBreaks).toHaveBeenCalledWith(5400000)
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksDurations registration successful (Ctrl+Shift+P)')
    })

    it('should log a warning if shortcut registration fails', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(false) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak({
        name: 'pauseBreaksDurations',
        duration: 5400000,
        shortcutText: 'Ctrl+Shift+P',
        settings: null,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(log.warn).toHaveBeenCalledWith('Stretchly: pauseBreaksDurations registration failed')
    })
  })

  describe('registerBreakShortcuts', () => {
    it('registers configured durations alongside the remaining shortcuts', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()
      const startLastBreakAgain = vi.fn()
      const values = {
        pauseBreaksDurations: [
          { duration: 5400000, shortcut: 'Ctrl+1' },
          { duration: 2147520000, shortcut: 'Ctrl+9' },
          { duration: 28800000, shortcut: 'Ctrl+2' },
          { duration: 1800000, shortcut: '' },
          { duration: 3600000 }
        ],
        pauseBreaksToggleShortcut: 'Ctrl+3',
        pauseBreaksUntilMorningShortcut: 'Ctrl+4',
        startLastBreakAgainShortcut: 'Ctrl+5'
      }
      const settings = { get: name => values[name] }
      registerBreakShortcuts({ settings, log, globalShortcut, breakPlanner: null, functions: { pauseBreaks, startLastBreakAgain } })

      expect(globalShortcut.register.mock.calls.map(([key]) => key)).toEqual(['Ctrl+4', 'Ctrl+3', 'Ctrl+5', 'Ctrl+1', 'Ctrl+2'])
      globalShortcut.register.mock.calls[2][1]()
      expect(startLastBreakAgain).toHaveBeenCalledOnce()
      values.pauseBreaksDurations[0].duration = 60000
      globalShortcut.register.mock.calls[3][1]()
      globalShortcut.register.mock.calls[4][1]()
      expect(pauseBreaks.mock.calls).toEqual([[5400000], [28800000]])
    })

    it('registers no duration shortcuts for an empty or invalid list', () => {
      for (const entries of [[], [{ duration: 1, shortcut: 'Ctrl+1' }]]) {
        const globalShortcut = { register: vi.fn() }
        registerBreakShortcuts({
          settings: { get: name => name === 'pauseBreaksDurations' ? entries : '' },
          log: { info: vi.fn(), warn: vi.fn() },
          globalShortcut,
          breakPlanner: null,
          functions: { pauseBreaks: vi.fn() }
        })
        expect(globalShortcut.register).not.toHaveBeenCalled()
      }
    })
  })
})
