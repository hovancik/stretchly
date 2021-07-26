const chai = require('chai')
const AppIcon = require('../app/utils/appIcon')

chai.should()

describe('appIconTimerCircularTimer', function () {
  const pathToGeneratedNumbers='/round-clock/'
  const iconTimerMode= 'Circle'
  it('trayIconFileName works for dark mode with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacDark${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for dark mode with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytDark${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for dark mode with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytDark${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for light mode with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMac${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for light mode with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}trayt${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for light mode with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: false,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}trayt${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${valueToCheck}Template.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for monochrome with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on macOS (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${valueToCheck}Template.png`)
    }
  })

  it('trayIconFileName works for monochrome with numbers on Linux (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: true,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for monochrome with numbers on Windows (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: false,
      darkMode: false,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochrome${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for monochrome inverted with numbers on macOS', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${valueToCheck}Template.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Linux', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for inverted monochrome with numbers on Windows', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: false,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${valueToCheck}.png`)
    }
  })

  it('trayIconFileName works for monochrome inverted with numbers on macOS (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'darwin',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMacMonochrome${valueToCheck}Template.png`)
    }
  })

  it('trayIconFileName works for inverted monochrome with numbers on Linux (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'linux',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)

      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${valueToCheck}.png`)
    }
  })

    it('trayIconFileName works for inverted monochrome with numbers on Windows (with dark on)', function () {
    let params = {
      paused: false,
      monochrome: true,
      inverted: true,
      darkMode: true,
      platform: 'win32',
      remainingModeString: iconTimerMode
    }
    let appIcon = new AppIcon(params)
    for (let index = 60; index <= 0; index--) {
      params={...params,remainingTimeString: index.toString()}
      appIcon = new AppIcon(params,{remainingTimeString: index.toString()})
      const valueToCheck=getCircularValue(index/60)
      appIcon.trayIconFileName.should.equal(`${pathToGeneratedNumbers}traytMonochromeInverted${valueToCheck}.png`)
    }
  })
  })
function getCircularValue(timeLeftRatio) {
  if(timeLeftRatio>=0.875) {
    pictureNo='0'
  } else if(timeLeftRatio<0.875&&timeLeftRatio>0.75) {
    pictureNo='7'
  } else if(timeLeftRatio<=0.75&&timeLeftRatio>0.625) {
    pictureNo='15'
  } else if(timeLeftRatio<=0.625&&timeLeftRatio>0.5) {
    pictureNo='22'
  } else if(timeLeftRatio<=0.5&&timeLeftRatio>0.375) {
    pictureNo='30'
  } else if(timeLeftRatio<=0.375&&timeLeftRatio>0.25) {
    pictureNo='37'
  } else if(timeLeftRatio<=0.25&&timeLeftRatio>0.125) {
    pictureNo='45'
  } else if(timeLeftRatio<=0.125&&timeLeftRatio>0.065) {
    pictureNo='52'
  } else {
    pictureNo='60'
  }
  return pictureNo
}

