import 'chai/register-should'
import { join } from 'path'
import NaturalBreaksManager from '../app/utils/naturalBreaksManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { rm } from 'node:fs/promises'

describe('naturalBreaksManager', function () {
  let settings = null
  let naturalBreaksManager = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-naturalBreaksManager',
      defaults: defaultSettings
    })
    naturalBreaksManager = new NaturalBreaksManager(settings)
  })

  it('should be running with default settings', () => {
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.isSchedulerCleared.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should not be running with naturalBreaks: false', () => {
    settings.set('naturalBreaks', false)
    naturalBreaksManager.stop()
    naturalBreaksManager = null
    naturalBreaksManager = new NaturalBreaksManager(settings)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.isSchedulerCleared.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(false)
  })

  it('should be running with naturalBreaks: true', () => {
    settings.set('naturalBreaks', true)
    naturalBreaksManager.stop()
    naturalBreaksManager = null
    naturalBreaksManager = new NaturalBreaksManager(settings)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.isSchedulerCleared.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should start when start()', () => {
    naturalBreaksManager.stop()
    naturalBreaksManager.start()
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.isSchedulerCleared.should.be.equal(false)
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(true)
  })

  it('should stop when stop()', () => {
    naturalBreaksManager.stop()
    naturalBreaksManager.usingNaturalBreaks.should.be.equal(false)
    naturalBreaksManager.isSchedulerCleared.should.be.equal(false)
    naturalBreaksManager.isOnNaturalBreak.should.be.equal(false)
    naturalBreaksManager.idleTime.should.be.equal(0)
  })

  it('does not create a second timer when start() is called twice', () => {
    naturalBreaksManager.stop()
    naturalBreaksManager.start()
    const timer = naturalBreaksManager.timer
    naturalBreaksManager.start()
    naturalBreaksManager.timer.should.be.equal(timer)
  })

  it('uses fallback while powerMonitor has only reported 0', () => {
    naturalBreaksManager.monitoringStartedAt = Date.now() - 1000 * 1000
    naturalBreaksManager._idleSeconds(0, () => 400).should.be.equal(400)
    naturalBreaksManager.powerMonitorWorks.should.be.equal(false)
  })

  it('ignores fallback that never saw any input since start', () => {
    naturalBreaksManager.monitoringStartedAt = Date.now() - 400 * 1000
    naturalBreaksManager._idleSeconds(0, () => 400).should.be.equal(0)
  })

  it('stops using fallback once powerMonitor reports idle time', () => {
    naturalBreaksManager.monitoringStartedAt = Date.now() - 1000 * 1000
    naturalBreaksManager._idleSeconds(0, () => 400).should.be.equal(400)
    naturalBreaksManager._idleSeconds(3, () => 400).should.be.equal(3)
    naturalBreaksManager.powerMonitorWorks.should.be.equal(true)
    naturalBreaksManager._idleSeconds(0, () => 400).should.be.equal(0)
  })

  afterEach(async () => {
    naturalBreaksManager.stop()
    naturalBreaksManager = null

    if (settings) {
      await rm(join(__dirname, '/test-settings-naturalBreaksManager.json'), { force: true })
      settings = null
    }
  })
})
