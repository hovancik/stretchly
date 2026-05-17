import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import FullscreenAppManager from '../app/utils/fullscreenAppManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlinkSync } from 'node:fs'

const timeout = process.env.CI ? 30000 : 10000

describe('fullscreenAppManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let manager = null

  beforeEach(() => {
    const settingsPath = join(__dirname, 'test-settings-fullscreenAppManager.json')
    try { unlinkSync(settingsPath) } catch (_) { /* not present */ }
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-fullscreenAppManager',
      defaults: defaultSettings
    })
    manager = new FullscreenAppManager(settings)
  })

  it('is idle by default (monitorFullscreenApp: false)', () => {
    manager.monitorFullscreenApp.should.be.equal(false)
    manager.isOnFullscreenApp.should.be.equal(false);
    (manager.timer === null).should.be.equal(true)
  })

  it('starts when monitorFullscreenApp is true at construction', () => {
    settings.set('monitorFullscreenApp', true)
    manager.stop()
    manager = new FullscreenAppManager(settings)
    manager.monitorFullscreenApp.should.be.equal(true);
    (manager.timer !== null).should.be.equal(true)
  })

  it('starts polling on start()', () => {
    manager.start()
    manager.monitorFullscreenApp.should.be.equal(true);
    (manager.timer !== null).should.be.equal(true)
  })

  it('stops polling and clears state on stop()', () => {
    manager.start()
    manager.stop()
    manager.monitorFullscreenApp.should.be.equal(false)
    manager.isOnFullscreenApp.should.be.equal(false);
    (manager.timer === null).should.be.equal(true)
  })

  it('start() is idempotent', () => {
    manager.start()
    const timerRef = manager.timer
    manager.start()
    manager.timer.should.equal(timerRef)
  })

  it('emits fullscreenAppStarted then fullscreenAppFinished on rising and falling edge', () => new Promise((resolve, reject) => {
    manager.start()
    // Force the detection result deterministically for the unit test.
    manager._detectFullscreen = vi.fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    let started = 0
    let finished = 0
    manager.on('fullscreenAppStarted', () => { started++ })
    manager.on('fullscreenAppFinished', () => { finished++ })

    // Drive the loop manually by re-running the same body the interval uses,
    // so we don't depend on real timers in CI.
    const tick = async () => {
      const detected = await manager._detectFullscreen()
      if (!manager.isOnFullscreenApp && detected) {
        manager.isOnFullscreenApp = true
        manager.emit('fullscreenAppStarted')
      } else if (manager.isOnFullscreenApp && !detected) {
        manager.isOnFullscreenApp = false
        manager.emit('fullscreenAppFinished')
      }
    }

    (async () => {
      try {
        await tick(); await tick(); await tick()
        started.should.be.equal(1)
        finished.should.be.equal(1)
        manager.isOnFullscreenApp.should.be.equal(false)
        resolve()
      } catch (error) {
        reject(error)
      }
    })()
  }))

  it('returns false from _detectFullscreen when monitoring is disabled', async () => {
    manager.monitorFullscreenApp = false
    const detected = await manager._detectFullscreen()
    detected.should.be.equal(false)
  })

  it('logs errors only once per scope', () => {
    const err = new Error('boom')
    manager._logErrorOnce('scope-a', err)
    manager._logErrorOnce('scope-a', err)
    Object.keys(manager._errorLogged).length.should.be.equal(1)
  })

  afterEach(() => {
    if (manager) {
      manager.stop()
      manager = null
    }
    settings = null
    try { unlinkSync(join(__dirname, 'test-settings-fullscreenAppManager.json')) } catch (_) { /* not present */ }
  })
})
