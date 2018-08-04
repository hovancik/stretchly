const { UntilMorning } = require('../app/utils/untilMorning')
const Settings = require('./../app/utils/settings')
let chai = require('chai')
const mockSettingsFilePath = `${__dirname}/assets/settings.untilMorning.json`
const fs = require('fs')

chai.should()
const timeout = process.env.CI ? 30000 : 10000

const ONE_DAY = 24 * 60 * 60 * 1000
const timezoneOffset = (new Date().getTimezoneOffset()) / 60

describe.only('UntilMorning', function () {
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
      createSettingsFile(mockSettingsFilePath, {})
      settings = new Settings(mockSettingsFilePath)
    })

    it('timeUntilMorning() calculates time until morning', function () {
      const currentTime = Date.now()
      let sunrise
      
      // Checking against UTC time
      if (Date.now() < new Date().setHours(6, 0, 0, 0)) {
        sunrise = new Date().setHours(6, 0, 0, 0)
      } else {
        sunrise = new Date(currentTime + ONE_DAY).setHours(6, 0, 0, 0)
      }

      const actual = new UntilMorning(settings).timeUntilMorning()
      const expected = sunrise - currentTime

      Math.abs(expected - actual).should.be.lessThan(1000)
    })

    it('loadMorningTime() returns morning time', function () {
      new UntilMorning(settings).loadMorningTime(new Date()).hour().should.equal(6 + timezoneOffset)
    })
  })

  describe('Custom Morning Hour', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFilePath, {
        morningHour: 15
      })
      settings = new Settings(mockSettingsFilePath)
    })

    // Checking against UTC time
    it('timeUntilMorning() calculates time until morning when input is a random hour', function () {
      const currentTime = new Date()
      let sunrise

      if (Date.now() < new Date().setHours(15, 0, 0, 0)) {
        sunrise = new Date().setHours(15, 0, 0, 0)
      } else {
        sunrise = new Date(currentTime + ONE_DAY).setHours(15, 0, 0, 0)
      }

      const expected = sunrise - currentTime
      const actual = new UntilMorning(settings).timeUntilMorning()

      Math.abs(expected - actual).should.be.lessThan(1000)
    })

    it('loadMorningTime() returns morning time', function () {
      new UntilMorning(settings).loadMorningTime(new Date()).hour().should.equal(15 + timezoneOffset)
    })
  })

  describe('Sunrise Settings', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFilePath, {
        morningHour: 'sunrise',
        posLatitude: 52,
        posLongitude: 4
      })
      settings = new Settings(mockSettingsFilePath)
    })

    it('loadMorningTime() returns morning time when sunrise is an input', function () {
      // test for when the functionality to input sunrise is added
      // test data for 008/04/2018 Amsterdam, Netherlands
      // Checking against UTC time

      const date = new UntilMorning(settings).loadMorningTime(new Date('08/04/2018'))
      date.hour().should.equal(6 + timezoneOffset)
      date.minute().should.equal(8)
    })
  })
})
