// TODO temp. disabled. see https://github.com/hovancik/i18next-test
// const chai = require('chai')
// const Utils = require('../app/utils/utils')
// const i18next = require('i18next')
// const Backend = require('i18next-node-fs-backend')
//
// chai.should()
//
// describe('Utils', function () {
//   beforeEach(function (done) {
//     i18next
//       .use(Backend)
//       .init({
//         lng: 'en',
//         fallbackLng: 'en',
//         debug: false,
//         backend: {
//           loadPath: `${__dirname}/../app/locales/{{lng}}.json`,
//           jsonIndent: 2
//         }
//       }, function (err, t) {
//         i18next.changeLanguage('en')
//         if (err) {
//           console.log(err.stack)
//         }
//         done()
//       })
//   })
//
//   it('formats remaining seconds into correct format', function () {
//     Utils.formatTimeRemaining(10).should.equal('11 seconds left')
//     Utils.formatTimeRemaining(60).should.equal('2 minutes left')
//     Utils.formatTimeRemaining(61).should.equal('2 minutes left')
//     Utils.formatTimeRemaining(150).should.equal('3 minutes left')
//   })
//
// })

const chai = require('chai')
const { canPostpone, canSkip } = require('../app/utils/utils')
const sinon = require('sinon')

chai.should()

describe('Time Until Next Break', () => {
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
})
