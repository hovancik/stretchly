const chai = require('chai')
const path = require('path')
const DndManager = require('../app/utils/dndManager')
const Store = require('electron-store')

chai.should()
const timeout = process.env.CI ? 30000 : 10000

describe('dndManager', function () {
  this.timeout(timeout)
  let settings = null
  let dndManager = null

  beforeEach(() => {
    settings = new Store({
      cwd: path.join(__dirname),
      name: 'test-settings',
      defaults: require('../app/utils/defaultSettings')
    })
    dndManager = new DndManager(settings)
  })

  it('should be running with default settings', (done) => {
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    done()
  })

  it('should not be running with monitorDnd: false', (done) => {
    settings.set('monitorDnd', false)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(false)
    done()
  })

  it('should be running with monitorDnd: true', (done) => {
    settings.set('monitorDnd', true)
    dndManager.stop()
    dndManager = null
    dndManager = new DndManager(settings)
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    done()
  })

  it('should start when start()', (done) => {
    dndManager.stop()
    dndManager.start()
    dndManager.isOnDnd.should.be.equal(false)
    dndManager.monitorDnd.should.be.equal(true)
    done()
  })

  it('should stop when stop()', (done) => {
    dndManager.stop()
    dndManager.monitorDnd.should.be.equal(false)
    dndManager.isOnDnd.should.be.equal(false)
    done()
  })

  afterEach(() => {
    dndManager.stop()
    dndManager = null

    if (settings) {
      require('fs').unlink(path.join(__dirname, '/test-settings.json'), (_) => {})
      settings = null
    }
  })
})
