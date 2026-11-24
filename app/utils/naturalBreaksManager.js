import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { desktopIdle } from 'node-desktop-idle-v2'
import { powerMonitor } from 'electron'

class NaturalBreaksManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.usingNaturalBreaks = settings.get('naturalBreaks')
    this.naturalBreaksCheckInterval = settings.get('naturalBreaksCheckInterval')
    this.timer = null
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    // Once powerMonitor reports a non-zero idle time we know it works on this
    // platform. From then on a 0 means "user is active", not "unsupported".
    this.powerMonitorWorks = false
    if (this.usingNaturalBreaks) {
      this.start()
    }
  }

  start () {
    if (this.timer) return
    this.usingNaturalBreaks = true
    desktopIdle.startMonitoring()
    this.monitoringStartedAt = Date.now()
    this._checkIdleTime()
    log.info('Stretchly: starting Idle time monitoring')
  }

  stop () {
    if (!this.timer) return
    this.usingNaturalBreaks = false
    this.isOnNaturalBreak = false
    this.isSchedulerCleared = false
    clearInterval(this.timer)
    this.timer = null
    desktopIdle.stopMonitoring()
    log.info('Stretchly: stopping Idle time monitoring')
  }

  get idleTime () {
    if (this.usingNaturalBreaks) {
      return this._idleSeconds(powerMonitor.getSystemIdleTime(), () => desktopIdle.getIdleTime()) * 1000
    } else {
      return 0
    }
  }

  // powerMonitor returns 0 both when the user is active and when idle time is
  // not supported (e.g. some Wayland compositors). Falling back on every 0
  // breaks platforms where powerMonitor works but desktopIdle does not
  // (KDE Wayland without access to /dev/input: desktopIdle then reports the
  // time since start, which pauses breaks 5 minutes after launch).
  _idleSeconds (powerMonitorSeconds, getFallbackSeconds) {
    if (powerMonitorSeconds > 0) {
      if (!this.powerMonitorWorks) {
        this.powerMonitorWorks = true
        log.info('Stretchly: powerMonitor idle time works, not using desktopIdle fallback')
      }
      return powerMonitorSeconds
    }
    if (this.powerMonitorWorks) return 0
    const fallbackSeconds = getFallbackSeconds()
    // If desktopIdle cannot read input devices it never sees any event and
    // just reports the time since monitoring started. Such a value carries
    // no information about the user, so ignore it.
    const secondsSinceStart = (Date.now() - this.monitoringStartedAt) / 1000
    if (fallbackSeconds >= secondsSinceStart - 2) return 0
    return fallbackSeconds
  }

  _checkIdleTime () {
    let lastIdleTime = 0
    this.timer = setInterval(() => {
      const idleTime = this.idleTime
      if (!this.isOnNaturalBreak && idleTime > 20000) {
        this.isOnNaturalBreak = true
      }
      if (this.isOnNaturalBreak && idleTime < 20000) {
        this.isOnNaturalBreak = false
        if (lastIdleTime > this.settings.get('naturalBreaksInactivityResetTime')) {
          this.isSchedulerCleared = false
          this.emit('naturalBreakFinished')
        }
      }
      if (this.isOnNaturalBreak && idleTime > this.settings.get('naturalBreaksInactivityResetTime')) {
        this.isSchedulerCleared = true
        this.emit('clearBreakScheduler')
      }
      lastIdleTime = idleTime
    }, this.naturalBreaksCheckInterval)
  }
}

export default NaturalBreaksManager
