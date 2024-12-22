import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import DndManager from '../app/utils/dndManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlink } from 'fs'

const timeout = process.env.CI ? 30000 : 10000

describe('dndManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let dndManager = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-dndManager',
      defaults: defaultSettings
    })
    dndManager = new DndManager(settings)
  })

  it('should be running with default settings', () => new Promise((resolve) => {
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    resolve()
  }))

  it('should not be running with monitorDnd: false', () => new Promise((resolve) => {
    settings.set('monitorDnd', false)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(false)
    resolve()
  }))

  it('should be running with monitorDnd: true', () => new Promise((resolve) => {
    settings.set('monitorDnd', true)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    resolve()
  }))

  it('should start when start()', () => new Promise((resolve) => {
    dndManager.stop()
    dndManager.start()
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    resolve()
  }))

  it('should stop when stop()', () => new Promise((resolve) => {
    dndManager.stop()
    dndManager.monitorDnd.should.be.equal(false)
    dndManager.isOnDnd.should.be.equal(false)
    resolve()
  }))

  it('should find correct value of LXQt config file', () => new Promise((resolve) => {
    dndManager._getConfigValue(join(__dirname, '/test-lxqt.conf'), 'doNotDisturb')
      .then(x => {
        x.should.be.equal(true)
      })
    resolve()
  }))

  afterEach(() => {
    dndManager.stop()
    dndManager = null

    if (settings) {
      unlink(join(__dirname, '/test-settings-dndManager.json'), (_) => {})
      settings = null
    }
  })
})
