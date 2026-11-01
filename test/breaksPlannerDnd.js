import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import { rm } from 'node:fs/promises'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import BreaksPlanner from '../app/breaksPlanner'

describe('breaksPlanner Do Not Disturb', function () {
  let settings, planner

  beforeEach(() => {
    vi.useFakeTimers()
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-breaksPlannerDnd',
      defaults: { ...defaultSettings, monitorDnd: false, naturalBreaks: false }
    })
    settings.set('microbreakInterval', 10000)
    settings.set('microbreakNotification', false)
    settings.set('break', false)
    planner = new BreaksPlanner(settings)
    planner.nextBreak()
  })

  afterEach(async () => {
    planner.scheduler.cancel()
    vi.useRealTimers()
    await rm(join(__dirname, 'test-settings-breaksPlannerDnd.json'), { force: true })
  })

  const run = (dndMs) => {
    const started = []
    planner.on('startMicrobreak', () => started.push(Date.now()))
    vi.advanceTimersByTime(4000)
    planner.dndManager.emit('dndStarted')
    vi.advanceTimersByTime(dndMs)
    const t0 = Date.now()
    planner.dndManager.emit('dndFinished')
    vi.advanceTimersByTime(20000)
    return started.map(t => t - t0)
  }

  it('remaining time minus DND duration', () => {
    run(1000)[0].should.equal(5000)
  })

  it('starts immediately if elapsed during DND', () => {
    run(8000)[0].should.be.at.most(100)
  })

  it('skip during DND does not cause duplicate breaks', () => {
    let started = 0
    planner.on('startMicrobreak', () => { started++ })
    vi.advanceTimersByTime(4000)
    planner.dndManager.emit('dndStarted')
    planner.skipToMicrobreak(5000)
    vi.advanceTimersByTime(1000)
    planner.dndManager.emit('dndFinished')
    vi.advanceTimersByTime(20000)
    started.should.equal(1)
  })

  it('natural break during DND waits full interval after DND', () => {
    const started = []
    planner.on('startMicrobreak', () => started.push(Date.now()))
    vi.advanceTimersByTime(4000)
    planner.dndManager.isOnDnd = true
    planner.dndManager.emit('dndStarted')
    vi.advanceTimersByTime(8000)
    planner.naturalBreaksManager.emit('naturalBreakFinished')
    planner.dndManager.isOnDnd = false
    const t0 = Date.now()
    planner.dndManager.emit('dndFinished')
    vi.advanceTimersByTime(20000)
    started.map(t => t - t0).should.deep.equal([10000])
  })
})
