const { DateTime } = require('luxon')
const MeeusSunMoon = require('meeussunmoon')
const log = require('electron-log/main')

class UntilMorning {
  constructor (settings) {
    this.settings = settings
  }

  msToSunrise (dt = DateTime.local()) {
    let morningHour = this.settings.get('morningHour')
    let nextMornigDt

    if (morningHour === 'sunrise') {
      const lat = this.settings.get('posLatitude')
      const long = this.settings.get('posLongitude')
      nextMornigDt = MeeusSunMoon.sunrise(dt, lat, long)
      morningHour = nextMornigDt.hour
    } else {
      nextMornigDt = dt.set({ hours: morningHour, minutes: 0, seconds: 0 })
    }

    if (dt.hour >= morningHour) {
      nextMornigDt = nextMornigDt.plus({ days: 1 })
    }

    log.info(`Stretchly: got ${nextMornigDt.toLocaleString(DateTime.DATETIME_FULL)} as sunrise time for ${dt.toLocaleString(DateTime.DATETIME_FULL)}`)
    return nextMornigDt.diff(dt).toObject().milliseconds
  }
}

module.exports = {
  UntilMorning
}
