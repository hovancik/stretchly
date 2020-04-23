const i18next = require('i18next')

// Returns `XXX remaining`
// `About 2 hours 53 mintes remaining`
// `About 53 mintes remaining`
// `10 seconds remaining`
const formatTimeRemaining = function (milliseconds) {
  const seconds = milliseconds / 1000
  if (seconds < 60) {
    return i18next.t('utils.secondsRemaining', { seconds: Math.trunc(seconds + 1) })
  }
  if (seconds >= 60 && seconds < 3600) {
    return i18next.t('utils.aboutMinutesRemaining', { minutes: Math.trunc((seconds / 60) + 1) })
  }
  if (seconds >= 3600) {
    const hours = Math.trunc(seconds / 3600)
    const minutes = Math.trunc(((seconds - hours * 3600) / 60) + 1)
    if (seconds % 3600 === 0) {
      return i18next.t('utils.aboutHoursRemaining', { hours: hours })
    } else if (minutes === 60) {
      return i18next.t('utils.aboutHoursRemaining', { hours: hours + 1 })
    } else {
      return i18next.t('utils.aboutHoursMinutesRemaining', { minutes: minutes, hours: hours })
    }
  }
}

// Returns `XXX remaining`
// `in about 2 hours 53 mintes`
// `in about 53 mintes`
// `in 10 seconds`
const formatTimeIn = function (milliseconds) {
  const seconds = milliseconds / 1000
  if (seconds < 60) {
    return i18next.t('utils.inSeconds', { seconds: Math.trunc(seconds + 1) })
  }
  if (seconds >= 60 && seconds < 3600) {
    return i18next.t('utils.inAboutMinutes', { minutes: Math.trunc((seconds / 60) + 1) })
  }
  if (seconds >= 3600) {
    const hours = Math.trunc(seconds / 3600)
    const minutes = Math.trunc(((seconds - hours * 3600) / 60) + 1)
    if (seconds % 3600 === 0) {
      return i18next.t('utils.inAboutHours', { hours: hours })
    } else if (minutes === 60) {
      return i18next.t('utils.inAboutHours', { hours: hours + 1 })
    } else {
      return i18next.t('utils.inAboutHoursMinutes', { minutes: minutes, hours: hours })
    }
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

module.exports = {
  formatTimeRemaining,
  formatTimeIn,
  canPostpone,
  canSkip
}
