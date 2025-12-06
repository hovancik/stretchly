import log from 'electron-log/main.js'
import AutoLaunch from 'auto-launch'
import FlatpakPortalManager from './flatpakPortalManager.js'
import { insideFlatpak, insideWindowsStore } from './utils.js'

class AutostartManager {
  constructor ({
    app,
    settings
  }) {
    this.app = app

    this.isFlatpak = insideFlatpak()
    this.isWindowsStore = insideWindowsStore()

    if (this.isFlatpak) {
      this.flatpakPortalManager = new FlatpakPortalManager(settings)
    } else if (process.platform === 'linux') {
      this.nativeAutoLauncher = new AutoLaunch({ name: 'stretchly' })
    } else if (this.isWindowsStore) {
      this.windowsStoreAutoLauncher = new AutoLaunch({
        name: 'Stretchly',
        path: '33881JanHovancik.stretchly_24fg4m0zq65je!Stretchly',
        isHidden: true
      })
    }
  }

  async setAutostartEnabled (value) {
    log.info(`Stretchly: setting autostart to ${value} on ${process.platform}${this.isWindowsStore ? ' (Windows Store)' : ''}${this.isFlatpak ? ' (Flatpak)' : ''}`)

    if (this.isFlatpak) {
      await (value ? this.flatpakPortalManager.enableAutostart() : this.flatpakPortalManager.disableAutostart())
    } else if (process.platform === 'linux') {
      await (value ? this.nativeAutoLauncher.enable() : this.nativeAutoLauncher.disable())
    } else if (this.isWindowsStore) {
      await (value ? this.windowsStoreAutoLauncher.enable() : this.windowsStoreAutoLauncher.disable())
    } else {
      this.app.setLoginItemSettings({ openAtLogin: value })
    }
  }

  async autoLaunchStatus () {
    if (this.isFlatpak) {
      return await this.flatpakPortalManager.isAutostartEnabled()
    } else if (process.platform === 'linux') {
      return await this.nativeAutoLauncher.isEnabled()
    } else if (this.isWindowsStore) {
      return await this.windowsStoreAutoLauncher.isEnabled()
    } else {
      return this.app.getLoginItemSettings().openAtLogin
    }
  }

  disconnect () {
    if (this.flatpakPortalManager) {
      this.flatpakPortalManager.disconnect()
    }
  }
}

export default AutostartManager
