const EventEmitter = require('events')
const log = require('electron-log/main')
const psList = require('ps-list')

class AppExclusionsManager extends EventEmitter {
  constructor (settings) {
    super()
    this.timer = null
    this.appExclusion = settings.get('appExclusions').find(ex => ex.active)
    this.appExclusionsCheckInterval = settings.get('appExclusionsCheckInterval')
    this.reset()
    if (this.appExclusion) {
      this.start()
    }
  }

  reinitialize (settings) {
    clearInterval(this.timer)
    this.timer = null
    this.appExclusion = settings.get('appExclusions').find(ex => ex.active)
    this.appExclusionsCheckInterval = settings.get('appExclusionsCheckInterval')
    this.reset()
    if (this.appExclusion) {
      this.start()
    }
  }

  start () {
    this._checkRunningExceptions()
    log.info('Stretchly: starting App exclusions monitoring')
  }

  reset () {
    this.isOnAppExclusion = false
    if (this.appExclusion) {
      this.isOnAppExclusion = this.appExclusion.rule === 'resume'
    }
  }

  async _runningAppExclusion () {
    const runningCommands = await psList()
    const appExclusionCommands = this.appExclusion.commands
    let foundAppExclusion = false
    for (const appExclusionCommand of appExclusionCommands) {
      const found = runningCommands.find(el =>
        (el.cmd && el.cmd.includes(appExclusionCommand)) ||
          (el.name && el.name.includes(appExclusionCommand)))
      if (found) {
        foundAppExclusion = appExclusionCommand
        break
      }
    }
    return foundAppExclusion
  }

  _checkRunningExceptions () {
    this.timer = setInterval(async () => {
      const appExclusion = await this._runningAppExclusion()
      if (!this.isOnAppExclusion && appExclusion) {
        this.isOnAppExclusion = true
        this.emit('appExclusionStarted', this.appExclusion.rule, appExclusion)
      }
      if (this.isOnAppExclusion && !appExclusion) {
        this.isOnAppExclusion = false
        this.emit('appExclusionFinished', this.appExclusion.rule)
      }
    }, this.appExclusionsCheckInterval)
  }

  get isSchedulerCleared () {
    if (this.appExclusion === undefined) { return false }
    if (this.appExclusion.rule === 'pause') {
      return this.isOnAppExclusion
    } else {
      return !this.isOnAppExclusion
    }
  }
}

module.exports = AppExclusionsManager
