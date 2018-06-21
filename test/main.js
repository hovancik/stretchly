let Application = require('spectron').Application
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
let electronPath = require('electron')

chai.should()
chai.use(chaiAsPromised)
const timeout = process.env.CI ? 30000 : 10000

describe('stretchly', function () {
  this.timeout(timeout)
  beforeEach(function () {
    this.app = new Application({
      path: electronPath,
      args: [
        `${__dirname}/../app`
      ]
    })
    return this.app.start()
  })

  beforeEach(function () {
    chaiAsPromised.transferPromiseness = this.app.transferPromiseness
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('app starts', function () {
    return this.app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(2)
      .windowByIndex(0).browserWindow.isVisible().should.eventually.be.true
      .windowByIndex(1).browserWindow.isVisible().should.eventually.be.false
  })
})
