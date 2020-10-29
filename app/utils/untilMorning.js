const sun = require('./sun')
const { DateTime } = require('luxon')
const log = require('electron-log')

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
      const sunrise = sun.sunrise(new Date(dt.toISO()), lat, long)
      nextMornigDt = DateTime.local(sunrise.getFullYear(), sunrise.getMonth() + 1,
        sunrise.getDate(), sunrise.getHours(), sunrise.getMinutes())
      morningHour = sunrise.getHours()
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
