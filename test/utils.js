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
//     Utils.formatRemaining(10).should.equal('11 seconds left')
//     Utils.formatRemaining(60).should.equal('2 minutes left')
//     Utils.formatRemaining(61).should.equal('2 minutes left')
//     Utils.formatRemaining(150).should.equal('3 minutes left')
//   })
//
//   it('formats time left in pause into correct format', function () {
//     Utils.formatPauseTimeLeft(59999).should.equal('less than 1m')
//     Utils.formatPauseTimeLeft(45 * 60 * 1000).should.equal('45m')
//     Utils.formatPauseTimeLeft(61 * 60 * 1000).should.equal('1h1m')
//     Utils.formatPauseTimeLeft(60 * 60 * 1000).should.equal('1h')
//     Utils.formatPauseTimeLeft(210 * 60 * 1000).should.equal('3h30m')
//   })
//
//   it('formats time left till next break into correct format', function () {
//     Utils.formatTillBreak(15 * 1000).should.equal('~15s')
//     Utils.formatTillBreak(27.4 * 1000).should.equal('~25s')
//     Utils.formatTillBreak(29.4 * 1000).should.equal('~30s')
//     Utils.formatTillBreak(31 * 1000).should.equal('1m')
//     Utils.formatTillBreak(60 * 1.5 * 1000).should.equal('2m')
//   })
// })

const chai = require('chai')
const { formatTimeOfNextBreak } = require('../app/utils/utils')
const moment = require('moment')
const sinon = require('sinon')

moment().format()
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

  describe('formatTimeOfNextBreak()', () => {
    this.offset = moment(Date.now()).utcOffset() / 60
    /* EXAMPLE SCENARIOS
      Date.now() => 1537347700000 (2018-09-19 @ 09:01:40)

      With timeLeft = 0 milliseconds:
        AMSTERDAM (2 hour time difference)
        formatTimeOfNextBreak(0) => 11:01:40 => = ['11', '01']

        THESSALONIKI (3 hour time difference)
        formatTimeOfNextBreak(0) => 12:01:40 => ['12', '01']
    */

    it('5 min (minutes are padded)', () => {
      formatTimeOfNextBreak(300000).should.deep.equal([String(9 + this.offset), '06'])
    })

    it('10 minutes (no padding)', () => {
      formatTimeOfNextBreak(600000).should.deep.equal([String(9 + this.offset), '11'])
    })

    it('60 minutes (rollover to next hour)', () => {
      formatTimeOfNextBreak(3600000).should.deep.equal([String(10 + this.offset), '01'])
    })
  })
})
