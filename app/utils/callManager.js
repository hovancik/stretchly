import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import defaultSettings from './defaultSettings.js'

const helperName = 'call-detector'
const helperTimeout = 5000
const helperMaxOutput = 16 * 1024
const pollsToStartCall = 2
const pollsToFinishCall = 2
const minCheckInterval = 1000
const maxCheckInterval = 60000
const maxMicrophoneApps = 16
const microphoneAppPattern = /^(?:[A-Za-z0-9._-]{1,255}|pid \d{1,10})$/

class CallManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorCalls = settings.get('monitorCalls')
    this.timer = null
    this.isOnCall = false
    this.callSource = null
    this._pendingPolls = 0
    this._checking = false
    this._failureLogged = false
    this._unsupportedLogged = false

    if (this.monitorCalls) {
      this.start()
    }
  }

  get isSupported () {
    return process.platform === 'darwin'
  }

  get checkInterval () {
    const interval = this.settings.get('monitorCallsCheckInterval')
    if (typeof interval !== 'number' || !Number.isFinite(interval)) {
      return defaultSettings.monitorCallsCheckInterval
    }
    return Math.min(Math.max(interval, minCheckInterval), maxCheckInterval)
  }

  get helperPath () {
    if (this._helperPath === undefined) {
      const candidates = [
        process.resourcesPath && join(process.resourcesPath, helperName),
        fileURLToPath(new URL(`../../native/call-detector/build/${helperName}`, import.meta.url))
      ]
      this._helperPath = candidates.find(path => path && existsSync(path)) || null
    }
    return this._helperPath
  }

  start () {
    if (this.timer) return
    this.monitorCalls = true
    if (!this.isSupported) {
      if (!this._unsupportedLogged) {
        log.info('Stretchly: call detection is only available on macOS')
        this._unsupportedLogged = true
      }
      return
    }
    this._checkCall()
    log.info('Stretchly: starting call monitoring')
  }

  stop () {
    this.monitorCalls = false
    this.isOnCall = false
    this.callSource = null
    this._pendingPolls = 0
    if (!this.timer) return
    clearInterval(this.timer)
    this.timer = null
    log.info('Stretchly: stopping call monitoring')
  }

  _runHelper () {
    return new Promise((resolve, reject) => {
      if (!this.helperPath) {
        reject(new Error(`${helperName} not found, build it with "npm run build-call-detector"`))
        return
      }
      const options = { timeout: helperTimeout, killSignal: 'SIGKILL', maxBuffer: helperMaxOutput, env: {}, cwd: '/' }
      execFile(this.helperPath, [], options, (error, stdout) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      })
    })
  }

  async _detectCall () {
    try {
      const output = await this._runHelper()
      const { camera, microphone, microphoneApps } = parseHelperOutput(output)
      this._failureLogged = false
      const devices = []
      if (camera) devices.push('camera')
      if (microphone) {
        devices.push(microphoneApps.length ? `microphone (${microphoneApps.join(', ')})` : 'microphone')
      }
      return devices.length ? devices.join(', ') : null
    } catch (error) {
      if (!this._failureLogged) {
        log.error('Stretchly: call detection failed, assuming no call is in progress:', error)
        this._failureLogged = true
      }
      return null
    }
  }

  _update (source) {
    const detected = source !== null
    if (detected === this.isOnCall) {
      this._pendingPolls = 0
      if (detected) this.callSource = source
      return
    }
    this._pendingPolls += 1
    if (this._pendingPolls < (detected ? pollsToStartCall : pollsToFinishCall)) return
    this._pendingPolls = 0
    this.isOnCall = detected
    this.callSource = source
    this.emit(detected ? 'callStarted' : 'callFinished', source)
  }

  _checkCall () {
    const timer = setInterval(async () => {
      if (this._checking) return
      this._checking = true
      const source = await this._detectCall()
      this._checking = false
      if (this.timer === timer) {
        this._update(source)
      }
    }, this.checkInterval)
    this.timer = timer
  }
}

function parseHelperOutput (output) {
  let state = null
  try {
    state = JSON.parse(output)
  } catch {}
  if (typeof state?.camera !== 'boolean' || typeof state.microphone !== 'boolean' ||
    !Array.isArray(state.microphoneApps)) {
    throw new Error(`unexpected ${helperName} output (${String(output).length} characters)`)
  }
  const microphoneApps = state.microphoneApps
    .filter(app => typeof app === 'string' && microphoneAppPattern.test(app))
  return {
    camera: state.camera,
    microphone: state.microphone,
    microphoneApps: [...new Set(microphoneApps)].slice(0, maxMicrophoneApps)
  }
}

export default CallManager
