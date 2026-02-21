import { vi } from 'vitest'
import 'chai/register-should'
import Scheduler from '../app/utils/scheduler'

const timeout = process.env.CI ? 30000 : 10000

let test

describe('scheduler', function () {
  vi.setConfig({ testTimeout: timeout })
  beforeEach(function () {
    test = true
  })

  it('kinda runs schedule on time', () =>
    new Promise((resolve) => {
      const time = 100
      const callback = function () {
        test = false
      }
      const schedule = new Scheduler(callback, time)
      schedule.plan()
      setTimeout(function () {
        test.should.equal(false)
        resolve()
      }, 200)
    }))

  it('kinda runs schedule on time with correct', () =>
    new Promise((resolve) => {
      const time = 1000
      const start = Date.now()
      const callback = function () {
        // allow margin due to event loop delay
        (Date.now() - start).should.be
          .within(time - 200, time + 200)
        test = false
      }
      const schedule = new Scheduler(callback, time)
      schedule.plan()
      setTimeout(function () {
        schedule.correct()
      }, 200)
      setTimeout(function () {
        test.should.equal(false)
        resolve()
      }, time + 100)
    }))

  it('it cancels schedule on cancel()', () =>
    new Promise((resolve) => {
      const time = 100
      const callback = function () {
        test = false
      }
      const schedule = new Scheduler(callback, time)
      schedule.plan()
      setTimeout(function () {
        schedule.cancel()
      }, 50)
      setTimeout(function () {
        test.should.equal(true)
        resolve()
      }, 200)
    }))

  it('it kinda gets the time left', () =>
    new Promise((resolve) => {
      const time = 100
      const callback = function () {
        test = false
      }
      const schedule = new Scheduler(callback, time)
      schedule.plan()
      setTimeout(function () {
        schedule.timeLeft.should.be.a('number').and.to.be.below(100)
      }, 50)
      setTimeout(function () {
        test.should.equal(false)
        resolve()
      }, 160)
    }))
})
