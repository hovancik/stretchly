const Application = require('spectron').Application
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const electronPath = require('electron')
const rimraf = require('rimraf')

const { modifySettings } = require('./modifySettingsHelper')

chai.should()
chai.use(chaiAsPromised)
const timeout = process.env.CI ? 60000 : 10000

describe('stretchly', function () {
  this.timeout(timeout)

  beforeEach(function () {
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ],
      chromeDriverArgs: [
        `--user-data-dir=${__dirname}/stretchly-test-tmp`
      ]
    })

    return modifySettings('isFirstRun', false)
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      rimraf(`${__dirname}/stretchly-test-tmp`, () => {})
      return this.app.stop()
    }
  })

  it('main process runs on app start', function () {
    return this.app.start()
      .then(async () => {
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness

        await this.app.client
          .waitUntilWindowLoaded()

        let windowCount = await this.app.client.getWindowCount()

        windowCount.should.be.at.least(2)
      })
  })

  it('welcome window opens on first run', function () {
    return modifySettings('isFirstRun', true)
      .then(() => {
        return this.app.start()
          .then(async () => {
            chaiAsPromised.transferPromiseness = this.app.transferPromiseness

            await this.app.client
                  .waitUntilWindowLoaded()

            let windowCount = await this.app.client.getWindowCount()

            windowCount.should.equal(2)

            await this.app.client.windowByIndex(0)
            let visible = await this.app.client.browserWindow.isVisible()

            visible.should.equal(true)

            await this.app.client.windowByIndex(1)
            visible = await this.app.client.browserWindow.isVisible()

            visible.should.equal(false)
          })
      })
  })

  it('welcome window does not open after first run', function () {
    return modifySettings('isFirstRun', false)
      .then(() => {
        return this.app.start()
          .then(async () => {
            chaiAsPromised.transferPromiseness = this.app.transferPromiseness
            await this.app.client
              .waitUntilWindowLoaded()

            let windowCount = await this.app.client.getWindowCount()
            windowCount.should.equal(1)

            await this.app.client.windowByIndex(0)

            let visible = await this.app.client.browserWindow.isVisible()
            visible.should.equal(true)
          })
      })
  })

//  it('main window is stretchly ', function () {
//    return modifySettings('isFirstRun', false)
//      .then(() => {
//        this.app = new Application({
//          path: electronPath,
//          args: [
//            `${__dirname}/../app`
//          ],
//          chromeDriverArgs: [
//            `--user-data-dir=${__dirname}/stretchly-test-tmp`
//          ]
//        })
//
//        return this.app.start()
//          .then(() => {
//            chaiAsPromised.transferPromiseness = this.app.transferPromiseness
//            return this.app.client
//              .waitUntilWindowLoaded()
//              .windowByIndex(0).browserWindow
//              .getTitle().should.eventually.equal('Stretchly')
//          })
//      })
//  })
})
