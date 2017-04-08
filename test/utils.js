const chai = require('chai')
const Utils = require('../app/utils/utils')

chai.should()

describe.only('Utils', function () {
  beforeEach(function () {
    //
  })

  it('formats remaining seconds into correct format', function () {
    Utils.formatRemaining(10).should.equal('11 seconds left')
    Utils.formatRemaining(60).should.equal('2 minutes left')
    Utils.formatRemaining(61).should.equal('2 minutes left')
    Utils.formatRemaining(150).should.equal('3 minutes left')
  })

  it('formats time left in pause into correct format', function () {
    Utils.formatPauseTimeLeft(59999).should.equal('less than 1m')
    Utils.formatPauseTimeLeft(45*60*1000).should.equal('45m')
    Utils.formatPauseTimeLeft(61*60*1000).should.equal('1h1m')
    Utils.formatPauseTimeLeft(60*60*1000).should.equal('1h')
    Utils.formatPauseTimeLeft(210*60*1000).should.equal('3h30m')
  })

  it('formats time left till next break into correct format', function () {
    Utils.formatTillBreak(15*1000).should.equal('15s')
    Utils.formatTillBreak(29.4*1000).should.equal('29s')
    Utils.formatTillBreak(31*1000).should.equal('1m')
    Utils.formatTillBreak(60*1.5*1000).should.equal('2m')
  })
})
