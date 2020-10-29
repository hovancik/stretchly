const { UntilMorning } = require('../app/utils/untilMorning')
const Settings = require('./../app/utils/settings')
const chai = require('chai')
const mockSettingsFilePath = `${__dirname}/assets/settings.untilMorning.json`
const fs = require('fs')
const { DateTime } = require('luxon')

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
      createSettingsFile(mockSettingsFilePath, {})
      settings = new Settings(mockSettingsFilePath)
    })

    it('msToSunrise() returns morning time the same day', function () {
      const dt = DateTime.local().set({ hours: 5, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 200, 60 * 60 * 1000 + 200)
    })

    it('msToSunrise() returns morning time the next day', function () {
      const dt = DateTime.local().set({ hours: 7, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 200, 23 * 60 * 60 * 1000 + 200)
    })
  })

  describe('Custom Morning Hour', function () {
    beforeEach(() => {
      createSettingsFile(mockSettingsFilePath, {
        morningHour: 15
      })
      settings = new Settings(mockSettingsFilePath)
    })

    it('msToSunrise() returns morning time the same day', function () {
      const dt = DateTime.local().set({ hours: 14, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 200, 60 * 60 * 1000 + 200)
    })

    it('msToSunrise() returns morning time the next day', function () {
      const dt = DateTime.local().set({ hours: 16, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 200, 23 * 60 * 60 * 1000 + 200)
    })
  })

  describe('Sunrise Settings', function () {
    // test for when the functionality to input sunrise is added
    // test data for 08/04/2018 Amsterdam, Netherlands
    // expected time is August 4 2018, 06:09 local Amsterdam time

    beforeEach(() => {
      createSettingsFile(mockSettingsFilePath, {
        morningHour: 'sunrise',
        posLatitude: 52,
        posLongitude: 4
      })
      settings = new Settings(mockSettingsFilePath)
    })

    it('msToSunrise() returns morning time the same day', function () {
      const dt = DateTime.local(2018, 8, 4, 5, 9)
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 200, 60 * 60 * 1000 + 200)
    })

    it('msToSunrise() returns morning time the next day', function () {
      const dt = DateTime.local(2018, 8, 4, 7, 9)
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 200, 23 * 60 * 60 * 1000 + 200)
    })
  })
})
