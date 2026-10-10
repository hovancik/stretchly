import { formatTimeRemaining, formatElapsedDuration, formatTimeIn, canSkip, canPostpone, formatKeyboardShortcut, minutesRemaining, shouldShowNotificationTitle, formatUnitAndValue, insideFlatpak, insideWindowsStore, insideSnap, insideWindowsPortable, getLinuxDisplayBackend } from '../app/utils/utils'
import { beforeAll, afterAll, vi } from 'vitest'
import { expect } from 'chai'
import 'chai/register-should'
import i18next from 'i18next'
import semver from 'semver'
import { join } from 'path'
import Backend from 'i18next-fs-backend'
import humanizeDuration from 'humanize-duration'

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
    formatTimeRemaining(-800, 'en', i18next, humanizeDuration).should.equal('1 second remaining')
    formatTimeRemaining(800, 'en', i18next, humanizeDuration).should.equal('1 second remaining')
    formatTimeRemaining(1000, 'en', i18next, humanizeDuration).should.equal('1 second remaining')
    formatTimeRemaining(1001, 'en', i18next, humanizeDuration).should.equal('1 second remaining')
    formatTimeRemaining(2000, 'en', i18next, humanizeDuration).should.equal('2 seconds remaining')
    formatTimeRemaining(59001, 'en', i18next, humanizeDuration).should.equal('59 seconds remaining')
    formatTimeRemaining(60001, 'en', i18next, humanizeDuration).should.equal('1 minute remaining')
    formatTimeRemaining(118001, 'en', i18next, humanizeDuration).should.equal('1 minute 58 seconds remaining')
    formatTimeRemaining(119001, 'en', i18next, humanizeDuration).should.equal('1 minute 59 seconds remaining')
    formatTimeRemaining(120000, 'en', i18next, humanizeDuration).should.equal('2 minutes remaining')
    formatTimeRemaining(120001, 'en', i18next, humanizeDuration).should.equal('2 minutes remaining')
    formatTimeRemaining(3480001, 'en', i18next, humanizeDuration).should.equal('58 minutes remaining')
    formatTimeRemaining(3540001, 'en', i18next, humanizeDuration).should.equal('59 minutes remaining')
    formatTimeRemaining(3600000, 'en', i18next, humanizeDuration).should.equal('1 hour remaining')
    formatTimeRemaining(3600001, 'en', i18next, humanizeDuration).should.equal('1 hour remaining')
    formatTimeRemaining(7080001, 'en', i18next, humanizeDuration).should.equal('1 hour 58 minutes remaining')
    formatTimeRemaining(7180001, 'en', i18next, humanizeDuration).should.equal('1 hour 59 minutes 40 seconds remaining')
  })

  it('formats elapsed milliseconds into correct format', function () {
    formatElapsedDuration(-800, 'en', i18next, humanizeDuration).should.equal('1 second elapsed')
    formatElapsedDuration(800, 'en', i18next, humanizeDuration).should.equal('1 second elapsed')
    formatElapsedDuration(1000, 'en', i18next, humanizeDuration).should.equal('1 second elapsed')
    formatElapsedDuration(1001, 'en', i18next, humanizeDuration).should.equal('1 second elapsed')
    formatElapsedDuration(2000, 'en', i18next, humanizeDuration).should.equal('2 seconds elapsed')
    formatElapsedDuration(59001, 'en', i18next, humanizeDuration).should.equal('59 seconds elapsed')
    formatElapsedDuration(60001, 'en', i18next, humanizeDuration).should.equal('1 minute elapsed')
    formatElapsedDuration(118001, 'en', i18next, humanizeDuration).should.equal('1 minute 58 seconds elapsed')
    formatElapsedDuration(119001, 'en', i18next, humanizeDuration).should.equal('1 minute 59 seconds elapsed')
    formatElapsedDuration(120000, 'en', i18next, humanizeDuration).should.equal('2 minutes elapsed')
    formatElapsedDuration(120001, 'en', i18next, humanizeDuration).should.equal('2 minutes elapsed')
    formatElapsedDuration(3600000, 'en', i18next, humanizeDuration).should.equal('1 hour elapsed')
    formatElapsedDuration(3600001, 'en', i18next, humanizeDuration).should.equal('1 hour elapsed')
    formatElapsedDuration(7080001, 'en', i18next, humanizeDuration).should.equal('1 hour 58 minutes elapsed')
    formatElapsedDuration(7180001, 'en', i18next, humanizeDuration).should.equal('1 hour 59 minutes 40 seconds elapsed')
  })

  it('formats "in" milliseconds into correct format', function () {
    formatTimeIn(-800, 'en', i18next, humanizeDuration).should.equal('in about 0 minutes')
    formatTimeIn(800, 'en', i18next, humanizeDuration).should.equal('in about 0 minutes')
    formatTimeIn(58001, 'en', i18next, humanizeDuration).should.equal('in about 1 minute')
    formatTimeIn(60001, 'en', i18next, humanizeDuration).should.equal('in about 1 minute')
    formatTimeIn(118001, 'en', i18next, humanizeDuration).should.equal('in about 2 minutes')
    formatTimeIn(119001, 'en', i18next, humanizeDuration).should.equal('in about 2 minutes')
    formatTimeIn(120001, 'en', i18next, humanizeDuration).should.equal('in about 2 minutes')
    formatTimeIn(3480000, 'en', i18next, humanizeDuration).should.equal('in about 58 minutes')
    formatTimeIn(3540001, 'en', i18next, humanizeDuration).should.equal('in about 59 minutes')
    formatTimeIn(3600001, 'en', i18next, humanizeDuration).should.equal('in about 1 hour')
    formatTimeIn(3660000, 'en', i18next, humanizeDuration).should.equal('in about 1 hour 1 minute')
    formatTimeIn(7140000, 'en', i18next, humanizeDuration).should.equal('in about 1 hour 59 minutes')
    formatTimeIn(7200000, 'en', i18next, humanizeDuration).should.equal('in about 2 hours')
    formatTimeIn(7260000, 'en', i18next, humanizeDuration).should.equal('in about 2 hours 1 minute')
  })

  it('formats unit and value correctly', function () {
    formatUnitAndValue('seconds', 30, i18next).should.equal('30 seconds')
    formatUnitAndValue('seconds', 1, i18next).should.equal('1 second')
    formatUnitAndValue('seconds', 60, i18next).should.equal('1 minute')
    formatUnitAndValue('seconds', 120, i18next).should.equal('2 minutes')
    formatUnitAndValue('seconds', 90, i18next).should.equal('1.5 minutes')
    formatUnitAndValue('seconds', 150, i18next).should.equal('2.5 minutes')
    formatUnitAndValue('minutes', 5, i18next).should.equal('5 minutes')
    formatUnitAndValue('minutes', 1, i18next).should.equal('1 minute')
    formatUnitAndValue('hours', 2, i18next).should.equal('2 hours')
    formatUnitAndValue('hours', 1, i18next).should.equal('1 hour')
  })
})

