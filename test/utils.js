import { formatTimeRemaining, formatTimeIn, canSkip, canPostpone, formatKeyboardShortcut, minutesRemaining, shouldShowNotificationTitle } from '../app/utils/utils'
import { beforeAll, afterAll, vi } from 'vitest'
import 'chai/register-should'
import i18next from 'i18next'
import { join } from 'path'
import Backend from 'i18next-fs-backend'

describe('Times formatters', function () {
  beforeAll(async () => {
    await i18next.use(Backend).init({
      lng: 'en',
      fallbackLng: 'en',
      backend: {
        loadPath: join(__dirname, '/../app/locales/{{lng}}.json'),
        jsonIndent: 2
      }
    })
  })

  it('formats "remaining" milliseconds into correct format', function () {
    formatTimeRemaining(800, 'en', i18next).should.equal('1 second remaining')
    formatTimeRemaining(1000, 'en', i18next).should.equal('1 second remaining')
    formatTimeRemaining(1001, 'en', i18next).should.equal('1 second remaining')
    formatTimeRemaining(2000, 'en', i18next).should.equal('2 seconds remaining')
    formatTimeRemaining(59001, 'en', i18next).should.equal('59 seconds remaining')
    formatTimeRemaining(60001, 'en', i18next).should.equal('1 minute remaining')
    formatTimeRemaining(118001, 'en', i18next).should.equal('1 minute 58 seconds remaining')
    formatTimeRemaining(119001, 'en', i18next).should.equal('1 minute 59 seconds remaining')
    formatTimeRemaining(120000, 'en', i18next).should.equal('2 minutes remaining')
    formatTimeRemaining(120001, 'en', i18next).should.equal('2 minutes remaining')
    formatTimeRemaining(3480001, 'en', i18next).should.equal('58 minutes remaining')
    formatTimeRemaining(3540001, 'en', i18next).should.equal('59 minutes remaining')
    formatTimeRemaining(3600000, 'en', i18next).should.equal('1 hour remaining')
    formatTimeRemaining(3600001, 'en', i18next).should.equal('1 hour remaining')
    formatTimeRemaining(7080001, 'en', i18next).should.equal('1 hour 58 minutes remaining')
    formatTimeRemaining(7180001, 'en', i18next).should.equal('1 hour 59 minutes 40 seconds remaining')
  })

  it('formats "in" milliseconds into correct format', function () {
    formatTimeIn(800, 'en', i18next).should.equal('in about 0 minutes')
    formatTimeIn(58001, 'en', i18next).should.equal('in about 1 minute')
    formatTimeIn(60001, 'en', i18next).should.equal('in about 1 minute')
    formatTimeIn(118001, 'en', i18next).should.equal('in about 2 minutes')
    formatTimeIn(119001, 'en', i18next).should.equal('in about 2 minutes')
    formatTimeIn(120001, 'en', i18next).should.equal('in about 2 minutes')
    formatTimeIn(3480000, 'en', i18next).should.equal('in about 58 minutes')
    formatTimeIn(3540001, 'en', i18next).should.equal('in about 59 minutes')
    formatTimeIn(3600001, 'en', i18next).should.equal('in about 1 hour')
    formatTimeIn(3660000, 'en', i18next).should.equal('in about 1 hour 1 minute')
    formatTimeIn(7140000, 'en', i18next).should.equal('in about 1 hour 59 minutes')
    formatTimeIn(7200000, 'en', i18next).should.equal('in about 2 hours')
    formatTimeIn(7260000, 'en', i18next).should.equal('in about 2 hours 1 minute')
  })
})

describe('canSkip and canPostpone', () => {
  // stubbing date
  beforeAll(() => {
    vi.setSystemTime(1537347700000)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  describe('canSkip', () => {
    // strictMode, postpone, passedPercent, postponePercent
    it('is false when in strict mode I', () => {
      canSkip(true, true, 20, 30).should.equal(false)
    })
    it('is false when in strict mode II', () => {
      canSkip(true, true, 40, 30).should.equal(false)
    })
    it('is false when in strict mode III', () => {
      canSkip(true, false, 20, 30).should.equal(false)
    })
    it('is false when in strict mode IV', () => {
      canSkip(true, false, 40, 30).should.equal(false)
    })
    it('is true when not in strict mode and after postpone percent', () => {
      canSkip(false, true, 40, 30).should.equal(true)
    })
    it('is false when not in strict mode and before postpone percent', () => {
      canSkip(false, true, 20, 30).should.equal(false)
    })
    it('is true when not in strict mode I', () => {
      canSkip(false, false, 40, 30).should.equal(true)
    })
    it('is true when not in strict mode II', () => {
      canSkip(false, false, 20, 30).should.equal(true)
    })
  })

  describe('canPostpone', () => {
    // postpone, passedPercent, postponePercent
    it('is true when postpone and before postpone percent', () => {
      canPostpone(true, 20, 30).should.equal(true)
    })
    it('is false when postpone and after postpone percent', () => {
      canPostpone(true, 40, 30).should.equal(false)
    })
    it('is false when not postpone I', () => {
      canPostpone(false, 20, 30).should.equal(false)
    })
    it('is false when not postpone II', () => {
      canPostpone(false, 40, 30).should.equal(false)
    })
  })

  describe('formatKeyboardShortcut', () => {
    it('formats Or to /', () => {
      formatKeyboardShortcut('CmdOrCtrl+X').should.equal('Cmd/Ctrl + X')
    })
    it('formats + to have spaces', () => {
      formatKeyboardShortcut('Command+X').should.equal('Command + X')
    })
  })

  describe('minutesRemaining', () => {
    it('one minute remaining', () => {
      minutesRemaining(60000).should.equal(1)
    })
    it('less then one minute remaining', () => {
      minutesRemaining(1).should.equal(1)
    })
    it('ten minutes remaining', () => {
      minutesRemaining(600000).should.equal(10)
    })
  })

  describe('shouldShowNotificationTitle', () => {
    it('works for older windows', () => {
      shouldShowNotificationTitle('win32', '10.0.19041').should.equal(true)
      shouldShowNotificationTitle('win32', '6.3.9600').should.equal(true)
    })
    it('works for new windows', () => {
      shouldShowNotificationTitle('win32', '10.0.19042').should.equal(false)
    })
    it('works for older mac', () => {
      shouldShowNotificationTitle('darwin', '10.15.1').should.equal(true)
    })
    it('works for new mac', () => {
      shouldShowNotificationTitle('darwin', '10.16').should.equal(false)
      shouldShowNotificationTitle('darwin', '11.0.1').should.equal(false)
    })
    it('works for others', () => {
      shouldShowNotificationTitle('linux', '1.0.0').should.equal(true)
    })
  })
})
