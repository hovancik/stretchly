const { UntilMorning } = require('../app/utils/untilMorning')
const Settings = require('./../app/utils/settings')
let chai = require('chai')
const mockSettingsFile = `${__dirname}/assets/settings.untilMorning.json`
const fs = require('fs')

chai.should()
const timeout = process.env.CI ? 30000 : 10000

describe('UntilMorning', function () {
  let settings
  this.timeout(timeout)

  afterEach(() => {
    if (settings && settings.destroy) {
      settings.destroy()
      settings = null
    }
  })

  function createSettingsFile (filePath, desiredSettings) {
    fs.writeFileSync(filePath, JSON.stringify(desiredSettings), 'utf8')
  }

  describe('Default Settings', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFile, {})
      settings = new Settings(mockSettingsFile)
    })

    it('timeUntilMorning() calculates time until morning', function () {
      const currentTime = Date.now()
      let sunrise

      if (Date.now() < new Date().setHours(6, 0, 0, 0)) {
        sunrise = new Date().setHours(6, 0, 0, 0)
      } else {
        sunrise = new Date(currentTime + 24 * 60 * 60 * 1000).setHours(6, 0, 0, 0)
      }

      const actual = new UntilMorning(settings).timeUntilMorning()
      const expected = sunrise - currentTime

      Math.abs(expected - actual).should.be.lessThan(1000)
    })

    it('loadMorningTime() returns morning time', function () {
      new UntilMorning(settings).loadMorningTime(new Date()).getHours().should.equal(6)
    })
  })

  describe('Custom Morning Hour', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFile, {
        morningHour: 15
      })
      settings = new Settings(mockSettingsFile)
    })

    it('timeUntilMorning() calculates time until morning when input is a random hour', function () {
      const currentTime = Date.now()
      let sunrise

      if (Date.now() < new Date().setHours(15, 0, 0, 0)) {
        sunrise = new Date().setHours(15, 0, 0, 0)
      } else {
        sunrise = new Date(currentTime + 24 * 60 * 60 * 1000).setHours(15, 0, 0, 0)
      }

      const actual = new UntilMorning(settings).timeUntilMorning()
      const expected = sunrise - currentTime

      Math.abs(expected - actual).should.be.lessThan(10)
    })

    it('loadMorningTime() returns morning time', function () {
      new UntilMorning(settings).loadMorningTime(new Date()).getHours().should.equal(15)
    })
  })

  describe('Sunrise Settings', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFile, {
        morningHour: 'sunrise',
        posLatitude: 20,
        posLongitude: 156
      })
      settings = new Settings(mockSettingsFile)
    })

    it('loadMorningTime() returns morning time when sunrise is an input', function () {
      // test for when the functionality to input sunrise is added
      // test data for 03/25/2019

      const date = new UntilMorning(settings).loadMorningTime(new Date('03/25/2019'))
      // because of timezones checking against 03/24/2019 -- this is correct
      date.getDate().should.equal(24)
      date.getHours().should.equal(19)
      date.getMinutes().should.equal(37)
    })
  })
})
