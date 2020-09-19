// TODO if I am not wrong, formatting function are mathematically the same
// Would be nice to not have the same code
const formatTimeRemaining = function (milliseconds, i18next = require('i18next')) {
  const seconds = Math.ceil(milliseconds / 1000.0)
  const minutes = Math.ceil(seconds / 60.0)
  const hours = Math.ceil(minutes / 60.0)

  if (seconds < 60) {
    return i18next.t('utils.secondsRemaining', { seconds: seconds })
  }

  if (seconds >= 60 && minutes < 60) {
    if (seconds === 60) {
      return i18next.t('utils.aboutMinutesRemaining', { minutes: 2 })
    }
    return i18next.t('utils.aboutMinutesRemaining', { minutes: minutes })
  }

  if (minutes >= 60) {
    if (minutes % 60 === 0) {
      return i18next.t('utils.aboutHoursRemaining', { hours: hours })
    }
    return i18next.t('utils.aboutHoursMinutesRemaining',
      { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
  }
  return 'Unknown time remaining'
}

const formatTimeIn = function (milliseconds, i18next = require('i18next')) {
  const seconds = Math.ceil(milliseconds / 1000.0)
  const minutes = Math.ceil(seconds / 60.0)
  const hours = Math.ceil(minutes / 60.0)

  if (seconds < 60) {
    return i18next.t('utils.inSeconds', { seconds: seconds })
  }

  if (seconds >= 60 && minutes < 60) {
    if (seconds === 60) {
      return i18next.t('utils.inAboutMinutes', { minutes: 2 })
    }
    return i18next.t('utils.inAboutMinutes', { minutes: minutes })
  }

  if (minutes >= 60) {
    if (minutes % 60 === 0) {
      return i18next.t('utils.inAboutHours', { hours: hours })
    } else {
      return i18next.t('utils.inAboutHoursMinutes',
        { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
    }
  }
  return 'in unknown time'
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

function formatShortTimeRemaining(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000.0)
  const format = val => `0${Math.floor(val)}`.slice(-2)
  const hours = seconds / 3600
  const minutes = (seconds % 3600) / 60
  availableTime = new Array()
  if (hours >= 1){
    availableTime.push(hours)
    availableTime.push(minutes)
    availableTime.push(seconds % 60)
  }else if (minutes >= 1){
    availableTime.push(minutes)
    availableTime.push(seconds % 60)
  }else{
    availableTime.push(seconds % 60)
  }

  return availableTime.map(format).join(':')
}

module.exports = {
  formatTimeRemaining,
  formatTimeIn,
  canPostpone,
  canSkip,
  formatKeyboardShortcut,
  formatShortTimeRemaining,
}
