import { pauseBreaksDurations } from './pauseBreaksSettings.js'

export function pauseMenu (settings, i18next, pauseBreaks) {
  return pauseBreaksDurations(settings).map(({ duration, shortcut }) => {
    const minutes = duration / 60000
    const wholeHours = minutes % 60 === 0
    const key = wholeHours ? 'utils.hours' : 'utils.minutes'
    const count = wholeHours ? minutes / 60 : minutes
    return {
      label: i18next.t(key, { count }) || i18next.t(key, { count, lng: 'en' }),
      accelerator: shortcut || null,
      click: () => pauseBreaks(duration)
    }
  })
}
