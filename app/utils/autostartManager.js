const log = require('electron-log/main')

class AutostartManager {
  constructor ({
    platform,
    windowsStore,
    app
  }) {
    this.platform = platform
    this.windowsStore = windowsStore
    this.app = app
  }

  setAutostartEnabled (value) {
    if (this.platform === 'linux') {
      value ? this._linuxAutoLaunch.enable() : this._linuxAutoLaunch.disable()
    } else if (process.platform === 'win32' && process.windowsStore) {
      value ? this._windowsStoreAutoLaunch.enable() : this._windowsStoreAutoLaunch.disable()
    } else {
      this.app.setLoginItemSettings({ openAtLogin: value })
    }
    log.info(`Stretchly: setting autostart to ${value} on ${this.platform}${this.platform === 'win32' && this.windowsStore ? ' (Windows Store)' : ''}`)
  }

  async autoLaunchStatus () {
    if (this.platform === 'linux') {
      return await this._linuxAutoLaunch.isEnabled()
    } else if (this.platform === 'win32' && this.windowsStore) {
      return await this._windowsStoreAutoLaunch.isEnabled()
    } else {
      return Promise.resolve(this.app.getLoginItemSettings().openAtLogin)
    }
  }

  get _linuxAutoLaunch () {
    const AutoLaunch = require('auto-launch')
    const stretchlyAutoLaunch = new AutoLaunch({
      name: 'stretchly'
    })
    return stretchlyAutoLaunch
  }

  get _windowsStoreAutoLaunch () {
    const AutoLaunch = require('auto-launch')
    const stretchlyAutoLaunch = new AutoLaunch({
      name: 'Stretchly',
      path: '33881JanHovancik.stretchly_24fg4m0zq65je!Stretchly',
      isHidden: true
    })
    return stretchlyAutoLaunch
  }
}

module.exports = AutostartManager
