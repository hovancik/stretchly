const i18next = require('i18next')

const formatRemaining = function (seconds) {
  if (seconds < 60) {
    return i18next.t('utils.secondsLeft', {count: seconds + 1})
  }
  return i18next.t('utils.minutesLeft', {count: Math.trunc((seconds / 60) + 1)})
}

const formatTillBreak = function (milliseconds) {
  const minutes = Math.round(milliseconds / 60000)
  if (minutes < 1) {
    const seconds = Math.round((milliseconds % 60000) / 5000) * 5
    return i18next.t('utils.s', {seconds: seconds})
  }
  return i18next.t('utils.m', {minutes: minutes})
}

const formatPauseTimeLeft = function (milliseconds) {
  let timeString = ''
  let hours = Math.floor(milliseconds / (1000 * 3600))
  const remainder = (milliseconds - hours * 1000 * 3600)
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
    timeString = `${i18next.t('utils.lessThan1m')}`
  }
  return timeString
}

function formatTimeOfNextBreak (time) {
  let hours = new Date(Date.now() + time).getHours()
  let minutes = new Date(Date.now() + time).getMinutes()
  minutes = String(minutes).padStart(2, '0')
  return [hours, minutes]
}

module.exports = {
  formatRemaining,
  formatTillBreak,
  formatPauseTimeLeft,
  formatTimeOfNextBreak
}
