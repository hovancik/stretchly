const i18next = require('i18next')

let formatRemaining = function (seconds) {
  if (seconds < 60) {
    return i18next.t('utils.secondsLeft', {count: seconds + 1})
  } else {
    return i18next.t('utils.minutesLeft', {count: Math.trunc((seconds / 60) + 1)})
  }
}

let formatTillBreak = function (milliseconds) {
  let minutes = Math.round(milliseconds / 60000)
  if (minutes < 1) {
    let seconds = Math.round((milliseconds % 60000) / 5000) * 5
    return i18next.t('utils.s', {seconds: seconds})
  } else {
    return i18next.t('utils.m', {minutes: minutes})
  }
}

let formatPauseTimeLeft = function (milliseconds) {
  let timeString = ''
  let hours = Math.floor(milliseconds / (1000 * 3600))
  let remainder = (milliseconds - hours * 1000 * 3600)
  let minutes = Math.floor(remainder / 60000)
  if (minutes >= 60) {
    minutes -= 60
    hours += 1
  }
  if (hours >= 1) {
    timeString += i18next.t('utils.h', {hours: hours})
  }
  if (minutes >= 1) {
    timeString += i18next.t('utils.m', {minutes: minutes})
  }
  if (minutes < 1 && hours < 1) {
    timeString = `${i18next.t('utils.lessThen1m')}`
  }
  return timeString
}

module.exports.formatRemaining = formatRemaining
module.exports.formatTillBreak = formatTillBreak
module.exports.formatPauseTimeLeft = formatPauseTimeLeft
