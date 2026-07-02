import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import AppExclusionsManager from '../app/utils/appExclusionsManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import psList from 'ps-list'
import { unlinkSync } from 'node:fs'

const timeout = process.env.CI ? 30000 : 10000

describe('appExclusionsManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings
  let appExclusionsManager

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-appExclusionsManager',
      defaults: defaultSettings
    })
    settings.set('appExclusionsCheckInterval', 1000)
    appExclusionsManager = null
  })

  it('app should be running with default settings', () =>
    new Promise((resolve) => {
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(false)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        resolve()
      }, 1500)
    }))

  it('app should be running with default settings also after reinitialize', () =>
    new Promise((resolve) => {
      appExclusionsManager = new AppExclusionsManager(settings)
      appExclusionsManager.reinitialize(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(false)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        resolve()
      }, 1500)
    }))

  it('app should take the first active rule', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('app should be runnig when no rule is active', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('app should be paused with some pause exception active', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('app should be paused with some pause exception active after reinitialize', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('app should not paused with some pause exception not found', () =>
    new Promise((resolve) => {
      settings.set('appExclusions', [{
        rule: 'pause',
        active: true,
        commands: ['xxxxxxxxxxxxxxx']
      }])
      appExclusionsManager = new AppExclusionsManager(settings)
      setTimeout(() => {
        clearInterval(appExclusionsManager.timer)
        appExclusionsManager.isOnAppExclusion.should.be.equal(false)
        appExclusionsManager.isSchedulerCleared.should.be.equal(false)
        resolve()
      }, 1500)
    }))

  it('app should not paused with some pause exception inactive', () =>
    new Promise((resolve) => {
      psList().then((running) => {
        const runningCmd = running[0].name
        settings.set('appExclusions', [{
          rule: 'pause',
          active: false,
          commands: [runningCmd]
        }])
        appExclusionsManager = new AppExclusionsManager(settings)
        setTimeout(() => {
          clearInterval(appExclusionsManager.timer)
          appExclusionsManager.isOnAppExclusion.should.be.equal(false)
          appExclusionsManager.isSchedulerCleared.should.be.equal(false)
          resolve()
        }, 1500)
      })
    }))

  it('app should not be paused with some resume exception active', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('app should be paused with none resume exception found', () =>
    new Promise((resolve) => {
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
        resolve()
      }, 1500)
    }))

  it('app should not be paused with some resume exception inactive', () =>
    new Promise((resolve) => {
      psList().then((running) => {
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
          resolve()
        }, 1500)
      })
    }))

  it('stops monitoring with stop()', () =>
    new Promise((resolve) => {
      settings.set('appExclusions', [{ rule: 'pause', active: true, commands: ['xxxxxxxxxxxxxxx'] }])
      appExclusionsManager = new AppExclusionsManager(settings)
      appExclusionsManager.stop()
      const cleared = appExclusionsManager.timer === null
      cleared.should.be.equal(true)
      resolve()
    }))

  it('does not create a second timer when start() is called twice', () =>
    new Promise((resolve) => {
      settings.set('appExclusions', [{ rule: 'pause', active: true, commands: ['xxxxxxxxxxxxxxx'] }])
      appExclusionsManager = new AppExclusionsManager(settings)
      const timer = appExclusionsManager.timer
      appExclusionsManager.start()
      appExclusionsManager.timer.should.be.equal(timer)
      appExclusionsManager.stop()
      resolve()
    }))

  it('does nothing when stop() is called while not monitoring', () =>
    new Promise((resolve) => {
      appExclusionsManager = new AppExclusionsManager(settings)
      appExclusionsManager.stop()
      const cleared = appExclusionsManager.timer === null
      cleared.should.be.equal(true)
      resolve()
    }))

  afterEach(() => {
    if (settings) {
      unlinkSync(join(__dirname, '/test-settings-appExclusionsManager.json'))
      settings = null
    }
  })
})
