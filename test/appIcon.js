import 'chai/register-should'
import AppIcon from '../app/utils/appIcon'

describe('appIcon', function () {
  it('trayIconFileName works for dark mode on macOS', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacDark.png')
  })

  it('trayIconFileName works for dark mode on macOS with time in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacDarkNumber2.png')
  })

  it('trayIconFileName works for dark mode on Linux', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDark.png')
  })

  it('trayIconFileName works for dark mode on Linux with time in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkNumber2.png')
  })

  it('trayIconFileName works for dark mode on Windows', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDark.png')
  })

  it('trayIconFileName works for dark mode on Windows with time in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkNumber2.png')
  })

  it('trayIconFileName works for paused dark mode on macOS', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacPausedDark.png')
  })

  it('trayIconFileName works for paused dark mode on macOS with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacPausedDark.png')
  })

  it('trayIconFileName works for paused dark mode on Linux', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPausedDark.png')
  })

  it('trayIconFileName works for paused dark mode on Linux with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPausedDark.png')
  })

  it('trayIconFileName works for paused dark mode on Windows', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPausedDark.png')
  })

  it('trayIconFileName works for paused dark mode on Windows with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPausedDark.png')
  })

  it('trayIconFileName works for light mode on macOS', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMac.png')
  })

  it('trayIconFileName works for light mode on macOS with time in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacNumber2.png')
  })

  it('trayIconFileName works for light mode on Linux', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName works for light mode on Linux with number in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayNumber2.png')
  })

  it('trayIconFileName works for light mode on Windows', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName works for light mode on Windows with tray on', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayNumber2.png')
  })

  it('trayIconFileName works for paused light mode on macOS', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacPaused.png')
  })

  it('trayIconFileName works for paused light mode on macOS with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacPaused.png')
  })

  it('trayIconFileName works for paused light mode on Linux', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPaused.png')
  })

  it('trayIconFileName works for paused light mode on Linux with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPaused.png')
  })

  it('trayIconFileName works for paused light mode on Windows', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPaused.png')
  })

  it('trayIconFileName works for paused light mode on Windows with time in tray', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPaused.png')
  })

  it('trayIconFileName works for monochrome on macOS', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeTemplate.png')
  })

  it('trayIconFileName works for monochrome on macOS with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeNumber2Template.png')
  })

  it('trayIconFileName works for monochrome on Linux', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochrome.png')
  })

  it('trayIconFileName works for monochrome on Linux with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for monochrome on Windows', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochrome.png')
  })

  it('trayIconFileName works for monochrome on Windows with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for paused monochrome on macOS', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused monochrome on macOS with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused monochrome on Linux', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Linux with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Windows', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Windows with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for monochrome on macOS (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeTemplate.png')
  })

  it('trayIconFileName works for monochrome on macOS (with dark on) and time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeNumber2Template.png')
  })

  it('trayIconFileName works for monochrome on Linux (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochrome.png')
  })

  it('trayIconFileName works for monochrome on Linux (with dark on) and time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for monochrome on Windows (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochrome.png')
  })

  it('trayIconFileName works for monochrome on Windows (with dark on) and time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for paused monochrome on macOS (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused monochrome on macOS (with dark on) and time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused monochrome on Linux (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Linux (with dark on) and time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Windows (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for paused monochrome on Windows (with dark on) and time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromePaused.png')
  })

  it('trayIconFileName works for inverted monochrome on macOS', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeTemplate.png')
  })

  it('trayIconFileName works for inverted monochrome on macOS and time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeNumber2Template.png')
  })

  it('trayIconFileName works for inverted monochrome on Linux', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInverted.png')
  })

  it('trayIconFileName works for inverted monochrome on Linux with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInverted.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for paused inverted monochrome on macOS', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused inverted monochrome on macOS with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Linux', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Linux with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Windows', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Windows with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for inverted monochrome on macOS (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeTemplate.png')
  })

  it('trayIconFileName works for inverted monochrome on macOS (with dark on) and time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeNumber2Template.png')
  })

  it('trayIconFileName works for inverted monochrome on Linux (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInverted.png')
  })

  it('trayIconFileName works for inverted monochrome on Linux (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows (with dark on)', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInverted.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows (with dark on) with time in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for paused inverted monochrome on macOS (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused inverted monochrome on macOS (with dark on) with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromePausedTemplate.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Linux (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Linux (with dark on) with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Windows (with dark on)', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('trayIconFileName works for paused inverted monochrome on Windows (with dark on) with time in tray', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: true,
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedPaused.png')
  })

  it('windowIconFileName works for dark', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.windowIconFileName.should.equal('trayDark.png')
  })

  it('windowIconFileName works for light', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.windowIconFileName.should.equal('tray.png')
  })

  it('windowIconFileName works for monochrome', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.windowIconFileName.should.equal('trayMonochrome.png')
  })

  it('windowIconFileName works for monochrome', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      timeToBreakInTray: false,
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.windowIconFileName.should.equal('trayMonochromeInverted.png')
  })
})
