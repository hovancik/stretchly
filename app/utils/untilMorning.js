const { getSunrise } = require('sunrise-sunset-js')
const moment = require('moment')
moment().format()

class UntilMorning {
  constructor (settings) {
    this.settings = settings
  }

  /**
   * @return {Integer} milliseconds until morning
   */
  timeUntilMorning () {
    // try for today
    const now = moment.utc(new Date())
    const todaySunrise = this.loadMorningTime(now)
    const untilMorning = todaySunrise - now

    if (untilMorning > 0) {
      return untilMorning
    }

    // sunrise already happened -- calculate for tomorrow
    const tomorrow = moment.utc(new Date()).date(now.date() + 1)
    const tomorrowSunrise = this.loadMorningTime(tomorrow)

    return tomorrowSunrise - now
  }

  /**
   *
   * @param {Date} date - date for morning calculation
   * @return {Date} date and time of sunrise or default time
   */
  loadMorningTime (date) {
    const sunriseDate = moment.utc(new Date(date)) // prevent mutating date object
    const lat = this.settings.get('posLatitude')
    const long = this.settings.get('posLongitude')
    const morningHour = this.settings.get('morningHour')
    const timezoneOffset = (new Date().getTimezoneOffset()) / 60

    if (morningHour === 'sunrise') {
      // do not convert to UTC -- sunrise-sunset-js already has date in correct timezone
      return moment(getSunrise(lat, long, new Date(sunriseDate)))
    }

    return sunriseDate.hours(morningHour + timezoneOffset).minutes(0).seconds(0)
  }
}

module.exports = {
  UntilMorning
}
