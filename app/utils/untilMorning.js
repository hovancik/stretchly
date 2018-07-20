const suncalc = require('suncalc')
const { millisecondsUntil } = require('./utils')

class UntilMorning {
    constructor(settings, pauseBreaks) {
        this.settings = settings
        this.pauseBreaks = pauseBreaks
    }

    execute() {
        const morningTimes = this.loadMorningTime()
        if (morningTimes === null) {
            console.log('Failed to load morning time, cannot pause')
            return
        }
        const untilMorning = millisecondsUntil(...morningTimes)
        this.pauseBreaks(untilMorning)
    }

    loadMorningTime() {
        const morningHour = this.settings.get('morningHour')
        if (morningHour !== 'sunrise') return [morningHour]

        const lat = this.settings.get('posLatitude')
        const long = this.settings.get('posLongitude')
        const times = suncalc.getTimes(new Date(), lat, long)
        return [times.sunrise.getHours(), times.sunrise.getMinutes()]
    }

}

module.exports = {
    UntilMorning
}