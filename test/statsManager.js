import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import { mkdirSync, rmSync } from 'node:fs'
import StatsManager from '../app/utils/statsManager'

const timeout = process.env.CI ? 30000 : 10000

describe('statsManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let statsManager = null
  const testDir = join(__dirname, 'test-stats-data')

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
    statsManager = new StatsManager(testDir)
  })

  it('should create database and tables', () => new Promise((resolve) => {
    const stats = statsManager.getTodayStats()
    stats.taken.should.be.equal(0)
    stats.skipped.should.be.equal(0)
    stats.postponed.should.be.equal(0)
    stats.scheduled.should.be.equal(0)
    resolve()
  }))

  it('should log break events', () => new Promise((resolve) => {
    statsManager.logBreakEvent('microbreak', 'taken', 20000)
    statsManager.logBreakEvent('break', 'taken', 300000)
    statsManager.logBreakEvent('microbreak', 'skipped', null)
    const stats = statsManager.getTodayStats()
    stats.taken.should.be.equal(2)
    stats.skipped.should.be.equal(1)
    resolve()
  }))

  it('should log scheduled breaks', () => new Promise((resolve) => {
    statsManager.logScheduledBreak()
    statsManager.logScheduledBreak()
    statsManager.logScheduledBreak()
    const stats = statsManager.getTodayStats()
    stats.scheduled.should.be.equal(3)
    resolve()
  }))

  it('should return week history with padding', () => new Promise((resolve) => {
    statsManager.logBreakEvent('microbreak', 'taken', 20000)
    const history = statsManager.getWeekHistory()
    history.length.should.be.equal(7)
    const today = history[6]
    today.taken.should.be.equal(1)
    resolve()
  }))

  it('should return default streak', () => new Promise((resolve) => {
    const streak = statsManager.getStreak()
    streak.current.should.be.equal(0)
    streak.best.should.be.equal(0)
    resolve()
  }))

  it('should handle log after close gracefully', () => new Promise((resolve) => {
    statsManager.close()
    statsManager.logBreakEvent('microbreak', 'taken', 20000)
    const stats = statsManager.getTodayStats()
    stats.taken.should.be.equal(0)
    resolve()
  }))

  afterEach(() => {
    if (statsManager) {
      statsManager.close()
      statsManager = null
    }
    try {
      rmSync(testDir, { recursive: true, force: true })
    } catch (_) {}
  })
})
