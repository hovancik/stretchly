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
    this.settings = settings
    this.flatpakPortalManager = new FlatpakPortalManager()
  }

  async setAutostartEnabled (value) {
    log.info(`Stretchly: setting autostart to ${value} on ${this.platform}${this.platform === 'win32' && this.windowsStore ? ' (Windows Store)' : ''}${insideFlatpak() && this.platform === 'linux' ? ' (Flatpak)' : ''}`)
    if (this.platform === 'linux' && insideFlatpak()) {
      try {
        // Initialize portal manager first
        await this.flatpakPortalManager.initialize()

        const result = await this.flatpakPortalManager.setAutostart(value)

        // Only save to settings if portal call succeeded
        if (result) {
          this.settings.set('flatpakAutostart', value)
          log.info(`Stretchly: Saved flatpakAutostart=${value} to settings after successful portal call`)
        } else {
          log.warn('Stretchly: Portal call returned false, not saving flatpakAutostart setting')
        }
      } catch (error) {
        log.error('Stretchly: Failed to set autostart via XDG Portal. No fallback available for Flatpak.', error)
      }
    } else if (this.platform === 'linux') {
      value ? this._linuxAutoLaunch.enable() : this._linuxAutoLaunch.disable()
    } else if (this.platform === 'win32' && this.windowsStore) {
      value ? this._windowsStoreAutoLaunch.enable() : this._windowsStoreAutoLaunch.disable()
    } else {
      this.app.setLoginItemSettings({ openAtLogin: value })
    }
  }

  async autoLaunchStatus () {
    if (this.platform === 'linux' && insideFlatpak()) {
      return this.settings.get('flatpakAutostart', false)
    } else if (this.platform === 'linux') {
      return await this._linuxAutoLaunch.isEnabled()
    } else if (this.platform === 'win32' && this.windowsStore) {
      return await this._windowsStoreAutoLaunch.isEnabled()
    } else {
      return await this.app.getLoginItemSettings().openAtLogin
    }
  }

  get _linuxAutoLaunch () {
    const stretchlyAutoLaunch = new AutoLaunch({
      name: 'stretchly'
    })
    return stretchlyAutoLaunch
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
