const EventEmitter = require('events')
const log = require('electron-log')

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
    log.info('Stretchly: starting Do Not Disturb monitoring')
  }

  stop () {
    this.monitorDnd = false
    this.isOnDnd = false
    clearTimeout(this.timer)
    this.timer = null
    log.info('Stretchly: stopping Do Not Disturb monitoring')
  }

  get _doNotDisturb () {
    if (this.monitorDnd) {
      let focusAssist
      try {
        focusAssist = require('windows-focus-assist').getFocusAssist().value
      } catch (e) { focusAssist = -1 } // getFocusAssist() throw an error if OS isn't windows

      return require('electron-notification-state').getDoNotDisturb() || (focusAssist !== -1 && focusAssist !== 0)
    } else {
      return false
    }
  }

  _checkDnd () {
    this.timer = setInterval(() => {
      const doNotDisturb = this._doNotDisturb
      if (!this.isOnDnd && doNotDisturb) {
        this.isOnDnd = true
        this.emit('dndStarted')
      }
      if (this.isOnDnd && !doNotDisturb) {
        this.isOnDnd = false
        this.emit('dndFinished')
      }
    }, 1000)
  }
}

module.exports = DndManager
