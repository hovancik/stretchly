const EventEmitter = require('events')
const log = require('electron-log/main')

class DndManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorDnd = settings.get('monitorDnd')
    this.timer = null
    this.isOnDnd = false

    this._unsupDEErrorShown = false

    if (process.platform === 'win32') {
      this.windowsFocusAssist = require('windows-focus-assist')
      this.windowsQuietHours = require('windows-quiet-hours')
    } else if (process.platform === 'darwin') {
      this.macosNotificationState = require('macos-notification-state')
    } else if (process.platform === 'linux') {
      this.bus = require('dbus-final').sessionBus()
      this.util = require('node:util')
    }

    if (this.monitorDnd) {
      this.start()
    }
  }

  start () {
    this.monitorDnd = true
    this._checkDnd()
    log.info('Stretchly: starting Do Not Disturb monitoring')
    if (process.platform === 'linux') {
      log.info(`System: Your Desktop seems to be ${process.env.XDG_CURRENT_DESKTOP}`)
    }
  }

  stop () {
    this.monitorDnd = false
    this.isOnDnd = false
    clearTimeout(this.timer)
    this.timer = null
    log.info('Stretchly: stopping Do Not Disturb monitoring')
  }

  async _isDndEnabledLinux () {
    const de = process.env.XDG_CURRENT_DESKTOP.toLowerCase()
    // https://specifications.freedesktop.org/mime-apps-spec/latest/file.html
    // https://specifications.freedesktop.org/menu-spec/latest/onlyshowin-registry.html

    switch (true) {
      case de.includes('kde'):
        try {
          const obj = await this.bus.getProxyObject('org.freedesktop.Notifications', '/org/freedesktop/Notifications')
          const properties = obj.getInterface('org.freedesktop.DBus.Properties')
          const dndEnabled = await properties.Get('org.freedesktop.Notifications', 'Inhibited')
          if (await dndEnabled.value) {
            return true
          }
        } catch (e) { }
        break
      case de.includes('xfce'):
        try {
          const obj = await this.bus.getProxyObject('org.xfce.Xfconf', '/org/xfce/Xfconf')
          const properties = obj.getInterface('org.xfce.Xfconf')
          const dndEnabled = await properties.GetProperty('xfce4-notifyd', '/do-not-disturb')
          if (await dndEnabled.value) {
            return true
          }
        } catch (e) { }
        break
      case de.includes('gnome'):
        try {
          const exec = this.util.promisify(require('node:child_process').exec)
          const { stdout } = await exec('gsettings get org.gnome.desktop.notifications show-banners')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'false') {
            return true
          }
        } catch (e) { }
        break
      case de.includes('cinnamon'):
        try {
          const exec = this.util.promisify(require('node:child_process').exec)
          const { stdout } = await exec('gsettings get org.cinnamon.desktop.notifications display-notifications')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'false') {
            return true
          }
        } catch (e) { }
        break
      case de.includes('mate'):
        try {
          const exec = this.util.promisify(require('node:child_process').exec)
          const { stdout } = await exec('gsettings get org.mate.NotificationDaemon do-not-disturb')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'true') {
            return true
          }
        } catch (e) { }
        break
      case de.includes('lxqt'):
        return await this._getConfigValue('~/.config/lxqt/notifications.conf', 'doNotDisturb')
      default:
        if (!this._unsupDEErrorShown) {
          log.info(`Stretchly: ${process.env.XDG_CURRENT_DESKTOP} not supported for DND detection, yet.`)
          this._unsupDEErrorShown = true
        }
        return false
    }
  }

  async _doNotDisturb () {
    // TODO also check for session state? https://github.com/felixrieseberg/electron-notification-state/tree/master#session-state
    if (this.monitorDnd) {
      if (process.platform === 'win32') {
        let wfa = 0
        try {
          wfa = this.windowsFocusAssist.getFocusAssist().value
        } catch (e) { wfa = -1 } // getFocusAssist() throw an error if OS isn't windows
        const wqh = this.windowsQuietHours.getIsQuietHours()
        return wqh || (wfa !== -1 && wfa !== 0)
      } else if (process.platform === 'darwin') {
        return this.macosNotificationState.getDoNotDisturb()
      } else if (process.platform === 'linux') {
        return await this._isDndEnabledLinux()
      }
    } else {
      return false
    }
  }

  async _getConfigValue (filePath, key) {
    try {
      const data = await require('fs').promises.readFile(filePath, 'utf8')
      const lines = data.split('\n')
      for (const line of lines) {
        const [configKey, value] = line.split('=')
        if (configKey.trim() === key) {
          return value.trim().toLowerCase() === 'true'
        }
      }
      return false
    } catch (e) {
      return false
    }
  }

  _checkDnd () {
    this.timer = setInterval(async () => {
      const doNotDisturb = await this._doNotDisturb()
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
