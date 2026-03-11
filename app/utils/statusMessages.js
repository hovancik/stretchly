import { formatTimeIn } from './utils.js'

class StatusMessages {
  constructor ({ breakPlanner, settings, i18next, humanizeDuration, statsManager }) {
    this.reference = breakPlanner.scheduler.reference
    this.doNotDisturb = breakPlanner.dndManager.isOnDnd
    this.appExclusionPause = breakPlanner.appExclusionsManager.isSchedulerCleared
    this.callOrSharing = breakPlanner.callAndScreenShareManager.isSchedulerCleared
    this.isInTeamsActivity = breakPlanner.callAndScreenShareManager.isInTeamsActivity
    this.isScreenSharing = breakPlanner.callAndScreenShareManager.isScreenSharing
    this.callElapsedMs = breakPlanner.callAndScreenShareManager.elapsedMs
    this.isFocusSession = breakPlanner.isFocusSession
    this.focusSessionEnd = breakPlanner.focusSessionEnd
    this.timeLeft = breakPlanner.scheduler.timeLeft
    this.timeToNextBreak = breakPlanner.timeToNextBreak
    this.isPaused = breakPlanner.isPaused
    this.breakNumber = breakPlanner.breakNumber
    this.settings = settings
    this.i18next = i18next
    this.humanizeDuration = humanizeDuration
    this.statsManager = statsManager
  }

  get trayMessage () {
    let message = ''
    if (this.reference === 'finishMicrobreak' || this.reference === 'finishBreak') {
      return message
    }

    if (this.isPaused) {
      if (this.timeLeft) {
        message += this.i18next.t('statusMessages.paused') + ' - ' +
          this.i18next.t('statusMessages.resuming') + ' ' +
          formatTimeIn(this.timeLeft, this.settings.get('language'), this.i18next, this.humanizeDuration)
        return message
      } else {
        message += this.i18next.t('statusMessages.paused') + ' ' +
          this.i18next.t('statusMessages.indefinitely')
        return message
      }
    }

    if (this.doNotDisturb) {
      message += this.i18next.t('statusMessages.paused') + ' - ' + this.i18next.t('statusMessages.dndMode')
      return message
    }

    if (this.appExclusionPause) {
      message += this.i18next.t('statusMessages.paused') + ' - ' + this.i18next.t('statusMessages.appExclusion')
      return message
    }

    if (this.callOrSharing) {
      message += this.i18next.t('statusMessages.paused') + ' - '
      if (this.isInTeamsActivity && this.isScreenSharing) {
        message += this.i18next.t('statusMessages.teamsAndSharing')
      } else if (this.isInTeamsActivity) {
        message += this.i18next.t('statusMessages.teamsActivity')
      } else if (this.isScreenSharing) {
        message += this.i18next.t('statusMessages.screenSharing')
      } else {
        message += this.i18next.t('statusMessages.callOrScreenSharing')
      }
      if (this.callElapsedMs > 0) {
        let locale = this.settings.get('language')
        if (locale === 'pt-BR') locale = 'pt'
        message += ' (' + this.humanizeDuration(this.callElapsedMs, { round: true, language: locale.replace('-', '_'), fallbacks: ['en'], units: ['h', 'm'] }) + ')'
      }
      return message
    }

    if (this.isFocusSession) {
      message += this.i18next.t('statusMessages.focusMode')
      if (this.focusSessionEnd) {
        const remaining = this.focusSessionEnd - Date.now()
        if (remaining > 0) {
          message += ' - ' + formatTimeIn(remaining, this.settings.get('language'), this.i18next, this.humanizeDuration)
        }
      }
      if (this.timeToNextBreak) {
        message += '\n' + this.i18next.t('statusMessages.nextLongBreak') + ' ' +
          formatTimeIn(this.timeToNextBreak, this.settings.get('language'), this.i18next, this.humanizeDuration)
      }
      return message
    }

    const breakInterval = this.settings.get('breakInterval') + 1
    const breakNumber = this.breakNumber % breakInterval

    if (this.reference === 'startBreak' || this.reference === 'startBreakNotification') {
      message += this.i18next.t('statusMessages.nextLongBreak') + ' ' +
        formatTimeIn(this.timeToNextBreak, this.settings.get('language'), this.i18next, this.humanizeDuration)
      return message
    }

    if (this.reference === 'startMicrobreak' || this.reference === 'startMicrobreakNotification') {
      message += this.i18next.t('statusMessages.nextMiniBreak') + ' ' +
        formatTimeIn(this.timeToNextBreak, this.settings.get('language'), this.i18next, this.humanizeDuration)
      if (this.settings.get('break')) {
        message += '\n' + this.i18next.t('statusMessages.nextLongBreak') + ' ' +
          this.i18next.t('statusMessages.afterMiniBreak', { count: breakInterval - breakNumber })
      }
      return message
    }

    return message
  }

  get statsLine () {
    if (!this.statsManager) return ''
    const stats = this.statsManager.getTodayStats()
    const streak = this.statsManager.getStreak()
    let line = this.i18next.t('statusMessages.statsToday', { taken: stats.taken, scheduled: stats.scheduled })
    if (streak.current > 0) {
      line += ' | ' + this.i18next.t('statusMessages.statsStreak', { count: streak.current })
    }
    return line
  }
}

export default StatusMessages
