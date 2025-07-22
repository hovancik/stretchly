import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { getFocusAssist } from 'windows-focus-assist'
import dbus from '@particle/dbus-next'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'

class DndManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorDnd = settings.get('monitorDnd')
    this.timer = null
    this.isOnDnd = false

    this._unsupDEErrorShown = false
    this._errorLogged = {}

    if (this.monitorDnd) {
      this.start()
    }
  }

  start () {
    this.monitorDnd = true
    this._checkDnd()
    log.info('Stretchly: starting Do Not Disturb monitoring')
    if (process.platform === 'linux') {
      log.info(`System: Your Desktop seems to be ${this._desktopEnviroment}.`)
    }
  }

  stop () {
    this.monitorDnd = false
    this.isOnDnd = false
    clearTimeout(this.timer)
    this.timer = null
    log.info('Stretchly: stopping Do Not Disturb monitoring')
  }

  get _desktopEnviroment () {
    // https://github.com/electron/electron/issues/40795
    // https://specifications.freedesktop.org/mime-apps-spec/latest/file.html
    // https://specifications.freedesktop.org/menu-spec/latest/onlyshowin-registry.html
    return process.env.ORIGINAL_XDG_CURRENT_DESKTOP ||
      process.env.XDG_CURRENT_DESKTOP || 'unknown'
  }

  async _isDndEnabledLinux () {
    const de = this._desktopEnviroment.toLowerCase()
    const sessionBus = dbus.sessionBus()
    switch (true) {
      case de.includes('kde'):
        try {
          const obj = await sessionBus.getProxyObject('org.freedesktop.Notifications', '/org/freedesktop/Notifications')
          const properties = obj.getInterface('org.freedesktop.DBus.Properties')
          const dndEnabled = await properties.Get('org.freedesktop.Notifications', 'Inhibited')
          if (await dndEnabled.value) {
            return true
          }
        } catch (e) {
          this._logErrorOnce('kde', e)
        }
        break
      case de.includes('xfce'):
        try {
          const obj = await sessionBus.getProxyObject('org.xfce.Xfconf', '/org/xfce/Xfconf')
          const properties = obj.getInterface('org.xfce.Xfconf')
          const dndEnabled = await properties.GetProperty('xfce4-notifyd', '/do-not-disturb')
          if (await dndEnabled.value) {
            return true
          }
        } catch (e) {
          this._logErrorOnce('xfce', e)
        }
        break
      case de.includes('gnome') || de.includes('unity'):
        try {
          const asyncExec = promisify(exec)
          const { stdout } = await asyncExec('gsettings get org.gnome.desktop.notifications show-banners')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'false') {
            return true
          }
        } catch (e) {
          this._logErrorOnce('gnome/unity', e)
        }
        break
      case de.includes('cinnamon'):
        try {
          const asyncExec = promisify(exec)
          const { stdout } = await asyncExec('gsettings get org.cinnamon.desktop.notifications display-notifications')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'false') {
            return true
          }
        } catch (e) {
          this._logErrorOnce('cinnamon', e)
        }
        break
      case de.includes('mate'):
        try {
          const asyncExec = promisify(exec)
          const { stdout } = await asyncExec('gsettings get org.mate.NotificationDaemon do-not-disturb')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === 'true') {
            return true
          }
        } catch (e) {
          this._logErrorOnce('mate', e)
        }
        break
      case de.includes('lxqt'):
        return await this._getConfigValue('~/.config/lxqt/notifications.conf', 'doNotDisturb')
      default:
        if (!this._unsupDEErrorShown) {
          log.info(`Stretchly: ${this._desktopEnviroment} not supported for DND detection, yet.`)
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
          wfa = getFocusAssist().value
        } catch (e) { wfa = -1 } // getFocusAssist() throw an error if OS isn't windows
        return wfa !== -1 && wfa !== 0
      } else if (process.platform === 'darwin') {
        try {
          const asyncExec = promisify(exec)
          const { stdout } = await asyncExec('defaults read com.apple.controlcenter "NSStatusItem Visible FocusModes"')
          if (stdout.replace(/[^0-9a-zA-Z]/g, '') === '1') {
            return true
          }
        } catch (e) {
          this._logErrorOnce('macos', e)
        }
      } else if (process.platform === 'linux') {
        return await this._isDndEnabledLinux()
      }
    } else {
      return false
    }
  }

  async _getConfigValue (filePath, key) {
    try {
      const data = await readFile(filePath, 'utf8')
      const lines = data.split('\n')
      for (const line of lines) {
        const [configKey, value] = line.split('=')
        if (configKey.trim() === key) {
          return value.trim().toLowerCase() === 'true'
        }
      }
      return false
    } catch (e) {
      this._logErrorOnce(`config-read-${filePath}`, e)
      return false
    }
  }

  _logErrorOnce (environment, error) {
    const errorKey = `${environment}-${error.code || error.message.substring(0, 20)}`
    if (!this._errorLogged[errorKey]) {
      log.error(`Stretchly: DND detection error in ${environment}:`, error)
      this._errorLogged[errorKey] = true
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

export default DndManager
