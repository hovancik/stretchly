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

module.exports.formatRemaining = formatRemaining
module.exports.updateProgress = updateProgress
