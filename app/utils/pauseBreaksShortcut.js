const { UntilMorning } = require('./untilMorning')

const intervals = {
  pauseBreaksFor30MinutesShortcut: 30 * 60 * 1000,
  pauseBreaksFor1HourShortcut: 3600 * 1000,
  pauseBreaksFor2HoursShortcut: 2 * 3600 * 1000,
  pauseBreaksFor5HoursShortcut: 5 * 3600 * 1000,
  pauseBreaksUntilMorningShortcut: null
}

function calculateInterval (name, settings) {
  if (name === 'pauseBreaksUntilMorningShortcut') {
    return new UntilMorning(settings).msToSunrise()
  }

  return intervals[name]
}

function setupBreak (name, shortcutText, settings, pauseBreaks, log, globalShortcut) {
  const shortcut = globalShortcut.register(shortcutText, () => {
    const interval = calculateInterval(name, settings)
    pauseBreaks(interval)
  })

  if (shortcut) {
    log.info(`Stretchly: ${name} registration successful (${shortcutText})`)
  } else {
    log.warn(`Stretchly: ${name} registration failed`)
  }
}

function registerPauseBreaksShortcuts (settings, pauseBreaks, log, globalShortcut) {
  for (const name of Object.keys(intervals)) {
    const shortcutText = settings.get(name)
    if (shortcutText === '') continue
    setupBreak(name, shortcutText, settings, pauseBreaks, log, globalShortcut)
  }
}

module.exports = {
  calculateInterval,
  registerPauseBreaksShortcuts,
  setupBreak
}
