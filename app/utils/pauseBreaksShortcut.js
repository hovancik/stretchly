const { UntilMorning } = require('./untilMorning')

const intervals = {
  pauseBreaksFor30MinutesShortcut: 30 * 60 * 1000,
  pauseBreaksFor1HourShortcut: 3600 * 1000,
  pauseBreaksFor2HoursShortcut: 2 * 3600 * 1000,
  pauseBreaksFor5HoursShortcut: 5 * 3600 * 1000,
  pauseBreaksUntilMorningShortcut: null,
  pauseBreaksToggleShortcut: 1 // 1 means pause indefinitely
}

function calculateInterval (name, settings) {
  if (name === 'pauseBreaksUntilMorningShortcut') {
    return new UntilMorning(settings).msToSunrise()
  }

  return intervals[name]
}

function onShortcut ({ name, settings, breakPlanner, functions }) {
  if (name === 'pauseBreaksToggleShortcut' && breakPlanner.isPaused) {
    functions.resumeBreaks(false)
    return
  }

  const interval = calculateInterval(name, settings)
  functions.pauseBreaks(interval)
}

function setupBreak ({ name, shortcutText, settings, log, globalShortcut, breakPlanner, functions }) {
  const shortcut = globalShortcut.register(shortcutText, () => onShortcut({ name, settings, breakPlanner, functions }))

  if (shortcut) {
    log.info(`Stretchly: ${name} registration successful (${shortcutText})`)
  } else {
    log.warn(`Stretchly: ${name} registration failed`)
  }
}

function registerPauseBreaksShortcuts ({ settings, log, globalShortcut, breakPlanner, functions }) {
  for (const name of Object.keys(intervals)) {
    const shortcutText = settings.get(name)
    if (shortcutText === '') continue

    setupBreak({
      name,
      shortcutText,
      settings,
      log,
      globalShortcut,
      breakPlanner,
      functions
    })
  }
}

module.exports = {
  calculateInterval,
  onShortcut,
  registerPauseBreaksShortcuts,
  setupBreak
}
