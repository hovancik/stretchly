const i18next = require('i18next')
const Utils = require('./utils')

class StatusMessages {
  constructor ({ breakPlanner, settings }) {
    this.reference = breakPlanner.scheduler.reference
    this.doNotDisturb = breakPlanner.dndManager.isOnDnd
    this.appExclusionPause = breakPlanner.appExclusionsManager.isSchedulerCleared
    this.timeLeft = breakPlanner.scheduler.timeLeft
    this.isPaused = breakPlanner.isPaused
    this.breakNumber = breakPlanner.breakNumber
    this.settings = settings
  }

  get trayMessage () {
    let message = ''
    if (this.reference === 'finishMicrobreak' || this.reference === 'finishBreak') {
      return message
    }

    if (this.isPaused) {
      if (this.timeLeft) {
        message += i18next.t('statusMessages.paused') + ' - ' +
          i18next.t('statusMessages.resuming') + ' ' +
          Utils.formatTimeIn(this.timeLeft)
        return message
      } else {
        message += i18next.t('statusMessages.paused') + ' ' +
          i18next.t('statusMessages.indefinitely')
        return message
      }
    }

    if (this.doNotDisturb) {
      message += i18next.t('statusMessages.paused') + ' - ' + i18next.t('statusMessages.dndMode')
      return message
    }

    if (this.appExclusionPause) {
      message += i18next.t('statusMessages.paused') + ' - ' + i18next.t('statusMessages.appExclusion')
      return message
    }

    const breakInterval = this.settings.get('breakInterval') + 1
    const breakNumber = this.breakNumber % breakInterval
    const breakNotificationInterval = this.settings.get('breakNotification')
      ? this.settings.get('breakNotificationInterval')
      : 0
    const microbreakNotificationInterval = this.settings.get('microbreakNotification')
      ? this.settings.get('microbreakNotificationInterval')
      : 0
    i18next.t('main.nextBreakFollowing', { count: breakInterval - breakNumber })

    if (this.reference === 'startBreak') {
      message += i18next.t('statusMessages.nextLongBreak') + ' ' +
        Utils.formatTimeIn(this.timeLeft)
      return message
    }

    if (this.reference === 'startMicrobreak') {
      message += i18next.t('statusMessages.nextMiniBreak') + ' ' +
        Utils.formatTimeIn(this.timeLeft)
      if (this.settings.get('break')) {
        message += '\n' + i18next.t('statusMessages.nextLongBreak') + ' ' +
          i18next.t('statusMessages.afterMiniBreak', { count: breakInterval - breakNumber })
      }
      return message
    }

    if (this.reference === 'startBreakNotification') {
      message += i18next.t('statusMessages.nextLongBreak') + ' ' +
        Utils.formatTimeIn(this.timeLeft + breakNotificationInterval)
      return message
    }

    if (this.reference === 'startMicrobreakNotification') {
      message += i18next.t('statusMessages.nextMiniBreak') + ' ' +
        Utils.formatTimeIn(this.timeLeft + microbreakNotificationInterval)
      if (this.settings.get('break')) {
        message += '\n' + i18next.t('statusMessages.nextLongBreak') + ' ' +
          i18next.t('statusMessages.afterMiniBreak', { count: breakInterval - breakNumber })
      }
      return message
    }

    return message
  }
}

module.exports = StatusMessages
