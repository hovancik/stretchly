import { UntilMorning } from './untilMorning.js'
import { pauseBreaksDurations } from './pauseBreaksSettings.js'

// Keys are the names of shortcuts in the settings,
// values are break pause intervals in milliseconds (or null if not applicable)
const shortcuts = {
  pauseBreaksUntilMorningShortcut: null,
  pauseBreaksToggleShortcut: 1, // 1 means pause indefinitely
  skipToNextScheduledBreakShortcut: null,
  skipToNextMiniBreakShortcut: null,
  skipToNextLongBreakShortcut: null,
  resetBreaksShortcut: null,
  startLastBreakAgainShortcut: null
}

function calculateInterval (name, settings) {
  if (name === 'pauseBreaksUntilMorningShortcut') {
    return new UntilMorning(settings).msToSunrise()
  }

  return shortcuts[name]
}

function onShortcut ({ name, duration, settings, log, breakPlanner, functions }) {
  switch (name) {
    case 'pauseBreaksToggleShortcut':
      if (breakPlanner.isPaused) {
        log.info('Stretchly: resuming breaks by shortcut')
        functions.resumeBreaks(false)
      } else {
        log.info('Stretchly: pausing breaks by shortcut')
        functions.pauseBreaks(1)
      }
      break
    case 'skipToNextScheduledBreakShortcut':
      log.info('Stretchly: skipping to next scheduled break by shortcut')
      if (breakPlanner._scheduledBreakType === 'break') {
        functions.skipToBreak()
      } else if (breakPlanner._scheduledBreakType === 'microbreak') {
        functions.skipToMicrobreak()
      }
      break
    case 'skipToNextMiniBreakShortcut':
      log.info('Stretchly: skipping to next Mini break by shortcut')
      functions.skipToMicrobreak()
      break
    case 'skipToNextLongBreakShortcut':
      log.info('Stretchly: skipping to next Long break by shortcut')
      functions.skipToBreak()
      break
    case 'resetBreaksShortcut':
      log.info('Stretchly: resetting breaks by shortcut')
      functions.resetBreaks()
      break
    case 'startLastBreakAgainShortcut':
      log.info('Stretchly: starting last break again by shortcut')
      functions.startLastBreakAgain()
      break
    default: {
      log.info(`Stretchly: pausing breaks by shortcut (${name})`)
      const interval = duration ?? calculateInterval(name, settings)
      functions.pauseBreaks(interval)
      break
    }
  }
}

function setupBreak ({ name, duration, shortcutText, settings, log, globalShortcut, breakPlanner, functions }) {
  const shortcut = globalShortcut.register(shortcutText, () => onShortcut({ name, duration, settings, log, breakPlanner, functions }))

  if (shortcut) {
    log.info(`Stretchly: ${name} registration successful (${shortcutText})`)
  } else {
    log.warn(`Stretchly: ${name} registration failed`)
  }
}

function registerBreakShortcuts ({ settings, log, globalShortcut, breakPlanner, functions }) {
  for (const name of Object.keys(shortcuts)) {
    const shortcutText = settings.get(name)
    if (!shortcutText) continue

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
  for (const { duration, shortcut } of pauseBreaksDurations(settings)) {
    if (!shortcut) continue
    setupBreak({ name: 'pauseBreaksDurations', duration, shortcutText: shortcut, settings, log, globalShortcut, breakPlanner, functions })
  }
}

export {
  calculateInterval,
  onShortcut,
  registerBreakShortcuts,
  setupBreak
}
