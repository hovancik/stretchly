const { getSunrise } = require('sunrise-sunset-js')

class UntilMorning {
  constructor (settings) {
    this.settings = settings
  }

  /**
   *
   * @param {Date} now - date with current time
   * @param {Date} sunrise - date with sunrise time
   * @return {Integer} number of milliseconds between dates
   */
  millisecondsBetween (now, sunrise) {
    return sunrise - now
  }

  /**
   * @return {Integer} milliseconds until morning
   */
  timeUntilMorning () {
    // try for today
    const now = new Date()
    const todaySunrise = this.loadMorningTime(now)

    let untilMorning = this.millisecondsBetween(now, todaySunrise)

    if (untilMorning > 0) {
      return untilMorning
    }

    // sunrise already happened -- calculate for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)

    const tomorrowSunrise = this.loadMorningTime(tomorrow)

    return this.millisecondsBetween(now, tomorrowSunrise)
  }

  /**
   *
   * @param {Date} date - date for morning calculation
   * @return {Date} date and time of sunrise
   */
  loadMorningTime (date) {
    const sunriseDate = new Date(date) // prevent mutating date object
    const lat = this.settings.get('posLatitude')
    const long = this.settings.get('posLongitude')
    const morningHour = this.settings.get('morningHour')

    if (morningHour === 'sunrise') {
      // calculator calculates time based on 0,0 Golf if Guinea.
      // 2 timezones removed from central European time
      return getSunrise(lat, long, sunriseDate)
    }

    // get a date here
    sunriseDate.setHours(morningHour, 0, 0, 0)
    return sunriseDate
  }
}

module.exports = {
  UntilMorning
}
