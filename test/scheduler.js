let chai = require('chai')
let Scheduler = require('../app/utils/scheduler')

chai.should()
const timeout = process.env.CI ? 30000 : 10000

let test

describe('scheduler', function () {
  this.timeout(timeout)
  beforeEach(function () {
    test = true
  })

  it('kinda runs schedule on time', function (done) {
    let time = 100
    let callback = function () {
      test = false
    }
    let schedule = new Scheduler(callback, time)
    schedule.plan()
    setTimeout(function () {
      test.should.be.false
      done()
    }, 200)
  })

  it('kinda runs schedule on time with reload', function (done) {
    let time = 1000
    let correction = 400
    let start = Date.now()
    let callback = function () {
      // allow margin due to event loop delay
      (Date.now() - start).should.be
        .within(time - correction, time - correction / 2)
      test = false
    }
    let schedule = new Scheduler(callback, time)
    schedule.plan()
    setTimeout(function () {
      schedule.reload(correction)
    }, 200)
    setTimeout(function () {
      test.should.be.false
      done()
    }, time)
  })

  it('it cancels schedule on cancel()', function (done) {
    let time = 100
    let callback = function () {
      test = false
    }
    let schedule = new Scheduler(callback, time)
    schedule.plan()
    setTimeout(function () {
      schedule.cancel()
    }, 50)
    setTimeout(function () {
      test.should.be.true
      done()
    }, 200)
  })

  it('it kinda gets the time left', function (done) {
    let time = 100
    let callback = function () {
      test = false
    }
    let schedule = new Scheduler(callback, time)
    schedule.plan()
    setTimeout(function () {
      schedule.timeLeft.should.be.a('number').and.to.be.below(100)
    }, 50)
    setTimeout(function () {
      test.should.be.false
      done()
    }, 160)
  })

  it('it kinda gets the time left with reload', function (done) {
    let time = 500
    let correction = 300
    let schedule = new Scheduler(() => {}, time)
    schedule.plan()
    setTimeout(function () {
      schedule.timeLeft.should.be.a('number').and
        .to.be.above(400)
      schedule.reload(correction)
    }, 50)
    setTimeout(function () {
      schedule.timeLeft.should.be.a('number').and
        .to.be.most(time - correction - 100)
      done()
    }, 100)
  })
})
