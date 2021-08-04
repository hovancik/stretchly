const chai = require('chai')
const path = require('path')
const AppExclusionsManager = require('../app/utils/appExclusionsManager')
const Store = require('electron-store')

chai.should()

describe('appExclusionsManager', function () {
  let settings
  let appExclusionsManager

  beforeEach(() => {
    settings = new Store({
      cwd: path.join(__dirname),
      name: 'test-settings',
      defaults: require('../app/utils/defaultSettings')
    })
    appExclusionsManager = null
  })

  it('app should be running with default settings', (done) => {
    appExclusionsManager = new AppExclusionsManager(settings)
     clearInterval(appExclusionsManager.timer)
      appExclusionsManager.isOnAppExclusion.should.be.equal(false)
      appExclusionsManager.isSchedulerCleared.should.be.equal(false)
      done()
  } 
  ).timeout(10000)

  it('app should be running with default settings also after reinitialize', (done) => {
    appExclusionsManager = new AppExclusionsManager(settings)
    appExclusionsManager.reinitialize(settings)
    setTimeout(() => {
      clearInterval(appExclusionsManager.timer)
      appExclusionsManager.isOnAppExclusion.should.be.equal(false)
      appExclusionsManager.isSchedulerCleared.should.be.equal(false)
      done()
    }, 1500)
  })

  it('app should take the first active rule', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [
        {
          rule: 'resume',
          active: false,
          commands: [runningCmd]
        }, {
          rule: 'pause',
          active: true,
          commands: [runningCmd]
        }, {
          rule: 'resume',
          active: true,
          commands: [runningCmd]
        }
      ])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(true)
        appExclusionsManager.isSchedulerCleared.should.be.equal(true)
        done()
      }, 1500)
    })
  })

  it('app should be runnig when no rule is active', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [
        {
          rule: 'resume',
          active: false,
          commands: [runningCmd]
        }, {
          rule: 'pause',
          active: false,
          commands: [runningCmd]
        }, {
          rule: 'resume',
          active: false,
          commands: [runningCmd]
        }
      ])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(false)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        done()
      }, 1500)
    })
  })

  it('app should be paused with some pause exception active', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [{
        rule: 'pause',
        active: true,
        commands: [runningCmd]
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(true)
        appExclusionsManager.isSchedulerCleared.should.be.equal(true)
        done()
      }, 1500)
    })
  })

  it('app should be paused with some pause exception active after reinitialize', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [{
        rule: 'pause',
        active: true,
        commands: [runningCmd]
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      appExclusionsManager.reinitialize(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(true)
        appExclusionsManager.isSchedulerCleared.should.be.equal(true)
        done()
      }, 1500)
    })
  }).timeout(10000)

  it('app should not paused with some pause exception not found', (done) => {
    settings.set('appExclusions', [{
      rule: 'pause',
      active: true,
      commands: ['xxxxxxxxxxxxxxx']
    }])
    appExclusionsManager = new AppExclusionsManager(settings)
    clearInterval(appExclusionsManager.timer)
    appExclusionsManager.isOnAppExclusion.should.be.equal(false)
    appExclusionsManager.isSchedulerCleared.should.be.equal(false)
    done()
  }).timeout(10000)

  it('app should not paused with some pause exception inactive', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [{
        rule: 'pause',
        active: false,
        commands: [runningCmd]
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      clearInterval(appExclusionsManager.timer)
      appExclusionsManager.isOnAppExclusion.should.be.equal(false)
      appExclusionsManager.isSchedulerCleared.should.be.equal(false)
      done()
    })
  }).timeout(10000)

  it('app should not be paused with some resume exception active', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [{
        rule: 'resume',
        active: true,
        commands: [runningCmd]
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(true)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        done()
      }, 1500)
    })
  })

  it('app should be paused with none resume exception found', (done) => {
    settings.set('appExclusions', [{
      rule: 'resume',
      active: true,
      commands: ['xxxxxxxxxxxxxxx']
    }])
    appExclusionsManager = new AppExclusionsManager(settings)
    setTimeout(() => {
      clearInterval(appExclusionsManager.timer)
      appExclusionsManager.isOnAppExclusion.should.be.equal(false)
      appExclusionsManager.isSchedulerCleared.should.be.equal(true)
      done()
    }, 1500)
  })

  it('app should not be paused with some resume exception inactive', (done) => {
    require('ps-list')().then((running) => {
      const runningCmd = running[0].name
      settings.set('appExclusions', [{
        rule: 'resume',
        active: false,
        commands: [runningCmd]
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(false)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        done()
      }, 1500)
    })
  })

  afterEach(() => {
    if (settings) {
      require('fs').unlink(path.join(__dirname, '/test-settings.json'), (_) => {})
      settings = null
    }
  })
})
