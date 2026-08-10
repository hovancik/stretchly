import fs from 'node:fs'

function formatTimeRemaining (milliseconds, locale, i18next, humanizeDuration) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.remaining', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale.replace('-', '_'), fallbacks: ['en'] })
  })
}

function formatSkippableIn (milliseconds, locale, i18next, humanizeDuration) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.skippableIn', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale.replace('-', '_'), fallbacks: ['en'] })
  })
}

function formatElapsedDuration (milliseconds, locale, i18next, humanizeDuration) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.elapsed', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale.replace('-', '_'), fallbacks: ['en'] })
  })
}

function formatTimeIn (milliseconds, locale, i18next, humanizeDuration) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.inAbout', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale.replace('-', '_'), fallbacks: ['en'], units: ['d', 'h', 'm'] })
  })
}

function formatUnitAndValue (unit, value, i18next) {
  if (unit === 'seconds') {
    if (value < 60) {
      return i18next.t('utils.seconds', { count: parseInt(value) })
    } else {
      const val = parseFloat((value / 60).toFixed(1))
      if (val % 1 === 0) {
        return i18next.t('utils.minutes', { count: parseInt(val) })
      } else {
        return i18next.t('utils.minutes', { count: parseFloat(val) })
      }
    }
  } else {
    return i18next.t(`utils.${unit}`, { count: parseInt(value) })
  }
}

// exits are locked for the opening `lockedPercent` of the break
function isLocked (passedPercent, lockedPercent) {
  return passedPercent < lockedPercent
}

// does not consider `postponesLimit`
function canPostpone (postpone, passedPercent, postponePercent, lockedPercent = 0) {
  return !isLocked(passedPercent, lockedPercent) &&
    postpone && passedPercent <= postponePercent
}

// does not consider `postponesLimit`
function canSkip (strictMode, postpone, passedPercent, postponePercent, lockedPercent = 0) {
  return !isLocked(passedPercent, lockedPercent) &&
    !((postpone && passedPercent <= postponePercent) || strictMode)
}

function formatKeyboardShortcut (keyboardShortcut) {
  return keyboardShortcut.replace('Or', '/').replace('+', ' + ')
}

function minutesRemaining (milliseconds) {
  return Math.round(milliseconds / 60000.0)
}

function shouldShowNotificationTitle (platform, systemVersion, semver) {
  if (platform === 'win32' && semver.gte(semver.coerce(systemVersion), '10.0.19042')) {
    return false
  }
  if (platform === 'darwin' && semver.gte(semver.coerce(systemVersion), '10.16.0')) {
    return false
  }
  return true
}

function insideFlatpak (runtime = process, fileExists = fs.existsSync) {
  return runtime.platform === 'linux' && fileExists('/.flatpak-info')
}

function insideWindowsStore (runtime = process) {
  return runtime.platform === 'win32' && !!runtime.windowsStore
}

function insideSnap (runtime = process) {
  return runtime.platform === 'linux' && !!runtime.env.SNAP
}

function insideWindowsPortable (runtime = process) {
  return runtime.platform === 'win32' && !!runtime.env.PORTABLE_EXECUTABLE_DIR
}

function getLinuxDisplayBackend (ozonePlatform = '', runtime = process) {
  if (runtime.platform !== 'linux') return null

  const normalizedOzonePlatform = ozonePlatform.trim().toLowerCase()
  if (normalizedOzonePlatform === 'wayland' || normalizedOzonePlatform === 'x11') {
    return normalizedOzonePlatform
  }

  const normalizedSessionType = (runtime.env.XDG_SESSION_TYPE || '').trim().toLowerCase()
  if (normalizedSessionType === 'wayland' || normalizedSessionType === 'x11') {
    return normalizedSessionType
  }

  if (runtime.env.WAYLAND_DISPLAY) return 'wayland'
  if (runtime.env.DISPLAY) return 'x11'
  return null
}

export {
  formatTimeRemaining,
  formatSkippableIn,
  formatElapsedDuration,
  formatTimeIn,
  formatUnitAndValue,
  canPostpone,
  canSkip,
  formatKeyboardShortcut,
  minutesRemaining,
  shouldShowNotificationTitle,
  insideFlatpak,
  insideWindowsStore,
  insideSnap,
  insideWindowsPortable,
  getLinuxDisplayBackend
}
