const fs = require('fs')
const semver = require('semver')
const humanizeDuration = require('humanize-duration')

const formatTimeRemaining = function (milliseconds, locale, i18next = require('i18next')) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.remaining', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale, fallbacks: ['en'] })
  })
}

const formatTimeIn = function (milliseconds, locale, i18next = require('i18next')) {
  if (locale === 'pt-BR') {
    locale = 'pt'
  }
  return i18next.t('utils.inAbout', {
    count: humanizeDuration(milliseconds,
      { round: true, delimiter: ' ', language: locale, fallbacks: ['en'], units: ['d', 'h', 'm'] })
  })
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
  const seconds = Math.ceil(milliseconds / 1000.0)
  const minutes = Math.ceil(seconds / 60.0)
  return minutes
}

function shouldShowNotificationTitle (platform, systemVersion) {
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

module.exports = {
  formatTimeRemaining,
  formatTimeIn,
  canPostpone,
  canSkip,
  formatKeyboardShortcut,
  minutesRemaining,
  shouldShowNotificationTitle,
  insideFlatpak
}
