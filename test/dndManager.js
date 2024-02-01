const chai = require('chai')
const path = require('path')
const DndManager = require('../app/utils/dndManager')
const Store = require('electron-store')

chai.should()
const timeout = process.env.CI ? 30000 : 10000

describe('dndManager', function () {
  globalThis.vi.setConfig({ testTimeout: timeout })
  let settings = null
  let dndManager = null

  beforeEach(() => {
    settings = new Store({
      cwd: path.join(__dirname),
      name: 'test-settings-dndManager',
      defaults: require('../app/utils/defaultSettings')
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

  afterEach(() => {
    dndManager.stop()
    dndManager = null

    if (settings) {
      require('fs').unlink(path.join(__dirname, '/test-settings-dndManager.json'), (_) => {})
      settings = null
    }
  })
})
