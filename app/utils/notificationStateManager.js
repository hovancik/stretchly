const EventEmitter = require('events')

class NotificationStateManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.usingNotificationState = settings.get('notificationState')
    this.timer = null
    this.isOnNotificationState = false
    if (this.usingNotificationState) {
      this.start()
    }
  }

  start () {
    this.usingNotificationState = true
    this._checkDoNotDisturb()
  }

  stop () {
    this.usingNotificationState = false
    this.isOnNotificationState = false
    clearTimeout(this.timer)
    this.timer = null
  }

  get doNotDisturb () {
    if (this.usingNotificationState) {
      return require('@meetfranz/electron-notification-state').getDoNotDisturb.getDoNotDisturb()
    } else {
      return 0
    }
  }

  _checkDoNotDisturb () {
      let lastIdleTime = 0
      this.timer = setInterval(() => {
        let doNotDisturb = this.doNotDisturb
        if (!this.isOnNotificationState && doNotDisturb == false) {
          this.isOnNotificationState = true
        } 
        if (this.isOnNotificationState && doNotDisturb == true) {
          this.isOnNotificationState = false
          if (lastIdleTime > this.settings.get('breakDuration')) {
            this.emit('naturalBreakFinished', idleTime)
          }
        }
        if (this.isOnNotificationState && idleTime > this.settings.get('breakDuration')) {
          this.emit('clearBreakScheduler')
        }
        lastIdleTime = idleTime
    }, 1000)
  }
}

module.exports = NotificationStateManager