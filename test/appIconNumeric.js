const chai = require('chai')
const AppIcon = require('../app/utils/appIcon')

chai.should()

describe('appIconTimer', function () {
  const pathToGeneratedNumbers = '/numbers/generated-numbers/'

  it('trayIconFileName works for dark mode with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacDark${index}.png`)
    }
  })

  it('trayIconFileName works for dark mode with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytDark${index}.png`)
    }
  })

  it('trayIconFileName works for dark mode with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytDark${index}.png`)
    }
  })

  it('trayIconFileName works for light mode with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMac${index}.png`)
    }
  })

  it('trayIconFileName works for light mode with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}trayt${index}.png`)
    }
  })

  it('trayIconFileName works for light mode with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}trayt${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${index}Template.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on macOS (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${index}Template.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Linux (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Windows (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome inverted with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${index}Template.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${index}.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${index}.png`)
    }
  })

  it('trayIconFileName works for monochrome inverted with numbers on macOS (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${index}Template.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Linux (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${index}.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Windows (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      remainingModeString: 'Number'
    }
    let appIcon = new AppIcon(params)
    for (let index = 0; index <= 99; index++) {
      params = { ...params, remainingTimeString: index.toString() }
      appIcon = new AppIcon(params, { remainingTimeString: index.toString() })
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${index}.png`)
    }
  })
})
