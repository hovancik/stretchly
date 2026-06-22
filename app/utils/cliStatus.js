import humanizeDuration from 'humanize-duration'

function formatCliDuration (milliseconds) {
  if (milliseconds === null || milliseconds === undefined || !Number.isFinite(milliseconds) || milliseconds < 0) {
    return 'unavailable'
  }
  return humanizeDuration(milliseconds, {
    round: true,
    largest: 2
  })
}

function nextLongBreakTime ({ nextBreakTime, settings, breakPlanner }) {
  if (!settings.get('break')) {
    return null
  }

  const reference = breakPlanner.scheduler.reference
  if (reference === 'startBreak' || reference === 'startBreakNotification') {
    return nextBreakTime
  }

  if (reference !== 'startMicrobreak' && reference !== 'startMicrobreakNotification') {
    return null
  }

  if (!Number.isFinite(nextBreakTime) || nextBreakTime < 0) {
    return null
  }

  const breakInterval = settings.get('breakInterval') + 1
  const breakNumber = breakPlanner.breakNumber % breakInterval
  const miniBreaksUntilLong = breakInterval - breakNumber
  const miniBreakCycle = settings.get('microbreakDuration') + settings.get('microbreakInterval')

  return nextBreakTime + miniBreaksUntilLong * miniBreakCycle
}

function buildCliStatusSnapshot ({ breakPlanner, settings, json = false }) {
  if (!breakPlanner || !breakPlanner.scheduler || !settings) {
    if (json) {
      return { error: 'Stretchly status is unavailable.' }
    }
    return ['Stretchly status is unavailable.']
  }

  if (breakPlanner.isPaused) {
    if (json) {
      return {
        status: 'paused',
        reason: 'Stretchly is paused.'
      }
    }
    return [
      'Status: paused',
      'Stretchly is paused.'
    ]
  }

  const reference = breakPlanner.scheduler.reference
  if (reference === 'finishMicrobreak' || reference === 'finishBreak') {
    if (json) {
      return {
        status: 'active_break',
        break_type: reference === 'finishMicrobreak' ? 'mini' : 'long',
        time_to_break_end: breakPlanner.scheduler.timeLeft
      }
    }
    return [
      'Status: active break',
      `Break type: ${reference === 'finishMicrobreak' ? 'mini' : 'long'}`,
      `Time to break end: ${formatCliDuration(breakPlanner.scheduler.timeLeft)}`
    ]
  }

  const nextBreakTime = breakPlanner.timeToNextBreak
  const longBreakTime = nextLongBreakTime({ nextBreakTime, settings, breakPlanner })

  if (json) {
    return {
      status: 'no_active_break',
      time_to_next_break: nextBreakTime,
      time_to_next_long_break: settings.get('break') ? longBreakTime : null
    }
  }

  return [
    'Status: no active break',
    `Time to next break: ${formatCliDuration(nextBreakTime)}`,
    `Time to next long break: ${settings.get('break') ? formatCliDuration(longBreakTime) : 'disabled'}`
  ]
}

export {
  formatCliDuration,
  nextLongBreakTime,
  buildCliStatusSnapshot
}
