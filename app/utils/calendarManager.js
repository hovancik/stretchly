import EventEmitter from 'events'
import log from 'electron-log/main.js'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

class CalendarManager extends EventEmitter {
  constructor (settings) {
    super()
    this.settings = settings
    this.monitorCalendar = settings.get('monitorCalendar')
    this.timer = null
    this._upcomingEvents = []
    this._hasConflict = false
    this._permissionDenied = false
    this._errorLogged = {}

    if (this.monitorCalendar && process.platform === 'darwin') {
      this.start()
    }
  }

  start () {
    if (process.platform !== 'darwin') return
    if (this._permissionDenied) return
    this.monitorCalendar = true
    this._checkCalendar()
    log.info('Stretchly: starting calendar monitoring')
  }

  stop () {
    this.monitorCalendar = false
    this._upcomingEvents = []
    this._hasConflict = false
    clearInterval(this.timer)
    this.timer = null
    log.info('Stretchly: stopping calendar monitoring')
  }

  get isSchedulerCleared () {
    return false
  }

  getNextFreeSlot (afterMs, durationMs) {
    if (!this._upcomingEvents.length) return 0

    const now = Date.now()
    const breakStart = now + afterMs
    const breakEnd = breakStart + durationMs
    const bufferMs = (this.settings.get('calendarBufferMinutes') || 5) * 60 * 1000

    for (const event of this._upcomingEvents) {
      const eventStart = event.start - bufferMs
      const eventEnd = event.end + bufferMs

      if (breakStart < eventEnd && breakEnd > eventStart) {
        const shiftedStart = eventEnd
        return shiftedStart - now
      }
    }

    return 0
  }

  async _isCalendarRunning () {
    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const { stdout } = await asyncExec(
        'osascript -e \'application "Calendar" is running\''
      )
      return stdout.trim() === 'true'
    } catch (e) {
      return false
    }
  }

  async _getUpcomingEvents () {
    if (!this.monitorCalendar || this._permissionDenied) return []

    const isRunning = await this._isCalendarRunning()
    if (!isRunning) return this._upcomingEvents

    try {
      const asyncExec = this._getOrCreateAsyncExec()
      const script = `osascript -e '
tell application "Calendar"
  set now to current date
  set later to now + 2 * hours
  set output to ""
  repeat with c in calendars
    repeat with e in (every event of c whose start date >= now and start date <= later)
      set s to (year of start date of e) & "-" & (month of start date of e as integer) & "-" & (day of start date of e) & "T" & (hours of start date of e) & ":" & (minutes of start date of e)
      set f to (year of end date of e) & "-" & (month of end date of e as integer) & "-" & (day of end date of e) & "T" & (hours of end date of e) & ":" & (minutes of end date of e)
      set output to output & s & "|" & f & "\\n"
    end repeat
  end repeat
  return output
end tell'`
      const { stdout } = await asyncExec(script, { timeout: 10000 })
      return this._parseEvents(stdout)
    } catch (e) {
      if (e.message && e.message.includes('Not authorized')) {
        this._permissionDenied = true
        log.warn('Stretchly: Calendar access denied by user')
        this.emit('calendarPermissionDenied')
        this.stop()
        return []
      }
      this._logErrorOnce('calendar-query', e)
      return this._upcomingEvents
    }
  }

  _parseEvents (output) {
    const events = []
    const lines = output.trim().split('\n').filter(l => l.includes('|'))

    for (const line of lines) {
      const [startStr, endStr] = line.split('|')
      const start = this._parseDate(startStr)
      const end = this._parseDate(endStr)
      if (start && end) {
        events.push({ start: start.getTime(), end: end.getTime() })
      }
    }

    events.sort((a, b) => a.start - b.start)
    return events
  }

  _parseDate (str) {
    if (!str) return null
    const parts = str.trim().match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+)/)
    if (!parts) return null
    const [, year, month, day, hour, minute] = parts
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    )
  }

  _getOrCreateAsyncExec () {
    if (!this.__asyncExec) {
      this.__asyncExec = promisify(exec)
    }
    return this.__asyncExec
  }

  _logErrorOnce (context, error) {
    const errorKey = `${context}-${error.code || error.message.substring(0, 20)}`
    if (!this._errorLogged[errorKey]) {
      log.error(`Stretchly: calendar detection error in ${context}:`, error)
      this._errorLogged[errorKey] = true
    }
  }

  _checkCalendar () {
    const interval = this.settings.get('calendarCheckInterval') || 60000
    this.timer = setInterval(async () => {
      this._upcomingEvents = await this._getUpcomingEvents()
      const hadConflict = this._hasConflict
      this._hasConflict = this._upcomingEvents.length > 0

      if (!hadConflict && this._hasConflict) {
        this.emit('calendarConflict')
      }
      if (hadConflict && !this._hasConflict) {
        this.emit('calendarClear')
      }
    }, interval)
  }
}

export default CalendarManager
