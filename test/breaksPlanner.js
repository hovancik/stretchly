import { expect, vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import { rm } from 'node:fs/promises'
import Store from 'electron-store'
import log from 'electron-log/main.js'
import BreaksPlanner from '../app/breaksPlanner'
import CallManager from '../app/utils/callManager'
import defaultSettings from '../app/utils/defaultSettings'

const interval = 1000
const noCall = '{"camera":false,"microphone":false,"microphoneApps":[]}'
const cameraOn = '{"camera":true,"microphone":false,"microphoneApps":[]}'

describe('breaksPlanner during calls', function () {
  let settings = null
  let breaksPlanner = null
  let helperOutput = null

  const poll = async (output, times = 2) => {
    helperOutput = output
    await vi.advanceTimersByTimeAsync(interval * times)
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    vi.spyOn(log, 'info').mockImplementation(() => {})
    vi.spyOn(CallManager.prototype, 'isSupported', 'get').mockReturnValue(true)
    vi.spyOn(CallManager.prototype, '_runHelper').mockImplementation(async () => helperOutput)
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-breaksPlanner',
      defaults: defaultSettings
    })
    settings.set('naturalBreaks', false)
    settings.set('monitorDnd', false)
    settings.set('monitorCallsCheckInterval', interval)
    helperOutput = noCall
    breaksPlanner = new BreaksPlanner(settings)
    breaksPlanner.nextBreak()
  })

  it('pauses breaks during a call and plans the next break when it ends', async () => {
    const updateToolTip = vi.fn()
    breaksPlanner.on('updateToolTip', updateToolTip)
    breaksPlanner.scheduler.reference.should.be.equal('startMicrobreakNotification')
    await poll(cameraOn)
    breaksPlanner.callManager.isOnCall.should.be.equal(true)
    expect(breaksPlanner.scheduler.reference).toBeNull()
    expect(updateToolTip).toHaveBeenCalledOnce()
    await poll(noCall)
    breaksPlanner.callManager.isOnCall.should.be.equal(false)
    breaksPlanner.scheduler.reference.should.be.equal('startMicrobreakNotification')
    expect(updateToolTip).toHaveBeenCalledTimes(2)
  })

  it('closes a Mini break that is showing when a call starts, marked as closed by the call', async () => {
    const finishMicrobreak = vi.fn()
    breaksPlanner.on('finishMicrobreak', finishMicrobreak)
    breaksPlanner.emit('microbreakStarted', true)
    breaksPlanner.scheduler.reference.should.be.equal('finishMicrobreak')
    await poll(cameraOn)
    expect(finishMicrobreak).toHaveBeenCalledWith(false, false, 'call')
    expect(breaksPlanner.scheduler.reference).toBeNull()
  })

  it('closes a Long break that is showing when a call starts, unless Long breaks are strict', async () => {
    settings.set('microbreakStrictMode', true)
    const finishBreak = vi.fn()
    breaksPlanner.on('finishBreak', finishBreak)
    breaksPlanner.emit('breakStarted', true)
    await poll(cameraOn)
    expect(finishBreak).toHaveBeenCalledWith(false, false, 'call')
    expect(breaksPlanner.scheduler.reference).toBeNull()
  })

  it('leaves a Strict mode Mini break open when a call starts and pauses breaks after it', async () => {
    settings.set('microbreakStrictMode', true)
    const finishMicrobreak = vi.fn()
    breaksPlanner.on('finishMicrobreak', finishMicrobreak)
    breaksPlanner.emit('microbreakStarted', true)
    await poll(cameraOn)
    breaksPlanner.callManager.isOnCall.should.be.equal(true)
    expect(finishMicrobreak).not.toHaveBeenCalled()
    breaksPlanner.scheduler.reference.should.be.equal('finishMicrobreak')
    breaksPlanner.nextBreak()
    expect(breaksPlanner.scheduler.reference).toBeNull()
    await poll(noCall)
    breaksPlanner.scheduler.reference.should.be.equal('startMicrobreakNotification')
  })

  it('leaves a Strict mode Long break open when a call starts', async () => {
    settings.set('breakStrictMode', true)
    const finishBreak = vi.fn()
    breaksPlanner.on('finishBreak', finishBreak)
    breaksPlanner.emit('breakStarted', true)
    await poll(cameraOn)
    expect(finishBreak).not.toHaveBeenCalled()
    breaksPlanner.scheduler.reference.should.be.equal('finishBreak')
  })

  it('keeps breaks paused when a break finishes, is postponed or breaks are reset during a call', async () => {
    await poll(cameraOn)
    breaksPlanner.nextBreak()
    expect(breaksPlanner.scheduler.reference).toBeNull()
    breaksPlanner.postponeCurrentBreak()
    expect(breaksPlanner.scheduler.reference).toBeNull()
    breaksPlanner.reset()
    expect(breaksPlanner.scheduler.reference).toBeNull()
    await poll(noCall)
    breaksPlanner.scheduler.reference.should.be.equal('startMicrobreakNotification')
  })

  it('keeps breaks paused when Do Not Disturb or idle time ends during a call', async () => {
    await poll(cameraOn)
    breaksPlanner.dndManager.emit('dndFinished')
    breaksPlanner.naturalBreaksManager.emit('naturalBreakFinished')
    expect(breaksPlanner.scheduler.reference).toBeNull()
  })

  it('keeps breaks paused after a call while Do Not Disturb is on', async () => {
    await poll(cameraOn)
    breaksPlanner.dndManager.isOnDnd = true
    await poll(noCall)
    breaksPlanner.callManager.isOnCall.should.be.equal(false)
    expect(breaksPlanner.scheduler.reference).toBeNull()
  })

  it('does not detect calls while breaks are paused', async () => {
    breaksPlanner.pause(1)
    expect(breaksPlanner.callManager.timer).toBeNull()
    await poll(cameraOn)
    breaksPlanner.callManager.isOnCall.should.be.equal(false)
    breaksPlanner.resume()
    await poll(cameraOn)
    breaksPlanner.callManager.isOnCall.should.be.equal(true)
    expect(breaksPlanner.scheduler.reference).toBeNull()
  })

  it('waits for breaks to resume before detecting calls when turned on while paused', () => {
    breaksPlanner.monitorCalls(false)
    breaksPlanner.pause(1)
    breaksPlanner.monitorCalls(true)
    expect(breaksPlanner.callManager.timer).toBeNull()
    breaksPlanner.resume()
    expect(breaksPlanner.callManager.timer).not.toBeNull()
  })

  it('resumes breaks when call detection is turned off during a call', async () => {
    await poll(cameraOn)
    breaksPlanner.monitorCalls(false)
    breaksPlanner.callManager.isOnCall.should.be.equal(false)
    expect(breaksPlanner.callManager.timer).toBeNull()
    breaksPlanner.scheduler.reference.should.be.equal('startMicrobreakNotification')
  })

  afterEach(async () => {
    breaksPlanner.clear()
    breaksPlanner.callManager.stop()
    breaksPlanner = null
    vi.useRealTimers()
    vi.restoreAllMocks()
    await rm(join(__dirname, '/test-settings-breaksPlanner.json'), { force: true })
    settings = null
  })
})
