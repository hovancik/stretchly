const chai = require('chai')
const Utils = require('../app/utils/utils')

chai.should()

describe('Utils', function () {
  beforeEach(function () {
    //
  })

  it('formats remaining seconds into correct format', function () {
    Utils.formatRemaining(10).should.equal('11 seconds left')
    Utils.formatRemaining(60).should.equal('2 minutes left')
    Utils.formatRemaining(61).should.equal('2 minutes left')
    Utils.formatRemaining(150).should.equal('3 minutes left')
  })
})
