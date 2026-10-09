import 'chai/register-should'
import { join } from 'path'
import BreaksPlanner from '../app/breaksPlanner'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlink } from 'node:fs'
import { vi } from 'vitest'

const timeout = process.env.CI ? 30000 : 10000

describe('breaksPlanner', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let breaksPlanner = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-breaksPlanner',
      defaults: defaultSettings
    })
    settings.set('microbreakDuration', 200)
    settings.set('breakDuration', 500)
    settings.set('microbreak', true)
    settings.set('break', true)
    breaksPlanner = new BreaksPlanner(settings)
  })

  afterEach(() => {
    if (breaksPlanner.scheduler) breaksPlanner.scheduler.cancel()
    unlink(join(__dirname, 'test-settings-breaksPlanner.json'), () => {})
  })

  it('cancels the previous finish scheduler when a second break starts', () =>
    new Promise((resolve) => {
      let finishBreakFired = false

      breaksPlanner.on('finishBreak', () => {
        finishBreakFired = true
      })

      // Start a long break — creates a finishBreak scheduler (500ms)
      breaksPlanner.emit('breakStarted', false)

      // Start a mini break 50ms later — should cancel the finishBreak scheduler
      setTimeout(() => {
        breaksPlanner.emit('microbreakStarted', false)
      }, 50)

      // After 600ms the original finishBreak timer would have fired if not cancelled
      setTimeout(() => {
        finishBreakFired.should.equal(false)
        resolve()
      }, 600)
    }))

  it('cancels the previous finish scheduler when a long break follows a mini break', () =>
    new Promise((resolve) => {
      let finishMicrobreakFired = false

      breaksPlanner.on('finishMicrobreak', () => {
        finishMicrobreakFired = true
      })

      // Start a mini break — creates a finishMicrobreak scheduler (200ms)
      breaksPlanner.emit('microbreakStarted', false)

      // Start a long break 50ms later — should cancel the finishMicrobreak scheduler
      setTimeout(() => {
        breaksPlanner.emit('breakStarted', false)
      }, 50)

      // After 300ms the original finishMicrobreak timer would have fired if not cancelled
      setTimeout(() => {
        finishMicrobreakFired.should.equal(false)
        resolve()
      }, 300)
    }))
})
