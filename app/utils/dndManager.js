const EventEmitter = require('events')

class DndManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorDnd = settings.get('monitorDnd')
    this.timer = null
    this.isOnDnd = false
    if (this.monitorDnd) {
      this.start()
    }
  }

  start () {
    this.monitorDnd = true
    this._checkDnd()
  }

  stop () {
    this.monitorDnd = false
    this.isOnDnd = false
    clearTimeout(this.timer)
    this.timer = null
  }

  get doNotDisturb () {
    if (this.monitorDnd) {
      return require('@meetfranz/electron-notification-state').getDoNotDisturb()
    } else {
      return false
    }
  }

  _checkDnd () {
    let lastDndStatus = this.isOnDnd
    this.timer = setInterval(() => {
      const doNotDisturb = this.doNotDisturb
      if (!this.isOnDnd && doNotDisturb) {
        this.isOnDnd = true
        this.emit('dndStarted')
      }
      if (this.isOnDnd && !doNotDisturb) {
        this.isOnDnd = false
        this.emit('dndFinished')
      }
      lastDndStatus = doNotDisturb
    }, 1000)
  }
}

module.exports = DndManager
