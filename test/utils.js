const chai = require('chai')
const {
  formatTimeRemaining, formatTimeIn,
  canSkip, canPostpone, formatKeyboardShortcut
} = require('../app/utils/utils')
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')
const sinon = require('sinon')

chai.should()

describe('Times formatters', function () {
  beforeEach(function (done) {
    i18next
      .use(Backend)
      .init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        backend: {
          loadPath: `${__dirname}/../app/locales/{{lng}}.json`,
          jsonIndent: 2
        }
      }, function (err, t) {
        if (err) {
          console.log(err)
          return done(err)
        }
        done()
      })
  })

  it('formats "remaining" milliseconds into correct format', function () {
    formatTimeRemaining(800, i18next).should.equal('1 second remaining')
    formatTimeRemaining(1000, i18next).should.equal('1 second remaining')
    formatTimeRemaining(1001, i18next).should.equal('2 seconds remaining')
    formatTimeRemaining(2000, i18next).should.equal('2 seconds remaining')
    formatTimeRemaining(59001, i18next).should.equal('About 2 minutes remaining')
    formatTimeRemaining(60001, i18next).should.equal('About 2 minutes remaining')
    formatTimeRemaining(118001, i18next).should.equal('About 2 minutes remaining')
    formatTimeRemaining(119001, i18next).should.equal('About 2 minutes remaining')
    formatTimeRemaining(120000, i18next).should.equal('About 2 minutes remaining')
    formatTimeRemaining(120001, i18next).should.equal('About 3 minutes remaining')
    formatTimeRemaining(3480001, i18next).should.equal('About 59 minutes remaining')
    formatTimeRemaining(3540001, i18next).should.equal('About 1 hour remaining')
    formatTimeRemaining(3600000, i18next).should.equal('About 1 hour remaining')
    formatTimeRemaining(3600001, i18next).should.equal('About 1 hour 1 minute remaining')
    formatTimeRemaining(7080001, i18next).should.equal('About 1 hour 59 minutes remaining')
    formatTimeRemaining(7080001, i18next).should.equal('About 1 hour 59 minutes remaining')
    formatTimeRemaining(7180001, i18next).should.equal('About 2 hours remaining')
  })

  it('formats "in" milliseconds into correct format', function () {
    formatTimeIn(800, i18next).should.equal('in 1 second')
    formatTimeIn(1000, i18next).should.equal('in 1 second')
    formatTimeIn(1001, i18next).should.equal('in 2 seconds')
    formatTimeIn(2000, i18next).should.equal('in 2 seconds')
    formatTimeIn(58001, i18next).should.equal('in 59 seconds')
    formatTimeIn(59000, i18next).should.equal('in 59 seconds')
    formatTimeIn(59001, i18next).should.equal('in about 2 minutes')
    formatTimeIn(60001, i18next).should.equal('in about 2 minutes')
    formatTimeIn(118001, i18next).should.equal('in about 2 minutes')
    formatTimeIn(119001, i18next).should.equal('in about 2 minutes')
    formatTimeIn(120001, i18next).should.equal('in about 3 minutes')
    formatTimeIn(3480000, i18next).should.equal('in about 58 minutes')
    formatTimeIn(3540001, i18next).should.equal('in about 1 hour')
    formatTimeIn(3600001, i18next).should.equal('in about 1 hour 1 minute')
    formatTimeIn(3660000, i18next).should.equal('in about 1 hour 1 minute')
    formatTimeIn(3660001, i18next).should.equal('in about 1 hour 2 minutes')
    formatTimeIn(7140000, i18next).should.equal('in about 1 hour 59 minutes')
    formatTimeIn(7200000, i18next).should.equal('in about 2 hours')
    formatTimeIn(7260000, i18next).should.equal('in about 2 hours 1 minute')
  })
})

describe('canSkip and canPostpone', () => {
  // stubbing date
  before(() => {
    this.sandbox = sinon.createSandbox()
    this.sandbox.stub(Date, 'now').returns(1537347700000)
  })

  after(() => {
    this.sandbox.restore()
  })

  describe('canSkip', () => {
    // strictMode, postpone, passedPercent, postponePercent
    it('is false when in strict mode I', () => {
      canSkip(true, true, 20, 30).should.equal(false)
    })
    it('is false when in strict mode II', () => {
      canSkip(true, true, 40, 30).should.equal(false)
    })
    it('is false when in strict mode III', () => {
      canSkip(true, false, 20, 30).should.equal(false)
    })
    it('is false when in strict mode IV', () => {
      canSkip(true, false, 40, 30).should.equal(false)
    })
    it('is true when not in strict mode and after postpone percent', () => {
      canSkip(false, true, 40, 30).should.equal(true)
    })
    it('is false when not in strict mode and before postpone percent', () => {
      canSkip(false, true, 20, 30).should.equal(false)
    })
    it('is true when not in strict mode I', () => {
      canSkip(false, false, 40, 30).should.equal(true)
    })
    it('is true when not in strict mode II', () => {
      canSkip(false, false, 20, 30).should.equal(true)
    })
  })

  describe('canPostpone', () => {
    // postpone, passedPercent, postponePercent
    it('is true when postpone and before postpone percent', () => {
      canPostpone(true, 20, 30).should.equal(true)
    })
    it('is false when postpone and after postpone percent', () => {
      canPostpone(true, 40, 30).should.equal(false)
    })
    it('is false when not postpone I', () => {
      canPostpone(false, 20, 30).should.equal(false)
    })
    it('is false when not postpone II', () => {
      canPostpone(false, 40, 30).should.equal(false)
    })
  })

  describe('formatKeyboardShortcut', () => {
    it('formats Or to /', () => {
      formatKeyboardShortcut('CmdOrCtrl+X').should.equal('Cmd/Ctrl + X')
    })
    it('formats + to have spaces', () => {
      formatKeyboardShortcut('Command+X').should.equal('Command + X')
    })
  })
})
