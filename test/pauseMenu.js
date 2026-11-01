import { beforeEach, describe, expect, it, vi } from 'vitest'
import { join } from 'node:path'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import defaultSettings from '../app/utils/defaultSettings.js'
import { pauseMenu } from '../app/utils/pauseMenu.js'

describe('pause menu', () => {
  let values, settings, translations, pauseBreaks

  beforeEach(async () => {
    values = { ...defaultSettings }
    settings = { get: key => values[key] }
    pauseBreaks = vi.fn()
    translations = i18next.createInstance().use(Backend)
    await translations.init({
      lng: 'en',
      fallbackLng: 'en',
      backend: { loadPath: join(__dirname, '../app/locales/{{lng}}.json') }
    })
  })

  it('preserves the default labels and pause durations', () => {
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.label)).toEqual(['30 minutes', '1 hour', '2 hours', '5 hours'])
    expect(menu.map(item => item.accelerator)).toEqual([null, null, null, null])
    menu.forEach(item => item.click())
    expect(pauseBreaks.mock.calls).toEqual([[1800000], [3600000], [7200000], [18000000]])
  })

  it('uses custom durations in order and captures each displayed duration', () => {
    values.pauseBreaksDurations = [480, 1, 90, 5].map(minutes => ({ duration: minutes * 60000 }))
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.label)).toEqual(['8 hours', '1 minute', '90 minutes', '5 minutes'])
    values.pauseBreaksDurations[0].duration = 900000
    menu.forEach(item => item.click())
    expect(pauseBreaks.mock.calls).toEqual([[28800000], [60000], [5400000], [300000]])
    expect(pauseMenu(settings, translations, pauseBreaks)[0].label).toBe('15 minutes')
  })

  it('uses the shortcut belonging to each entry', () => {
    values.pauseBreaksDurations = [
      { duration: 5400000, shortcut: 'Ctrl+1' },
      { duration: 1800000, shortcut: '' },
      { duration: 5400000, shortcut: 'Ctrl+2' }
    ]
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.accelerator)).toEqual(['Ctrl+1', null, 'Ctrl+2'])
  })

  it('allows an empty list to hide timed entries', () => {
    values.pauseBreaksDurations = []
    expect(pauseMenu(settings, translations, pauseBreaks)).toEqual([])
  })

  it.each([undefined, null])('falls back to defaults when configuration is not a list: %j', durations => {
    values.pauseBreaksDurations = durations
    const menu = pauseMenu(settings, translations, pauseBreaks)
    menu.forEach(item => item.click())
    expect(pauseBreaks.mock.calls).toEqual([[1800000], [3600000], [7200000], [18000000]])
  })

  it.each([null, 30, { duration: 0 }, { duration: -60000 }, { duration: 1 }, { duration: 60001 }, { duration: Infinity }, { duration: 2147520000 }, { duration: 60000, shortcut: 123 }])('skips invalid entry %j while preserving valid options', entry => {
    values.pauseBreaksDurations = [
      { duration: 5400000, shortcut: 'Ctrl+1' },
      entry,
      { duration: 1800000 }
    ]
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.label)).toEqual(['90 minutes', '30 minutes'])
    expect(menu.map(item => item.accelerator)).toEqual(['Ctrl+1', null])
    menu.forEach(item => item.click())
    expect(pauseBreaks.mock.calls).toEqual([[5400000], [1800000]])
  })

  it('returns no options when every configured duration is invalid', () => {
    values.pauseBreaksDurations = [{ duration: 1 }]
    expect(pauseMenu(settings, translations, pauseBreaks)).toEqual([])
  })

  it('accepts the largest whole-minute duration supported by the timer', () => {
    values.pauseBreaksDurations = [{ duration: 2147460000 }]
    pauseMenu(settings, translations, pauseBreaks)[0].click()
    expect(pauseBreaks).toHaveBeenCalledWith(2147460000)
  })

  it('uses existing translations and plural forms', async () => {
    await translations.changeLanguage('pl')
    values.pauseBreaksDurations = [1, 2, 5, 60, 120, 300, 480].map(minutes => ({ duration: minutes * 60000 }))
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.label)).toEqual(['1 minuta', '2 minuty', '5 minut', '1 godzina', '2 godziny', '5 godzin', '8 godzin'])
  })

  it('falls back to English when a translated label is empty', async () => {
    await translations.changeLanguage('ro')
    values.pauseBreaksDurations = [2, 120].map(minutes => ({ duration: minutes * 60000 }))
    const menu = pauseMenu(settings, translations, pauseBreaks)
    expect(menu.map(item => item.label)).toEqual(['2 minutes', '2 hours'])
  })
})
