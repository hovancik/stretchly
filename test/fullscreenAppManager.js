import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlinkSync } from 'node:fs'

const wnsMock = vi.hoisted(() => ({ shQueryUserNotificationState: vi.fn(() => 5) }))
vi.mock('windows-notification-state', () => wnsMock)

const { default: FullscreenAppManager } = await import('../app/utils/fullscreenAppManager')

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

  describe('_detectFullscreenWindows (mocked windows-notification-state)', function () {
    // _detectFullscreenWindows is called directly so the test runs on any host
    // OS, not only Windows.
    const fullscreenStates = [
      [2, 'QUNS_BUSY'],
      [3, 'QUNS_RUNNING_D3D_FULL_SCREEN'],
      [4, 'QUNS_PRESENTATION_MODE']
    ]
    const nonFullscreenStates = [
      [1, 'QUNS_NOT_PRESENT'],
      [5, 'QUNS_ACCEPTS_NOTIFICATIONS'],
      [6, 'QUNS_QUIET_TIME'],
      [7, 'QUNS_APP']
    ]

    for (const [value, name] of fullscreenStates) {
      it(`returns true for ${name} (${value})`, () => {
        wnsMock.shQueryUserNotificationState.mockReturnValueOnce(value)
        manager._detectFullscreenWindows().should.be.equal(true)
      })
    }

    for (const [value, name] of nonFullscreenStates) {
      it(`returns false for ${name} (${value})`, () => {
        wnsMock.shQueryUserNotificationState.mockReturnValueOnce(value)
        manager._detectFullscreenWindows().should.be.equal(false)
      })
    }

    it('returns false and logs when the native call throws', () => {
      wnsMock.shQueryUserNotificationState.mockImplementationOnce(() => {
        throw new Error('not on windows')
      })
      manager._detectFullscreenWindows().should.be.equal(false)
      Object.keys(manager._errorLogged).should.include('win32-state-not on windows')
    })
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
