const { millisecondsUntil } = require('./utils')
const { getSunrise } = require('sunrise-sunset-js')

class UntilMorning {
  constructor (settings) {
    this.settings = settings
  }

  timeUntilMorning () {
    const morningTimes = this.loadMorningTime()
    if (morningTimes === null) {
      console.log('Failed to load morning time, cannot pause')
      return
    }
    const untilMorning = millisecondsUntil(...morningTimes)
    return untilMorning
  }

  loadMorningTime (date) {
    let sunrise
    const morningHour = this.settings.get('morningHour')
    if (morningHour !== 'sunrise') return [morningHour]

    const lat = this.settings.get('posLatitude')
    const long = this.settings.get('posLongitude')

    // calculator calculates time based on 0,0 Golf if Guinea.
    // 2 timezones removed from central European time

    if (date) {
      sunrise = getSunrise(lat, long, new Date(date))
    } else {
      sunrise = getSunrise(lat, long, new Date())
    }
    return [sunrise.getHours(), sunrise.getMinutes()]
  }
}

module.exports = {
  UntilMorning
}