describe('Others', () => {
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

  describe('lockedDurationPercent', () => {
    // no exits are offered before lockedPercent of the break has elapsed
    it('locks skip before locked percent', () => {
      canSkip(false, false, 3, 30, 5).should.equal(false)
    })
    it('offers skip at locked percent', () => {
      canSkip(false, false, 5, 30, 5).should.equal(true)
    })
    it('locks postpone before locked percent', () => {
      canPostpone(true, 3, 30, 5).should.equal(false)
    })
    it('offers postpone at locked percent', () => {
      canPostpone(true, 5, 30, 5).should.equal(true)
    })
    it('is inert when zero, keeping default behaviour', () => {
      canSkip(false, false, 0, 30, 0).should.equal(true)
      canPostpone(true, 0, 30, 0).should.equal(true)
    })
    it('never overrides strict mode', () => {
      canSkip(true, false, 90, 30, 5).should.equal(false)
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
      minutesRemaining(60 * 1000).should.equal(1)
    })
    it('twenty seconds remaining', () => {
      minutesRemaining(20 * 1000).should.equal(0)
    })
    it('forty seconds remaining', () => {
      minutesRemaining(40 * 1000).should.equal(1)
    })
    it('ten minutes remaining', () => {
      minutesRemaining(600 * 1000).should.equal(10)
    })
  })

  describe('shouldShowNotificationTitle', () => {
    it('works for older windows', () => {
      shouldShowNotificationTitle('win32', '10.0.19041', semver).should.equal(true)
      shouldShowNotificationTitle('win32', '6.3.9600', semver).should.equal(true)
    })
    it('works for new windows', () => {
      shouldShowNotificationTitle('win32', '10.0.19042', semver).should.equal(false)
    })
    it('works for older mac', () => {
      shouldShowNotificationTitle('darwin', '10.15.1', semver).should.equal(true)
    })
    it('works for new mac', () => {
      shouldShowNotificationTitle('darwin', '10.16', semver).should.equal(false)
      shouldShowNotificationTitle('darwin', '11.0.1', semver).should.equal(false)
    })
    it('works for others', () => {
      shouldShowNotificationTitle('linux', '1.0.0', semver).should.equal(true)
    })
  })

  describe('environment helpers', () => {
    it('detects Flatpak on Linux', () => {
      insideFlatpak({ platform: 'linux' }, () => true).should.equal(true)
      insideFlatpak({ platform: 'linux' }, () => false).should.equal(false)
      insideFlatpak({ platform: 'darwin' }, () => true).should.equal(false)
    })

    it('detects Windows Store builds', () => {
      insideWindowsStore({ platform: 'win32', windowsStore: true }).should.equal(true)
      insideWindowsStore({ platform: 'win32', windowsStore: false }).should.equal(false)
      insideWindowsStore({ platform: 'linux', windowsStore: true }).should.equal(false)
    })

    it('detects Snap builds', () => {
      insideSnap({ platform: 'linux', env: { SNAP: '/snap/stretchly' } }).should.equal(true)
      insideSnap({ platform: 'linux', env: {} }).should.equal(false)
      insideSnap({ platform: 'darwin', env: { SNAP: '/snap/stretchly' } }).should.equal(false)
    })

    it('detects portable Windows builds', () => {
      insideWindowsPortable({ platform: 'win32', env: { PORTABLE_EXECUTABLE_DIR: 'C:\\Stretchly' } }).should.equal(true)
      insideWindowsPortable({ platform: 'win32', env: {} }).should.equal(false)
      insideWindowsPortable({ platform: 'linux', env: { PORTABLE_EXECUTABLE_DIR: '/opt/stretchly' } }).should.equal(false)
    })

    describe('getLinuxDisplayBackend', () => {
      it('returns null for non-Linux platforms', () => {
        const backend = getLinuxDisplayBackend('wayland', {
          platform: 'darwin',
          env: { XDG_SESSION_TYPE: 'wayland', WAYLAND_DISPLAY: 'wayland-0' }
        })
        expect(backend).to.equal(null)
      })

      it('returns an explicit Wayland backend', () => {
        getLinuxDisplayBackend(' Wayland ', { platform: 'linux', env: {} }).should.equal('wayland')
      })

      it('returns an explicit X11 backend in a Wayland session', () => {
        getLinuxDisplayBackend(' X11 ', {
          platform: 'linux',
          env: { XDG_SESSION_TYPE: 'wayland', WAYLAND_DISPLAY: 'wayland-0' }
        }).should.equal('x11')
      })

      it('falls back to the Wayland session type', () => {
        getLinuxDisplayBackend('', {
          platform: 'linux',
          env: { XDG_SESSION_TYPE: ' Wayland ', DISPLAY: ':1' }
        }).should.equal('wayland')
      })

      it('falls back to the X11 session type', () => {
        getLinuxDisplayBackend('', {
          platform: 'linux',
          env: { XDG_SESSION_TYPE: ' X11 ', WAYLAND_DISPLAY: 'wayland-0' }
        }).should.equal('x11')
      })

      it('falls back to the Wayland display', () => {
        getLinuxDisplayBackend('', {
          platform: 'linux',
          env: { WAYLAND_DISPLAY: 'wayland-0' }
        }).should.equal('wayland')
      })

      it('falls back to the X11 display', () => {
        getLinuxDisplayBackend('', {
          platform: 'linux',
          env: { DISPLAY: ':1' }
        }).should.equal('x11')
      })

      it('returns null when the Linux backend is unknown', () => {
        expect(getLinuxDisplayBackend('', { platform: 'linux', env: {} })).to.equal(null)
      })
    })
  })
})
