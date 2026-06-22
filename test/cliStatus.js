import 'chai/register-should'
import {
  formatCliDuration,
  nextLongBreakTime,
  buildCliStatusSnapshot
} from '../app/utils/cliStatus'

describe('formatCliDuration', () => {
  it('returns a human-readable string for 60000ms', () => {
    const result = formatCliDuration(60000)
    result.should.be.a('string')
    result.should.match(/1 minute/)
  })

  it('returns a string containing "hour" for 3660000ms', () => {
    const result = formatCliDuration(3660000)
    result.should.be.a('string')
    result.should.match(/hour/)
  })

  it('returns "unavailable" for a negative number', () => {
    formatCliDuration(-1).should.equal('unavailable')
  })

  it('returns "unavailable" for null', () => {
    formatCliDuration(null).should.equal('unavailable')
  })

  it('returns "unavailable" for undefined', () => {
    formatCliDuration(undefined).should.equal('unavailable')
  })

  it('returns "unavailable" for Infinity', () => {
    formatCliDuration(Infinity).should.equal('unavailable')
  })

  it('returns "unavailable" for NaN', () => {
    formatCliDuration(NaN).should.equal('unavailable')
  })
})

describe('nextLongBreakTime', () => {
  it('returns null when settings.get("break") is false', () => {
    const settings = {
      get: (key) => key === 'break' ? false : undefined
    }
    const breakPlanner = {
      scheduler: { reference: 'startMicrobreak' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: 120000,
      settings,
      breakPlanner
    })
    ;(result === null).should.equal(true)
  })

  it('returns nextBreakTime when reference is "startBreak"', () => {
    const settings = {
      get: (key) => true
    }
    const breakPlanner = {
      scheduler: { reference: 'startBreak' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: 120000,
      settings,
      breakPlanner
    })
    result.should.equal(120000)
  })

  it('returns nextBreakTime when reference is "startBreakNotification"', () => {
    const settings = {
      get: (key) => true
    }
    const breakPlanner = {
      scheduler: { reference: 'startBreakNotification' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: 120000,
      settings,
      breakPlanner
    })
    result.should.equal(120000)
  })

  it('returns null when reference is "finishMicrobreak" (not a start reference)', () => {
    const settings = {
      get: (key) => key === 'break' ? true : undefined
    }
    const breakPlanner = {
      scheduler: { reference: 'finishMicrobreak' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: 120000,
      settings,
      breakPlanner
    })
    ;(result === null).should.equal(true)
  })

  it('calculates correct time to next long break', () => {
    const settings = {
      get: (key) => {
        switch (key) {
          case 'break': return true
          case 'breakInterval': return 3
          case 'microbreakDuration': return 20000
          case 'microbreakInterval': return 300000
          default: return undefined
        }
      }
    }
    const breakPlanner = {
      scheduler: { reference: 'startMicrobreak' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: 120000,
      settings,
      breakPlanner
    })
    // breakInterval = 3+1 = 4, breakNumber = 1%4 = 1
    // miniBreaksUntilLong = 4-1 = 3
    // miniBreakCycle = 20000+300000 = 320000
    // 120000 + 3*320000 = 1080000
    result.should.equal(1080000)
  })

  it('returns null when nextBreakTime is negative', () => {
    const settings = {
      get: (key) => {
        switch (key) {
          case 'break': return true
          case 'breakInterval': return 3
          case 'microbreakDuration': return 20000
          case 'microbreakInterval': return 300000
          default: return undefined
        }
      }
    }
    const breakPlanner = {
      scheduler: { reference: 'startMicrobreak' },
      breakNumber: 1
    }
    const result = nextLongBreakTime({
      nextBreakTime: -1000,
      settings,
      breakPlanner
    })
    ;(result === null).should.equal(true)
  })
})

