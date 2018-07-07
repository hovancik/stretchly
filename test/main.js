let Application = require('spectron').Application
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let electronPath = require('electron')
const AppSettings = require('../app/utils/settings')


chai.should()
chai.use(chaiAsPromised)
const timeout = process.env.CI ? 30000 : 10000



describe('stretchly', function () {
  function modifySettings(key, value) {
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ]
    })

    return this.app.start()
      .then(() => {
        this.app.client.addCommand('getUserDataPath', function () {
          return this.execute(function () {
            return require('electron').remote.app.getPath('userData')
          })
        })

        return this.app.client.getUserDataPath()
      })
      .then((path) => {
        const settingsFile = `${path.value}/config.json`
        const settings = new AppSettings(settingsFile)
        settings.set(key, value)
        return this.app.stop()
      })
  }

  this.timeout(timeout)

  beforeEach(function () {
    return modifySettings('isFirstRun', false)
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('main process runs on app start', function () {
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ]
    })
    return this.app.start()
      .then(() => {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness
        return this.app.client
          .waitUntilWindowLoaded()
          .getWindowCount()
          .should.eventually.be.at.least(1)
      })
  })

  it('welcome window opens on first run', function () {
    return modifySettings('isFirstRun', true)
      .then(() => {
        this.app = new Application({
          path: electronPath,
          args: [
            `${__dirname}/../app`
          ]
        })

        return this.app.start()
          .then(() => {
            chaiAsPromised.transferPromiseness = this.app.transferPromiseness
            return this.app.client
              .waitUntilWindowLoaded()
              .getWindowCount().should.eventually.equal(2)
              .windowByIndex(0).browserWindow.isVisible().should.eventually.be.true
              .windowByIndex(1).browserWindow.isVisible().should.eventually.be.false
          })
      })
  })

  it('welcome window does not open after first run', function () {
    return modifySettings('isFirstRun', false)
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ]
    })
    const dir = app.getPath('userData')
    const settingsFile = `${dir}/config.json`
    return this.app.start()
      .then(() => {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness
        return this.app.client
          .waitUntilWindowLoaded()
          .getWindowCount().should.eventually.equal(1)
          .windowByIndex(0).browserWindow.isVisible().should.eventually.be.false
      })
  })
})
