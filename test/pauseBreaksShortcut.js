import { vi } from 'vitest'
import { expect } from 'chai'
import { calculateInterval, registerPauseBreaksShortcuts, setupBreak } from '../app/utils/pauseBreaksShortcut'

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

  describe('setupBreak', () => {
    it('should register a shortcut and call pauseBreaks with the correct interval', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak('pauseBreaksFor30MinutesShortcut', 'Ctrl+Shift+P', null, pauseBreaks, log, globalShortcut)

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+P', expect.any(Function))
      globalShortcut.register.mock.calls[0][1]()
      expect(pauseBreaks).toHaveBeenCalledWith(30 * 60 * 1000)
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration successful (Ctrl+Shift+P)')
    })

    it('should log a warning if shortcut registration fails', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(false) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()

      setupBreak('pauseBreaksFor30MinutesShortcut', 'Ctrl+Shift+P', null, pauseBreaks, log, globalShortcut)

      expect(log.warn).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration failed')
    })
  })

  describe('registerPauseBreaksShortcuts', () => {
    it('should register all shortcuts from settings', () => {
      const globalShortcut = { register: vi.fn().mockReturnValue(true) }
      const log = { info: vi.fn(), warn: vi.fn() }
      const pauseBreaks = vi.fn()
      const settings = { get: vi.fn((name) => name === 'pauseBreaksFor30MinutesShortcut' ? 'Ctrl+Shift+P' : '') }

      registerPauseBreaksShortcuts(settings, pauseBreaks, log, globalShortcut)

      expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+P', expect.any(Function))
      expect(log.info).toHaveBeenCalledWith('Stretchly: pauseBreaksFor30MinutesShortcut registration successful (Ctrl+Shift+P)')
    })
  })
})