describe('buildCliStatusSnapshot', () => {
  describe('non-JSON output', () => {
    const json = false

    it('returns error text when breakPlanner is null', () => {
      const settings = { get: () => true }
      const result = buildCliStatusSnapshot({
        breakPlanner: null,
        settings,
        json
      })
      result.should.deep.equal(['Stretchly status is unavailable.'])
    })

    it('returns error text when breakPlanner.scheduler is null', () => {
      const settings = { get: () => true }
      const breakPlanner = { scheduler: null }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal(['Stretchly status is unavailable.'])
    })

    it('returns paused text when breakPlanner.isPaused is true', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: true,
        scheduler: { reference: 'waiting' }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal([
        'Status: paused',
        'Stretchly is paused.'
      ])
    })

    it('returns active break with break_type mini when reference is "finishMicrobreak"', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: false,
        scheduler: {
          reference: 'finishMicrobreak',
          timeLeft: 30000
        }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result[0].should.equal('Status: active break')
      result[1].should.equal('Break type: mini')
      result[2].should.match(/Time to break end/)
      result[2].should.match(/30 seconds/)
    })

    it('returns active break with break_type long when reference is "finishBreak"', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: false,
        scheduler: {
          reference: 'finishBreak',
          timeLeft: 60000
        }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result[0].should.equal('Status: active break')
      result[1].should.equal('Break type: long')
      result[2].should.match(/Time to break end/)
      result[2].should.match(/1 minute/)
    })

    it('returns no_active_break with times when not in a break', () => {
      const settings = {
        get: (key) => {
          switch (key) {
            case 'break': return true
            case 'breakInterval': return 3
            case 'microbreakDuration': return 20000
            case 'microbreakInterval': return 300000
            default: return undefined
          }
        }
      }
      const breakPlanner = {
        isPaused: false,
        scheduler: { reference: 'startMicrobreak' },
        timeToNextBreak: 120000,
        breakNumber: 1
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result[0].should.equal('Status: no active break')
      result[1].should.equal('Time to next break: 2 minutes')
      result[2].should.equal('Time to next long break: 18 minutes')
    })
  })

  describe('JSON output', () => {
    const json = true

    it('returns error JSON when breakPlanner is null', () => {
      const settings = { get: () => true }
      const result = buildCliStatusSnapshot({
        breakPlanner: null,
        settings,
        json
      })
      result.should.deep.equal({ error: 'Stretchly status is unavailable.' })
    })

    it('returns paused JSON when breakPlanner.isPaused is true', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: true,
        scheduler: { reference: 'waiting' }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal({
        status: 'paused',
        reason: 'Stretchly is paused.'
      })
    })

    it('returns active_break JSON when reference is "finishMicrobreak"', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: false,
        scheduler: {
          reference: 'finishMicrobreak',
          timeLeft: 30000
        }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal({
        status: 'active_break',
        break_type: 'mini',
        time_to_break_end: 30000
      })
    })

    it('returns active_break JSON when reference is "finishBreak"', () => {
      const settings = { get: () => true }
      const breakPlanner = {
        isPaused: false,
        scheduler: {
          reference: 'finishBreak',
          timeLeft: 60000
        }
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal({
        status: 'active_break',
        break_type: 'long',
        time_to_break_end: 60000
      })
    })

    it('returns no_active_break JSON with all fields', () => {
      const settings = {
        get: (key) => {
          switch (key) {
            case 'break': return true
            case 'breakInterval': return 3
            case 'microbreakDuration': return 20000
            case 'microbreakInterval': return 300000
            default: return undefined
          }
        }
      }
      const breakPlanner = {
        isPaused: false,
        scheduler: { reference: 'startMicrobreak' },
        timeToNextBreak: 120000,
        breakNumber: 1
      }
      const result = buildCliStatusSnapshot({
        breakPlanner,
        settings,
        json
      })
      result.should.deep.equal({
        status: 'no_active_break',
        time_to_next_break: 120000,
        time_to_next_long_break: 1080000
      })
    })
  })
})
