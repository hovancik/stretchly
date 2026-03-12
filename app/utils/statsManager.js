import Database from 'better-sqlite3'
import log from 'electron-log/main.js'
import { join } from 'node:path'
import { chmodSync, mkdirSync, renameSync } from 'node:fs'

const SCHEMA_VERSION = 1

class StatsManager {
  constructor (userDataPath) {
    this._dbPath = null
    this._db = null
    this._initDb(userDataPath)
  }

  _initDb (userDataPath) {
    const statsDir = join(userDataPath, 'stats')
    try {
      mkdirSync(statsDir, { recursive: true, mode: 0o700 })
    } catch (e) {
      log.error('Stretchly: failed to create stats directory:', e)
    }

    this._dbPath = join(statsDir, 'stretchly-stats.db')
    try {
      this._db = new Database(this._dbPath)
      chmodSync(this._dbPath, 0o600)
      this._db.pragma('journal_mode = WAL')
      this._migrate()
      this._prune()
    } catch (e) {
      log.error('Stretchly: failed to open stats database, creating fresh:', e)
      try {
        const backupPath = this._dbPath + '.backup.' + Date.now()
        renameSync(this._dbPath, backupPath)
        log.info(`Stretchly: corrupted db backed up to ${backupPath}`)
      } catch (_) {}
      this._db = new Database(this._dbPath)
      chmodSync(this._dbPath, 0o600)
      this._db.pragma('journal_mode = WAL')
      this._migrate()
    }
  }

  _migrate () {
    const version = this._db.pragma('user_version', { simple: true })

    if (version < SCHEMA_VERSION) {
      this._db.exec(`
        CREATE TABLE IF NOT EXISTS break_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          break_type TEXT NOT NULL,
          action TEXT NOT NULL,
          duration_ms INTEGER
        );
        CREATE TABLE IF NOT EXISTS daily_summary (
          date TEXT PRIMARY KEY,
          taken INTEGER DEFAULT 0,
          skipped INTEGER DEFAULT 0,
          postponed INTEGER DEFAULT 0,
          scheduled INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS streaks (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          current_streak INTEGER DEFAULT 0,
          best_streak INTEGER DEFAULT 0,
          last_streak_date TEXT
        );
        INSERT OR IGNORE INTO streaks (id, current_streak, best_streak, last_streak_date)
          VALUES (1, 0, 0, NULL);
        PRAGMA user_version = 1;
      `)
    }
  }

  _prune () {
    try {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)
      this._db.prepare('DELETE FROM break_events WHERE timestamp < ?').run(cutoff.toISOString())
    } catch (e) {
      log.error('Stretchly: failed to prune old stats:', e)
    }
  }

  _todayDate () {
    return new Date().toISOString().split('T')[0]
  }

  logBreakEvent (breakType, action, durationMs) {
    if (!this._db) return
    const allowedActions = ['taken', 'skipped', 'postponed']
    if (!allowedActions.includes(action)) {
      log.error(`Stretchly: invalid stats action "${action}" rejected`)
      return
    }
    try {
      const now = new Date().toISOString()
      const today = this._todayDate()

      this._db.prepare(
        'INSERT INTO break_events (timestamp, break_type, action, duration_ms) VALUES (?, ?, ?, ?)'
      ).run(now, breakType, action, durationMs || null)

      this._db.prepare(`
        INSERT INTO daily_summary (date, ${action}, scheduled)
          VALUES (?, 1, 0)
        ON CONFLICT(date) DO UPDATE SET ${action} = ${action} + 1
      `).run(today)
    } catch (e) {
      log.error('Stretchly: failed to log break event:', e)
    }
  }

  logScheduledBreak () {
    if (!this._db) return
    try {
      const today = this._todayDate()
      this._db.prepare(`
        INSERT INTO daily_summary (date, taken, skipped, postponed, scheduled)
          VALUES (?, 0, 0, 0, 1)
        ON CONFLICT(date) DO UPDATE SET scheduled = scheduled + 1
      `).run(today)
    } catch (e) {
      log.error('Stretchly: failed to log scheduled break:', e)
    }
  }

  getTodayStats () {
    if (!this._db) return { taken: 0, skipped: 0, postponed: 0, scheduled: 0 }
    try {
      const today = this._todayDate()
      const row = this._db.prepare('SELECT * FROM daily_summary WHERE date = ?').get(today)
      return row || { taken: 0, skipped: 0, postponed: 0, scheduled: 0 }
    } catch (e) {
      log.error('Stretchly: failed to get today stats:', e)
      return { taken: 0, skipped: 0, postponed: 0, scheduled: 0 }
    }
  }

  getWeekHistory () {
    if (!this._db) return []
    try {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push(d.toISOString().split('T')[0])
      }
      const rows = this._db.prepare(
        'SELECT * FROM daily_summary WHERE date IN (?, ?, ?, ?, ?, ?, ?) ORDER BY date ASC'
      ).all(...days)

      const rowMap = {}
      for (const row of rows) {
        rowMap[row.date] = row
      }

      return days.map(date => rowMap[date] || { date, taken: 0, skipped: 0, postponed: 0, scheduled: 0 })
    } catch (e) {
      log.error('Stretchly: failed to get week history:', e)
      return []
    }
  }

  getStreak () {
    if (!this._db) return { current: 0, best: 0 }
    try {
      const row = this._db.prepare('SELECT * FROM streaks WHERE id = 1').get()
      return { current: row.current_streak, best: row.best_streak }
    } catch (e) {
      log.error('Stretchly: failed to get streak:', e)
      return { current: 0, best: 0 }
    }
  }

  updateStreak () {
    if (!this._db) return
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]

      const row = this._db.prepare('SELECT * FROM daily_summary WHERE date = ?').get(yesterdayDate)
      const streak = this._db.prepare('SELECT * FROM streaks WHERE id = 1').get()

      if (streak.last_streak_date === yesterdayDate) return

      if (row && row.scheduled > 0) {
        const completionRate = row.taken / row.scheduled
        if (completionRate >= 0.8) {
          const newStreak = streak.current_streak + 1
          const newBest = Math.max(streak.best_streak, newStreak)
          this._db.prepare(
            'UPDATE streaks SET current_streak = ?, best_streak = ?, last_streak_date = ? WHERE id = 1'
          ).run(newStreak, newBest, yesterdayDate)
        } else {
          this._db.prepare(
            'UPDATE streaks SET current_streak = 0, last_streak_date = ? WHERE id = 1'
          ).run(yesterdayDate)
        }
      } else {
        this._db.prepare(
          'UPDATE streaks SET current_streak = 0, last_streak_date = ? WHERE id = 1'
        ).run(yesterdayDate)
      }
    } catch (e) {
      log.error('Stretchly: failed to update streak:', e)
    }
  }

  close () {
    if (this._db) {
      try {
        this._db.close()
      } catch (e) {
        log.error('Stretchly: failed to close stats database:', e)
      }
      this._db = null
    }
  }
}

export default StatsManager
