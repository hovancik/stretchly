const Application = require('spectron').Application
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const path = require('path')

chai.should()
chai.use(chaiAsPromised)

const timeout = process.env.CI ? 30000 : 10000

describe('strechly', function () {
  this.timeout(timeout)

  let app

  const setupApp = function (app) {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.client.waitUntilWindowLoaded()
  }

  const startApp = function () {
    app = new Application({
      path: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      args: [
        path.join(__dirname, '..')
      ],
      waitTimeout: timeout
    })
    return app.start().then(setupApp)
  }

  before(function () {
    return startApp()
  })

  // TODO #1
  // strechly "after all" hook:
  // RuntimeError: no such window: target window already closed
  // from unknown error: web view not found
  //    at window() - application.js:206:19
  // after(function () {
  //   if (app && app.isRunning()) {
  //     return app.stop()
  //   }
  // })

  it('starts app', function () {
    return app.client.getWindowCount().should.eventually.equal(1)
      .browserWindow.getTitle().should.eventually.equal('strechly')
      .waitForVisible('h1').should.eventually.be.true
      .pause(6000)
      .getWindowCount().should.eventually.equal(0)
  })
})
