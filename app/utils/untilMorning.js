const suncalc = require('suncalc')
const { millisecondsUntil } = require('./utils')

class UntilMorning {
  constructor (settings) {
    this.settings = settings
  }

  execute () {
    const morningTimes = this.loadMorningTime()
    if (morningTimes === null) {
      console.log('Failed to load morning time, cannot pause')
      return
    }
    const untilMorning = millisecondsUntil(...morningTimes)
    return untilMorning
  }

  loadMorningTime (date) {
    let times
    const morningHour = this.settings.get('morningHour')
    if (morningHour !== 'sunrise') return [morningHour]

    const lat = this.settings.get('posLatitude')
    const long = this.settings.get('posLongitude')

    if (date) {
      times = suncalc.getTimes(date, lat, long)
    } else {
      times = suncalc.getTimes(new Date(), lat, long)
    }
    return [times.sunrise.getHours(), times.sunrise.getMinutes()]
  }
}

module.exports = {
  UntilMorning
}
