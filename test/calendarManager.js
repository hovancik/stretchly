import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import CalendarManager from '../app/utils/calendarManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlink } from 'node:fs'

const timeout = process.env.CI ? 30000 : 10000

describe('calendarManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let manager = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-calendarManager',
      defaults: defaultSettings
    })
    manager = new CalendarManager(settings)
  })

  it('should not start by default (monitorCalendar is false)', () => new Promise((resolve) => {
    manager.monitorCalendar.should.be.equal(false)
    resolve()
  }))

  it('should have empty events by default', () => new Promise((resolve) => {
    manager._upcomingEvents.length.should.be.equal(0)
    resolve()
  }))

  it('should not clear scheduler (calendar does not pause breaks)', () => new Promise((resolve) => {
    manager.isSchedulerCleared.should.be.equal(false)
    resolve()
  }))

  it('should return 0 offset when no events', () => new Promise((resolve) => {
    const offset = manager.getNextFreeSlot(600000, 20000)
    offset.should.be.equal(0)
    resolve()
  }))

  it('should parse events correctly', () => new Promise((resolve) => {
    const events = manager._parseEvents('2026-3-11T14:0|2026-3-11T15:0\n2026-3-11T16:30|2026-3-11T17:0\n')
    events.length.should.be.equal(2)
    resolve()
  }))

  it('should handle empty parse input', () => new Promise((resolve) => {
    const events = manager._parseEvents('')
    events.length.should.be.equal(0)
    resolve()
  }))

  it('should stop cleanly', () => new Promise((resolve) => {
    manager.stop()
    manager.monitorCalendar.should.be.equal(false)
    manager._upcomingEvents.length.should.be.equal(0)
    resolve()
  }))

  afterEach(() => {
    if (manager) {
      manager.stop()
      manager = null
    }

    if (settings) {
      unlink(join(__dirname, '/test-settings-calendarManager.json'), (_) => {})
      settings = null
    }
  })
})
