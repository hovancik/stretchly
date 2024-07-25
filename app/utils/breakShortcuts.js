const { UntilMorning } = require('./untilMorning')

// Keys are the names of shortcuts in the settings,
// values are break pause intervals in milliseconds (or null if not applicable)
const shortcuts = {
  pauseBreaksFor30MinutesShortcut: 30 * 60 * 1000,
  pauseBreaksFor1HourShortcut: 3600 * 1000,
  pauseBreaksFor2HoursShortcut: 2 * 3600 * 1000,
  pauseBreaksFor5HoursShortcut: 5 * 3600 * 1000,
  pauseBreaksUntilMorningShortcut: null,
  pauseBreaksToggleShortcut: 1, // 1 means pause indefinitely
  skipToNextScheduledBreakShortcut: null,
  skipToNextMiniBreakShortcut: null,
  skipToNextLongBreakShortcut: null,
  resetBreaksShortcut: null
}

function calculateInterval (name, settings) {
  if (name === 'pauseBreaksUntilMorningShortcut') {
    return new UntilMorning(settings).msToSunrise()
  }

  return shortcuts[name]
}

function onShortcut ({ name, settings, log, breakPlanner, functions }) {
  switch (name) {
    case 'pauseBreaksToggleShortcut':
      if (breakPlanner.isPaused) {
        functions.resumeBreaks(false)
      } else {
        functions.pauseBreaks(1)
      }
      break
    case 'skipToNextScheduledBreakShortcut':
      log.info('Stretchly: skipping to next scheduled Break by shortcut')
      if (breakPlanner._scheduledBreakType === 'break') {
        functions.skipToBreak()
      } else if (breakPlanner._scheduledBreakType === 'microbreak') {
        functions.skipToMicrobreak()
      }
      break
    case 'skipToNextMiniBreakShortcut':
      log.info('Stretchly: skipping to next Mini Break by shortcut')
      functions.skipToMicrobreak()
      break
    case 'skipToNextLongBreakShortcut':
      log.info('Stretchly: skipping to next Long Break by shortcut')
      functions.skipToBreak()
      break
    case 'resetBreaksShortcut':
      log.info('Stretchly: resetting breaks by shortcut')
      functions.resetBreaks()
      break
    default: {
      const interval = calculateInterval(name, settings)
      functions.pauseBreaks(interval)
      break
    }
  }
}

function setupBreak ({ name, shortcutText, settings, log, globalShortcut, breakPlanner, functions }) {
  const shortcut = globalShortcut.register(shortcutText, () => onShortcut({ name, settings, log, breakPlanner, functions }))

  if (shortcut) {
    log.info(`Stretchly: ${name} registration successful (${shortcutText})`)
  } else {
    log.warn(`Stretchly: ${name} registration failed`)
  }
}

function registerBreakShortcuts ({ settings, log, globalShortcut, breakPlanner, functions }) {
  for (const name of Object.keys(shortcuts)) {
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
  registerBreakShortcuts,
  setupBreak
}
