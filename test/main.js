let Application = require('spectron').Application
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let electronPath = require('electron')
const fs = require('fs')
const path = require('path')

const { modifySettings } = require('./modifySettingsHelper')

chai.should()
chai.use(chaiAsPromised)
const timeout = process.env.CI ? 60000 : 10000

/**
 * Remove directory recursively
 * @param {string} dir_path
 * @see https://stackoverflow.com/a/42505874/3027390
 */
function rimraf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(entry) {
      let entry_path = path.join(dir_path, entry)
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path)
      } else {
        fs.unlinkSync(entry_path)
      }
    })
    fs.rmdirSync(dir_path)
  }
}

describe('stretchly', function () {
  this.timeout(timeout)
  beforeEach(function () {
    return modifySettings('isFirstRun', false)
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      rimraf(`${__dirname}/stretchly-test-tmp`)
      return this.app.stop()
    }
  })

  it('main process runs on app start', function () {
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ],
      chromeDriverArgs: [
        `--user-data-dir=${__dirname}/stretchly-test-tmp`
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
          ],
          chromeDriverArgs: [
            `--user-data-dir=${__dirname}/stretchly-test-tmp`
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
      .then(() => {
        this.app = new Application({
          path: electronPath,
          args: [
            `${__dirname}/../app`
          ],
          chromeDriverArgs: [
            `--user-data-dir=${__dirname}/stretchly-test-tmp`
          ]
        })

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

  it('main window is stretchly ', function () {
    return modifySettings('isFirstRun', false)
      .then(() => {
        this.app = new Application({
          path: electronPath,
          args: [
            `${__dirname}/../app`
          ],
          chromeDriverArgs: [
            `--user-data-dir=${__dirname}/stretchly-test-tmp`
          ]
        })

        return this.app.start()
          .then(() => {
            chaiAsPromised.transferPromiseness = this.app.transferPromiseness
            return this.app.client
              .waitUntilWindowLoaded()
              .windowByIndex(0).browserWindow
              .getTitle().should.eventually.equal('stretchly')
          })
      })
  })
})
