import log from 'electron-log/main.js'
import AutoLaunch from 'auto-launch'
import FlatpakPortalManager from './flatpakPortalManager.js'
import { insideFlatpak } from './utils.js'

class AutostartManager {
  constructor ({
    platform,
    windowsStore,
    app,
    settings
  }) {
    this.platform = platform
    this.windowsStore = windowsStore
    this.app = app

    this.isFlatpak = this.platform === 'linux' && insideFlatpak()

    if (this.isFlatpak) {
      this.flatpakPortalManager = new FlatpakPortalManager(settings)
    } else if (this.platform === 'linux') {
      this.nativeAutoLauncher = new AutoLaunch({ name: 'stretchly' })
    }
  }

  async setAutostartEnabled (value) {
    log.info(`Stretchly: setting autostart to ${value} on ${this.platform}${this.platform === 'win32' && this.windowsStore ? ' (Windows Store)' : ''}${this.isFlatpak ? ' (Flatpak)' : ''}`)

    if (this.isFlatpak) {
      await (value ? this.flatpakPortalManager.enableAutostart() : this.flatpakPortalManager.disableAutostart())
    } else if (this.platform === 'linux') {
      await (value ? this.nativeAutoLauncher.enable() : this.nativeAutoLauncher.disable())
    } else if (this.platform === 'win32' && this.windowsStore) {
      await (value ? this._windowsStoreAutoLaunch.enable() : this._windowsStoreAutoLaunch.disable())
    } else {
      this.app.setLoginItemSettings({ openAtLogin: value })
    }
  }

  async autoLaunchStatus () {
    if (this.isFlatpak) {
      return await this.flatpakPortalManager.isAutostartEnabled()
    } else if (this.platform === 'linux') {
      return await this.nativeAutoLauncher.isEnabled()
    } else if (this.platform === 'win32' && this.windowsStore) {
      return await this._windowsStoreAutoLaunch.isEnabled()
    } else {
      return await this.app.getLoginItemSettings().openAtLogin
    }
  }

  get _windowsStoreAutoLaunch () {
    const stretchlyAutoLaunch = new AutoLaunch({
      name: 'Stretchly',
      path: '33881JanHovancik.stretchly_24fg4m0zq65je!Stretchly',
      isHidden: true
    })
    return stretchlyAutoLaunch
  }

  disconnect () {
    if (this.flatpakPortalManager) {
      this.flatpakPortalManager.disconnect()
    }
  }
}

export default AutostartManager
