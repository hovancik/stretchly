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

      // expect interval to be within 1 second of expected value
      expect(Math.abs(intervalActual - intervalExpected)).toBeLessThan(1000)
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
        const breakPlanner = { isPaused: true }

        onShortcut({
          name: 'pauseBreaksToggleShortcut',
          settings: null,
          breakPlanner,
          functions: { resumeBreaks }
        })

        expect(resumeBreaks).toHaveBeenCalledWith(false)
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
      const settings = { get: vi.fn((name) => name === 'pauseBreaksFor30MinutesShortcut' ? 'Ctrl+Shift+P' : '') }

      registerPauseBreaksShortcuts({
        settings,
        log,
        globalShortcut,
        breakPlanner: null,
        functions: { pauseBreaks }
      })

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+P', expect.any(Function))
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration successful (Ctrl+Shift+P)')
    })
  })
})
