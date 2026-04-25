import { expect } from 'chai'
import BreaksPlanner from '../app/breaksPlanner.js'

const baseSettings = {
  microbreakDuration: 20000,
  breakDuration: 300000,
  microbreakInterval: 600000,
  breakInterval: 2,
  breakNotification: false,
  microbreakNotification: false,
  break: true,
  microbreak: true,
  naturalBreaks: false,
  naturalBreaksInactivityResetTime: 300000,
  monitorDnd: false,
  appExclusions: [],
  appExclusionsCheckInterval: 1000,
  ankiMaxBreakDurationSeconds: 90
}

function fakeSettings (overrides = {}) {
  const values = { ...baseSettings, ...overrides }
  return { get: (k) => values[k] }
}

describe('BreaksPlanner Anki break duration', () => {
  it('uses breakDuration when _ankiBreakActive is false', () => {
    const planner = new BreaksPlanner(fakeSettings())
    planner.emit('breakStarted', false)
    expect(planner.scheduler.delay).to.equal(300000)
    planner.scheduler.cancel()
  })

  it('uses ankiMaxBreakDurationSeconds * 1000 when flag is set', () => {
    const planner = new BreaksPlanner(fakeSettings())
    planner._ankiBreakActive = true
    planner.emit('breakStarted', false)
    expect(planner.scheduler.delay).to.equal(90000)
    planner.scheduler.cancel()
  })
})
