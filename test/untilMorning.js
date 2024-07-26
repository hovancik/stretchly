import { UntilMorning } from '../app/utils/untilMorning'
import { vi } from 'vitest'
import 'chai/register-should'
import Store from 'electron-store'
import { join } from 'path'
import { Settings, DateTime } from 'luxon'
import defaultSettings from '../app/utils/defaultSettings'
import { unlinkSync } from 'fs'

const timeout = process.env.CI ? 30000 : 10000

describe('UntilMorning', function () {
  let settings
  vi.setConfig({ testTimeout: timeout })

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-untilMorning',
      defaults: defaultSettings
    })
  })

  afterEach(() => {
    if (settings) {
      unlinkSync(join(__dirname, '/test-settings-untilMorning.json'))
      settings = null
    }
  })

  describe('Default Settings', function () {
    it('msToSunrise() returns morning time the same day', function () {
      Settings.now = () => new Date(2021, 4, 25).valueOf()
      const dt = DateTime.local().set({ hours: 5, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 60000, 60 * 60 * 1000 + 60000)
    })

    it('msToSunrise() returns morning time the next day', function () {
      Settings.now = () => new Date(2021, 4, 25).valueOf()
      const dt = DateTime.local().set({ hours: 7, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 60000, 23 * 60 * 60 * 1000 + 60000)
    })
  })

  describe('Custom Morning Hour', function () {
    beforeEach(() => {
      settings.set('morningHour', 15)
    })

    it('msToSunrise() returns morning time the same day', function () {
      const dt = DateTime.local().set({ hours: 14, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 60000, 60 * 60 * 1000 + 60000)
    })

    it('msToSunrise() returns morning time the next day', function () {
      const dt = DateTime.local().set({ hours: 16, minutes: 0, seconds: 0 })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 60000, 23 * 60 * 60 * 1000 + 60000)
    })
  })

  describe('Sunrise Settings', function () {
    // test for when the functionality to input sunrise is added
    // test data for 08/04/2018 Amsterdam, Netherlands
    // expected time is August 4 2018, 06:10 local Amsterdam time

    beforeEach(() => {
      settings.set('morningHour', 'sunrise')
      settings.set('posLatitude', 52)
      settings.set('posLongitude', 4)
    })

    it('msToSunrise() returns morning time the same day', function () {
      const dt = DateTime.local(2018, 8, 4, 5, 10, 0, 0, { zone: 'Europe/Amsterdam' })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(60 * 60 * 1000 - 60000, 60 * 60 * 1000 + 60000)
    })

    it('msToSunrise() returns morning time the next day', function () {
      const dt = DateTime.local(2018, 8, 4, 7, 10, 0, 0, { zone: 'Europe/Amsterdam' })
      new UntilMorning(settings).msToSunrise(dt).should.be.within(23 * 60 * 60 * 1000 - 60000, 23 * 60 * 60 * 1000 + 60000)
    })
  })
})
