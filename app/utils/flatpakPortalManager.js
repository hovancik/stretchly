import dbus from '@particle/dbus-next'
import log from 'electron-log/main.js'

const { Variant } = dbus

class FlatpakPortalManager {
  constructor (settings) {
    this.settings = settings
    this.bus = null
    this.portal = null
    this.initialized = false
    this.portalRequestTimeoutMs = 30000
  }

  async initialize () {
    if (this.initialized) return

    if (this.bus) {
      try {
        this.bus.disconnect()
      } catch {
        // Ignore disconnect errors
      }
      this.bus = null
      this.portal = null
    }

    try {
      this.bus = dbus.sessionBus()
      this.portal = await this.bus.getProxyObject(
        'org.freedesktop.portal.Desktop',
        '/org/freedesktop/portal/desktop'
      )
      this.initialized = true
      log.info('Stretchly: XDG Background Portal initialized successfully')
    } catch (error) {
      log.error('Stretchly: Failed to initialize XDG Background Portal:', error)
      this.initialized = false
    }
  }

  /**
   * Sets the autostart status for the application using the XDG Background Portal.
   * @param {boolean} enabled - True to enable autostart, false to disable.
   * @returns {Promise<boolean>} - True if the autostart status was successfully set.
   */
  async setAutostart (enabled) {
    await this.initialize()

    if (!this.initialized) {
      log.error('Stretchly: Cannot set autostart - portal not initialized')
      return false
    }

    try {
      const background = this.portal.getInterface('org.freedesktop.portal.Background')
      const handleToken = `stretchly_autostart_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const options = {
        handle_token: new Variant('s', handleToken),
        reason: new Variant('s', 'Stretchly needs to run in the background to remind you to take breaks'),
        autostart: new Variant('b', enabled),
        'dbus-activatable': new Variant('b', false)
      }

      // When disabling autostart, the portal doesn't create a persistent request object.
      // No Response signal is emitted, so we can return immediately.
      if (!enabled) {
        try {
          await background.RequestBackground('', options)
          log.info('Stretchly: Autostart disabled via XDG Portal')
          return true
        } catch (error) {
          log.error('Stretchly: Failed to disable autostart via XDG Portal:', error)
          return false
        }
      }

      // When enabling autostart, we must wait for the Response signal.
      // We start listening BEFORE calling the method to avoid race conditions.
      const responsePromise = this._waitForBusResponse(handleToken, enabled)

      const requestPath = await background.RequestBackground('', options)
      log.info(`Stretchly: RequestBackground called, request path: ${requestPath}`)

      return await responsePromise
    } catch (error) {
      log.error(`Stretchly: Failed to set autostart=${enabled} via XDG Portal:`, error)
      return false
    }
  }

  /**
   * Waits for the Portal Request Response signal.
   * @private
   */
  _waitForBusResponse (handleToken, expectingEnabled) {
    return new Promise((resolve) => {
      let timeoutId = null
      let messageListener = null

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        if (messageListener && this.bus) {
          this.bus.off('message', messageListener)
          messageListener = null
        }
      }

      messageListener = (msg) => {
        if (msg.interface === 'org.freedesktop.portal.Request' &&
            msg.member === 'Response' &&
            msg.path.endsWith(handleToken)) {
          const [response, results] = msg.body

          cleanup()

          log.info(`Stretchly: Portal Response signal received - response: ${response}, results:`, results)

          // Response codes: 0 = success, 1 = user cancelled, 2 = other error
          if (response === 0) {
            const autostartGranted = results && results.autostart && results.autostart.value === expectingEnabled
            if (autostartGranted) {
              log.info('Stretchly: Autostart enabled via XDG Portal')
            } else {
              log.warn('Stretchly: Autostart status did not match request', results)
            }
            resolve(autostartGranted)
          } else if (response === 1) {
            log.warn('Stretchly: User cancelled the portal request')
            resolve(false)
          } else {
            log.error(`Stretchly: Portal request failed with response code: ${response}`)
            resolve(false)
          }
        }
      }

      timeoutId = setTimeout(() => {
        cleanup()
        log.error(`Stretchly: Portal request timeout after ${this.portalRequestTimeoutMs / 1000} seconds`)
        resolve(false)
      }, this.portalRequestTimeoutMs)

      this.bus.on('message', messageListener)
    })
  }

  async enableAutostart () {
    try {
      const success = await this.setAutostart(true)
      if (success) {
        this.settings.set('openAtLogin', true)
      }
      return success
    } catch (error) {
      log.error('Stretchly: Failed to set autostart (enable) via XDG Portal', error)
      return false
    }
  }

  async disableAutostart () {
    try {
      const success = await this.setAutostart(false)
      if (success) {
        this.settings.set('openAtLogin', false)
      }
      return success
    } catch (error) {
      log.error('Stretchly: Failed to set autostart (disable) via XDG Portal', error)
      return false
    }
  }

  async isAutostartEnabled () {
    // XDG portals don't provide a reliable query method, so we read from our cache
    return this.settings.get('openAtLogin')
  }

  disconnect () {
    if (this.bus) {
      this.bus.disconnect()
      this.bus = null
      this.portal = null
      this.initialized = false
      log.info('Stretchly: XDG Background Portal disconnected')
    }
  }
}

export default FlatpakPortalManager
