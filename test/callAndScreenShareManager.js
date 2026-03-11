import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import CallAndScreenShareManager from '../app/utils/callAndScreenShareManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlink } from 'node:fs'

const timeout = process.env.CI ? 30000 : 10000

describe('callAndScreenShareManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let manager = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-callAndScreenShareManager',
      defaults: defaultSettings
    })
    manager = new CallAndScreenShareManager(settings)
  })

  it('should have default state', () => new Promise((resolve) => {
    manager.isInCallOrSharing.should.be.equal(false)
    if (process.platform === 'darwin') {
      manager.monitorCallsAndSharing.should.be.equal(true)
    }
    resolve()
  }))

  it('should not be running with monitorCallsAndSharing: false', () => new Promise((resolve) => {
    settings.set('monitorCallsAndSharing', false)
    manager.stop()
    manager = null
    manager = new CallAndScreenShareManager(settings)
    manager.isInCallOrSharing.should.be.equal(false)
    manager.monitorCallsAndSharing.should.be.equal(false)
    resolve()
  }))

  it('should report isSchedulerCleared correctly', () => new Promise((resolve) => {
    manager.isSchedulerCleared.should.be.equal(false)
    resolve()
  }))

  it('should start when start()', () => new Promise((resolve) => {
    manager.stop()
    manager.start()
    if (process.platform === 'darwin') {
      manager.monitorCallsAndSharing.should.be.equal(true)
    }
    manager.isInCallOrSharing.should.be.equal(false)
    resolve()
  }))

  it('should stop when stop()', () => new Promise((resolve) => {
    manager.stop()
    manager.monitorCallsAndSharing.should.be.equal(false)
    manager.isInCallOrSharing.should.be.equal(false)
    resolve()
  }))

  afterEach(() => {
    if (manager) {
      manager.stop()
      manager = null
    }

    if (settings) {
      unlink(join(__dirname, '/test-settings-callAndScreenShareManager.json'), (_) => {})
      settings = null
    }
  })
})
