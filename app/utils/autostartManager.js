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

    // Decide the Linux autostart strategy once during construction
    if (this.platform === 'linux') {
      if (insideFlatpak()) {
        this._linuxAutoLaunch = this._createFlatpakAutostarter()
      } else {
        this._linuxAutoLaunch = new AutoLaunch({ name: 'stretchly' })
      }
    }
  }

  _createFlatpakAutostarter () {
    return {
      enable: async () => {
        try {
          await this.flatpakPortalManager.initialize()
          await this.flatpakPortalManager.setAutostart(true)
          this.settings.set('flatpakAutostart', true)
        } catch (error) {
          log.error('Stretchly: Failed to set autostart (enable) via XDG Portal', error)
        }
      },
      disable: async () => {
        try {
          await this.flatpakPortalManager.initialize()
          await this.flatpakPortalManager.setAutostart(false)
          this.settings.set('flatpakAutostart', false)
        } catch (error) {
          log.error('Stretchly: Failed to set autostart (disable) via XDG Portal', error)
        }
      },
      isEnabled: async () => {
        // XDG portals don't provide a reliable query method, so we read from our cache
        return Promise.resolve(this.settings.get('flatpakAutostart', false))
      }
    }
  }

  async setAutostartEnabled (value) {
    log.info(`Stretchly: setting autostart to ${value} on ${this.platform}${this.platform === 'win32' && this.windowsStore ? ' (Windows Store)' : ''}${insideFlatpak() && this.platform === 'linux' ? ' (Flatpak)' : ''}`)
    if (this.platform === 'linux') {
      await (value ? this._linuxAutoLaunch.enable() : this._linuxAutoLaunch.disable())
    } else if (this.platform === 'win32' && this.windowsStore) {
      await (value ? this._windowsStoreAutoLaunch.enable() : this._windowsStoreAutoLaunch.disable())
    } else {
      this.app.setLoginItemSettings({ openAtLogin: value })
    }
  }

  async autoLaunchStatus () {
    if (this.platform === 'linux') {
      return await this._linuxAutoLaunch.isEnabled()
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
