let formatRemaining = function (seconds) {
  if (seconds < 60) {
    return `${seconds + 1} seconds left`
  } else {
    return `${Math.trunc((seconds / 60) + 1)} minutes left`
  }
}

let updateProgress = function (started, duration, progress, progressTime) {
  if (Date.now() - started < duration) {
    progress.value = (Date.now() - started) / duration * 10000
    progressTime.innerHTML = formatRemaining(Math.trunc((duration - Date.now() + started) / 1000))
  }
}

let formatTillBreak = function(milliseconds) {
  let minutes = Math.round(milliseconds / 60000);
  if (minutes < 1) {
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0)
    return `${seconds}s`
  } else {
    return `${minutes}m`
  }
}

let formatPauseTimeLeft = function (milliseconds) {
  let timeString = ''
  let hours = Math.floor(milliseconds / (1000 * 3600))
  let remainder = (milliseconds - hours * 1000 * 3600)
  let minutes = Math.floor(remainder / 60000)
  if (minutes >= 60) {
    minutes -= 60
    hours += 1
  }
  if (hours >= 1) {
    timeString += `${hours}h`
  }
  if (minutes >= 1) {
    timeString += `${minutes}m`
  }
  if (minutes < 1 && hours < 1) {
    timeString = 'less than 1m'
  }
  return timeString
}


module.exports.formatRemaining = formatRemaining
module.exports.formatTillBreak = formatTillBreak
module.exports.formatPauseTimeLeft = formatPauseTimeLeft
module.exports.updateProgress = updateProgress
