const chai = require('chai')
const path = require('path')
const DndManager = require('../app/utils/dndManager')
const Settings = require('./../app/utils/settings')
const testSettingsLocaction = path.join(__dirname, '/test-settings.json')

chai.should()

describe('dndManager', function () {
  let settings = null
  let dndManager = null

  beforeEach(() => {
    settings = new Settings(testSettingsLocaction)
    dndManager = new DndManager(settings)
  })

  it('should be running with default settings', () => {
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
  })

  it('should not be running with monitorDnd: false', () => {
    settings.set('monitorDnd', false)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(false)
  })

  it('should be running with monitorDnd: true', () => {
    settings.set('monitorDnd', true)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
  })

  it('should start when start()', () => {
    dndManager.stop()
    dndManager.start()
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
  })

  it('should stop when stop()', () => {
    dndManager.stop()
    dndManager.monitorDnd.should.be.equal(false)
    dndManager.isOnDnd.should.be.equal(false)
  })

  afterEach(() => {
    dndManager.stop()
    dndManager = null

    if (settings && settings.destroy) {
      settings.destroy()
      settings = null
    }
  })
})
