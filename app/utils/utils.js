let formatRemaining = function (seconds) {
  if (seconds < 60) {
    return `${seconds + 1} seconds left`
  } else {
    return `${Math.trunc((seconds / 60) + 1)} minutes left`
  }
}

module.exports.formatRemaining = formatRemaining
