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

// does not consider `postponesLimit`
function canPostpone (postpone, passedPercent, postponePercent) {
  return postpone && passedPercent <= postponePercent
}

// does not consider `postponesLimit`
function canSkip (strictMode, postpone, passedPercent, postponePercent) {
  return !((postpone && passedPercent <= postponePercent) || strictMode)
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

function insideFlatpak () {
  const flatpakInfoPath = '/.flatpak-info'
  return fs.existsSync(flatpakInfoPath)
}

export {
  formatTimeRemaining,
  formatTimeIn,
  formatUnitAndValue,
  canPostpone,
  canSkip,
  formatKeyboardShortcut,
  minutesRemaining,
  shouldShowNotificationTitle,
  insideFlatpak
}
