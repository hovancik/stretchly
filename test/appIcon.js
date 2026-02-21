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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacDarkNumber2.png')
  })

  it('trayIconFileName works for dark mode on macOS with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacDarkProgress20.png')
  })

  it('trayIconFileName works for dark mode on Linux', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkNumber2.png')
  })

  it('trayIconFileName works for dark mode on Linux with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkProgress20.png')
  })

  it('trayIconFileName works for dark mode on Windows', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkNumber2.png')
  })

  it('trayIconFileName works for dark mode on Windows with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayDarkProgress20.png')
  })

  it('trayIconFileName works for paused dark mode on macOS', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacNumber2.png')
  })

  it('trayIconFileName works for light mode on macOS with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacProgress20.png')
  })

  it('trayIconFileName works for light mode on Linux', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayNumber2.png')
  })

  it('trayIconFileName works for light mode on Linux with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayProgress20.png')
  })

  it('does not add Number when timeToBreak is negative', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'time',
      timeToBreak: -1,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName works for light mode on Windows', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayNumber2.png')
  })

  it('trayIconFileName works for light mode on Windows with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayProgress20.png')
  })

  it('trayIconFileName works for paused light mode on macOS', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeNumber2Template.png')
  })

  it('trayIconFileName works for monochrome on macOS with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeProgress20Template.png')
  })

  it('trayIconFileName works for monochrome on Linux', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for monochrome on Linux with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeProgress20.png')
  })

  it('trayIconFileName works for monochrome on Windows', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeNumber2.png')
  })

  it('trayIconFileName works for monochrome on Windows with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeProgress20.png')
  })

  it('trayIconFileName works for paused monochrome on macOS', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for inverted monochrome on Linux with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedProgress20.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
      timeToBreak: 2,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedNumber2.png')
  })

  it('trayIconFileName works for inverted monochrome on Windows with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMonochromeInvertedProgress20.png')
  })

  it('trayIconFileName works for paused inverted monochrome on macOS', function () {
    const params = {
      paused: true,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'time',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'default',
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
      trayIconStyle: 'default',
      timeToBreak: 2,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.windowIconFileName.should.equal('trayMonochromeInverted.png')
  })

  it('trayIconFileName does not show progress when paused', function () {
    const params = {
      paused: true,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayPaused.png')
  })

  it('trayIconFileName does not show progress when finishing microbreak', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'finishMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName does not show progress when finishing break', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'finishBreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName works with 0 percentage', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 0,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayProgress0.png')
  })

  it('trayIconFileName works with 100 percentage', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 100,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayProgress100.png')
  })

  it('trayIconFileName works for inverted monochrome on macOS with progress in tray', function () {
    const params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      trayIconStyle: 'progress',
      percentage: 20,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMacMonochromeProgress20Template.png')
  })

  it('trayIconFileName ignores invalid percentage', function () {
    const params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      trayIconStyle: 'progress',
      percentage: 101,
      reference: 'startMicrobreak'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })
})
