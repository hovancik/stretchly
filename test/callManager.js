import { expect, vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { JSDOM } from 'jsdom'
import Store from 'electron-store'
import log from 'electron-log/main.js'
import CallManager from '../app/utils/callManager'
import defaultSettings from '../app/utils/defaultSettings'

const interval = 1000
const noCall = '{"camera":false,"microphone":false,"microphoneApps":[]}'
const cameraOn = '{"camera":true,"microphone":false,"microphoneApps":[]}'
const microphoneOn = '{"camera":false,"microphone":true,"microphoneApps":["us.zoom.xos","us.zoom.xos"]}'
const helper = join(__dirname, '../native/call-detector/build/call-detector')

describe('callManager', function () {
  let settings = null
  let callManager = null
  let supported = null
  let helperOutputs = null
  let events = null

  const poll = async (output, times = 1) => {
    for (let i = 0; i < times; i++) {
      helperOutputs.push(output)
      await vi.advanceTimersByTimeAsync(interval)
    }
  }

  const createCallManager = () => {
    callManager = new CallManager(settings)
    callManager._runHelper = vi.fn(async () => {
      const output = helperOutputs.shift()
      if (output instanceof Error) throw output
      return output
    })
    callManager.on('callStarted', source => events.push(['callStarted', source]))
    callManager.on('callFinished', () => events.push(['callFinished']))
    return callManager
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    vi.spyOn(log, 'info').mockImplementation(() => {})
    vi.spyOn(log, 'error').mockImplementation(() => {})
    supported = vi.spyOn(CallManager.prototype, 'isSupported', 'get').mockReturnValue(true)
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-callManager',
      defaults: defaultSettings
    })
    settings.set('monitorCallsCheckInterval', interval)
    helperOutputs = []
    events = []
  })

  it('is monitoring with default settings', () => {
    createCallManager()
    callManager.monitorCalls.should.be.equal(true)
    callManager.isOnCall.should.be.equal(false)
    expect(callManager.timer).not.toBeNull()
  })

  it('is not monitoring with monitorCalls: false', () => {
    settings.set('monitorCalls', false)
    createCallManager()
    callManager.monitorCalls.should.be.equal(false)
    expect(callManager.timer).toBeNull()
  })

  it('does not create a second timer when start() is called twice', () => {
    createCallManager()
    const timer = callManager.timer
    callManager.start()
    callManager.timer.should.be.equal(timer)
  })

  it('does nothing on platforms other than macOS', async () => {
    supported.mockReturnValue(false)
    createCallManager()
    expect(callManager.timer).toBeNull()
    await poll(cameraOn, 3)
    expect(callManager._runHelper).not.toHaveBeenCalled()
    callManager.isOnCall.should.be.equal(false)
    events.should.be.deep.equal([])
  })

  it('starts a call after two polls with the camera in use', async () => {
    createCallManager()
    await poll(cameraOn)
    callManager.isOnCall.should.be.equal(false)
    await poll(cameraOn)
    callManager.isOnCall.should.be.equal(true)
    callManager.callSource.should.be.equal('camera')
    events.should.be.deep.equal([['callStarted', 'camera']])
  })

  it('ignores the microphone being in use for a single poll', async () => {
    createCallManager()
    await poll(microphoneOn)
    await poll(noCall)
    await poll(microphoneOn)
    await poll(noCall)
    callManager.isOnCall.should.be.equal(false)
    events.should.be.deep.equal([])
  })

  it('reports which apps use the microphone', async () => {
    createCallManager()
    await poll(microphoneOn, 2)
    events.should.be.deep.equal([['callStarted', 'microphone (us.zoom.xos)']])
  })

  it('finishes a call after two polls without camera or microphone', async () => {
    createCallManager()
    await poll(cameraOn, 2)
    await poll(noCall)
    await poll(microphoneOn)
    await poll(noCall)
    callManager.isOnCall.should.be.equal(true)
    await poll(noCall)
    callManager.isOnCall.should.be.equal(false)
    expect(callManager.callSource).toBeNull()
    events.should.be.deep.equal([['callStarted', 'camera'], ['callFinished']])
  })

  it('assumes no call and logs once when the helper fails', async () => {
    createCallManager()
    await poll(cameraOn, 2)
    await poll(new Error('timeout'), 3)
    callManager.isOnCall.should.be.equal(false)
    events.should.be.deep.equal([['callStarted', 'camera'], ['callFinished']])
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('assumes no call when the helper output is unexpected', async () => {
    createCallManager()
    await poll('Segmentation fault', 2)
    await poll('{"camera":"yes"}', 2)
    callManager.isOnCall.should.be.equal(false)
    events.should.be.deep.equal([])
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('only reports microphone apps that look like bundle IDs', async () => {
    createCallManager()
    const apps = ['us.zoom.xos', 'pid 4242', 'com.evil\n[info]  Stretchly: resuming breaks after call',
      42, 'a'.repeat(256), 'two words', 'us.zoom.xos']
    await poll(JSON.stringify({ camera: false, microphone: true, microphoneApps: apps }), 2)
    events.should.be.deep.equal([['callStarted', 'microphone (us.zoom.xos, pid 4242)']])
  })

  it('reports at most 16 microphone apps', async () => {
    createCallManager()
    const apps = Array.from({ length: 20 }, (_, i) => `app${i}`)
    await poll(JSON.stringify({ camera: false, microphone: true, microphoneApps: apps }), 2)
    callManager.callSource.should.be.equal(`microphone (${apps.slice(0, 16).join(', ')})`)
  })

  it('assumes no call when the helper output has no list of microphone apps', async () => {
    createCallManager()
    await poll('{"camera":true,"microphone":true}', 2)
    await poll('{"camera":true,"microphone":true,"microphoneApps":"us.zoom.xos"}', 2)
    callManager.isOnCall.should.be.equal(false)
  })

  it('does not write unexpected helper output to the log', async () => {
    createCallManager()
    await poll('oops\n[2026-10-29 17:00:00.000] [info]  Stretchly: forged line', 1)
    expect(log.error).toHaveBeenCalledOnce()
    const [message, error] = log.error.mock.calls[0]
    const logged = `${message} ${error.message}`
    logged.should.not.contain('forged')
  })

  it('checks at most every second and at least every minute', async () => {
    for (const [configured, expected] of [[0, 1000], [-5, 1000], [600000, 60000], [3000, 3000]]) {
      settings.set('monitorCallsCheckInterval', configured)
      createCallManager()
      await vi.advanceTimersByTimeAsync(expected - 1)
      expect(callManager._runHelper).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1)
      expect(callManager._runHelper).toHaveBeenCalledOnce()
      callManager.stop()
    }
  })

  it('checks every 5 seconds when the interval is not a number', async () => {
    settings.set('monitorCallsCheckInterval', 'often')
    createCallManager()
    await vi.advanceTimersByTimeAsync(4999)
    expect(callManager._runHelper).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(callManager._runHelper).toHaveBeenCalledOnce()
  })

  describe('running the helper', () => {
    let helperDirectory = null

    const createHelper = (script) => {
      helperDirectory = mkdtempSync(join(tmpdir(), 'stretchly-call-detector-'))
      const path = join(helperDirectory, 'call-detector')
      writeFileSync(path, `#!/bin/sh\n${script}\n`, { mode: 0o755 })
      settings.set('monitorCalls', false)
      callManager = new CallManager(settings)
      callManager._helperPath = path
      return callManager
    }

    afterEach(async () => {
      delete process.env.STRETCHLY_TEST_SECRET
      if (helperDirectory) await rm(helperDirectory, { recursive: true, force: true })
      helperDirectory = null
    })

    it.skipIf(process.platform === 'win32')('does not pass the app environment to the helper', async () => {
      process.env.STRETCHLY_TEST_SECRET = 'leak'
      createHelper(`if [ -z "$STRETCHLY_TEST_SECRET" ]; then echo '${cameraOn}'; else echo '${noCall}'; fi`)
      const source = await callManager._detectCall()
      source.should.be.equal('camera')
    })

    it.skipIf(process.platform === 'win32')('assumes no call when the helper output is too large', async () => {
      createHelper(`printf '%s' '${cameraOn}'; i=0; while [ $i -lt 2000 ]; do printf '          '; i=$((i+1)); done`)
      const source = await callManager._detectCall()
      expect(source).toBeNull()
      expect(log.error).toHaveBeenCalledOnce()
    })
  })

  it('hides the preference together with Strict mode preferences', () => {
    const html = readFileSync(join(__dirname, '../app/preferences.html'), 'utf8')
    const { document } = new JSDOM(html).window
    expect(document.querySelector('#monitorCalls').closest('[data-strict-mode]')).not.toBeNull()
  })

  it('assumes no call when the helper is missing', async () => {
    callManager = new CallManager(settings)
    callManager._helperPath = null
    await vi.advanceTimersByTimeAsync(interval * 3)
    callManager.isOnCall.should.be.equal(false)
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('stop() ends the call without emitting callFinished', async () => {
    createCallManager()
    await poll(cameraOn, 2)
    callManager.stop()
    callManager.isOnCall.should.be.equal(false)
    expect(callManager.timer).toBeNull()
    events.should.be.deep.equal([['callStarted', 'camera']])
  })

  it('ignores a poll that was running when monitoring restarted', async () => {
    createCallManager()
    let finishPoll
    callManager._runHelper = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => { finishPoll = resolve }))
      .mockResolvedValue(cameraOn)
    await vi.advanceTimersByTimeAsync(interval)
    callManager.stop()
    callManager.start()
    finishPoll(cameraOn)
    await vi.advanceTimersByTimeAsync(interval)
    callManager.isOnCall.should.be.equal(false)
    await vi.advanceTimersByTimeAsync(interval)
    callManager.isOnCall.should.be.equal(true)
  })

  it.runIf(process.platform === 'darwin' && existsSync(helper))('reads the state from the built helper', async () => {
    settings.set('monitorCalls', false)
    callManager = new CallManager(settings)
    const state = JSON.parse(await callManager._runHelper())
    state.camera.should.be.a('boolean')
    state.microphone.should.be.a('boolean')
    state.microphoneApps.should.be.an('array')
  })

  afterEach(async () => {
    callManager?.stop()
    callManager = null
    vi.useRealTimers()
    vi.restoreAllMocks()
    await rm(join(__dirname, '/test-settings-callManager.json'), { force: true })
    settings = null
  })
})
