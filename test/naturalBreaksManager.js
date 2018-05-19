const chai = require('chai')
let NaturalBreaksManager = require('../app/utils/naturalBreaksManager')
const Settings = require('./../app/utils/settings')
const testSettingsLocaction = `${__dirname}/test-settings.json`

chai.should()

describe('naturalBreaksManager', function () {
  let settings = null
  let naturalBreaksManager = null

  beforeEach(() => {
    settings = new Settings(testSettingsLocaction)
    naturalBreaksManager = new NaturalBreaksManager(settings)
  })

  it('should be running with default settings', () => {
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should not be running with naturalBreaks: false', () => {
    settings.set('naturalBreaks', false)
    naturalBreaksManager.stop()
    naturalBreaksManager = null
    naturalBreaksManager = new NaturalBreaksManager(settings)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(false)
  })

  it('should be running with naturalBreaks: true', () => {
    settings.set('naturalBreaks', true)
    naturalBreaksManager.stop()
    naturalBreaksManager = null
    naturalBreaksManager = new NaturalBreaksManager(settings)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should start when start()', () => {
    naturalBreaksManager.stop()
    naturalBreaksManager.start()
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should stop when stop()', () => {
    naturalBreaksManager.stop()
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(false)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.idleTime.should.be.equal(0)
  })

  afterEach(() => {
    naturalBreaksManager.stop()
    naturalBreaksManager = null

    if (settings && settings.destroy) {
      settings.destroy()
      settings = null
    }
  })
})
