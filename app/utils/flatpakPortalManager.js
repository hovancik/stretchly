import dbus from '@particle/dbus-next'
import log from 'electron-log/main.js'

const { Variant } = dbus

class FlatpakPortalManager {
  constructor () {
    this.bus = null
    this.portal = null
    this.initialized = false
  }

  async initialize () {
    if (this.initialized) return

    // Clean up any stale connection first
    if (this.bus) {
      try {
        this.bus.disconnect()
      } catch (err) {
        // Ignore errors disconnecting stale connection
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
      throw error
    }
  }

  /**
   * Sets the autostart status for the application using the XDG Background Portal.
   * @param {boolean} enabled - True to enable autostart, false to disable.
   * @returns {Promise<boolean>} - True if the autostart status was successfully set.
   */
  async setAutostart (enabled) {
    // Ensure initialized (safe to call multiple times)
    await this.initialize()

    try {
      const background = this.portal.getInterface('org.freedesktop.portal.Background')

      // Create a unique handle token for this request
      const handleToken = `stretchly_autostart_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const options = {
        handle_token: new Variant('s', handleToken),
        reason: new Variant('s', 'Stretchly needs to run in the background to remind you to take breaks'),
        autostart: new Variant('b', enabled),
        'dbus-activatable': new Variant('b', false)
      }

      // When DISABLING, the portal doesn't create a persistent request object
      // It's a fire-and-forget operation - no Response signal to wait for
      if (!enabled) {
        await background.RequestBackground('', options)
        log.info('Stretchly: Autostart disabled via XDG Portal (no response expected).')
        return true
      }

      // When ENABLING, we must wait for the Response signal
      return new Promise((resolve) => {
        const timeoutMs = 30000 // 30 second timeout
        let timeoutId = null
        let messageListener = null // Store the listener function here

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          if (messageListener && this.bus) {
            // The actual listener removal
            this.bus.off('message', messageListener)
            messageListener = null
          }
        }

        // Define the listener function
        messageListener = (msg) => {
          // Check if this message is the one we're waiting for
          if (msg.interface === 'org.freedesktop.portal.Request' &&
              msg.member === 'Response' &&
              msg.path.includes(handleToken)) {
            const [response, results] = msg.body

            cleanup() // Clean up immediately (removes listener + timeout)

            log.info(`Stretchly: Portal Response signal received - response: ${response}, results:`, results)

            if (response === 0) { // Success
              const autostartGranted = results && results.autostart && results.autostart.value === enabled
              if (autostartGranted) {
                log.info('Stretchly: Autostart successfully enabled via XDG Portal.')
              } else {
                log.warn('Stretchly: Autostart status did not match request. Results:', results)
              }
              resolve(autostartGranted)
            } else if (response === 1) { // User cancelled
              log.warn('Stretchly: User cancelled the portal request.')
              resolve(false)
            } else { // Other error
              log.error(`Stretchly: Portal request failed with response code: ${response}`)
              resolve(false)
            }
          }
        }

        // Set the timeout
        timeoutId = setTimeout(() => {
          cleanup() // This will now remove the listener
          log.error('Stretchly: Portal request timeout after 30 seconds')
          resolve(false)
        }, timeoutMs)

        // Listen for Response signals
        this.bus.on('message', messageListener) // Register the named listener

        // NOW make the request
        background.RequestBackground('', options)
          .then(requestPath => {
            log.info(`Stretchly: RequestBackground called for autostart=true, request path: ${requestPath}`)
          })
          .catch(err => {
            cleanup() // This will now remove the listener
            log.error('Stretchly: Failed to call RequestBackground:', err)
            resolve(false)
          })
      })
    } catch (error) {
      log.error(`Stretchly: Failed to set autostart=${enabled} via XDG Portal:`, error)
      throw error
    }
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
