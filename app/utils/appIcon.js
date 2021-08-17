class AppIcon {
  constructor ({
    platform,
    paused,
    monochrome,
    inverted,
    darkMode,
    remainingModeString,
    remainingTimeString,
    totalLongBreak
  }) {
    this.platform = platform
    this.paused = paused
    this.monochrome = monochrome
    this.inverted = inverted
    this.darkMode = darkMode
    this.remainingModeString = remainingModeString
    this.remainingTimeString = remainingTimeString
    this.totalLongBreak = totalLongBreak // required only for circular timer
  }

  get trayIconFileName () {
    const pausedString = this.paused ? 'Paused' : ''
    const invertedMonochromeString = this.inverted ? 'Inverted' : ''
    const darkModeString = this.darkMode ? 'Dark' : ''
    const monochrome = this.monochrome ? 'Monochrome' : ''
    if (this.remainingModeString === '' || pausedString === 'Paused') {
      if (this.monochrome) {
        if (this.platform === 'darwin') {
          return `trayMacMonochrome${pausedString}Template.png`
        } else {
          return `trayMonochrome${invertedMonochromeString}${pausedString}.png`
        }
      } else {
        if (this.platform === 'darwin') {
          return `trayMac${pausedString}${darkModeString}.png`
        } else {
          return `tray${pausedString}${darkModeString}.png`
        }
      }
    } else if (this.remainingModeString === 'Number') {
      const minRemain = parseInt(this.remainingTimeString)
      const returnVal = this.iconWithNumber(
        '/numbers/generated-numbers/',
        minRemain,
        darkModeString,
        monochrome,
        this.platform,
        invertedMonochromeString
      )
      return returnVal
    } else {
      // Circle
      const minRemain = parseInt(this.remainingTimeString)
      const returnVal = this.pathWithCircularIcon(
        '/round-clock/',
        minRemain,
        this.totalLongBreak,
        darkModeString,
        monochrome,
        this.platform,
        invertedMonochromeString
      )
      return returnVal
    }
  }

  iconWithNumber (
    imagePath,
    minutesToLongBreak,
    darkModeString,
    monochrome,
    platform,
    invertedMonochromeString
  ) {
    let minutesOnTray = minutesToLongBreak
    let minutesAsNumber = 99
    try {
      minutesAsNumber = Number(minutesOnTray)
    } catch (er) {
      minutesAsNumber = 99
    }
    if (minutesAsNumber >= 99) {
      minutesOnTray = '99'
    }
    if (monochrome) {
      if (platform === 'darwin') {
        return `${imagePath}traytMacMonochrome${minutesOnTray}Template.png`
      } else {
        return `${imagePath}traytMonochrome${invertedMonochromeString}${minutesOnTray}.png`
      }
    } else {
      if (platform === 'darwin') {
        return `${imagePath}traytMac${darkModeString}${minutesOnTray}.png`
      } else {
        return `${imagePath}trayt${darkModeString}${minutesOnTray}.png`
      }
    }
  }

  pathWithCircularIcon (
    imagePath,
    minutesToLongBreak,
    totalLongBreak,
    darkModeString,
    monochrome,
    platform,
    invertedMonochromeString
  ) {
    const minutesOnTray = minutesToLongBreak
    const timeLeftRatio = minutesOnTray / totalLongBreak

    let pictureNo = '0'
    if (timeLeftRatio >= 0.875) {
      pictureNo = '0'
    } else if (timeLeftRatio < 0.875 && timeLeftRatio > 0.75) {
      pictureNo = '7'
    } else if (timeLeftRatio <= 0.75 && timeLeftRatio > 0.625) {
      pictureNo = '15'
    } else if (timeLeftRatio <= 0.625 && timeLeftRatio > 0.5) {
      pictureNo = '22'
    } else if (timeLeftRatio <= 0.5 && timeLeftRatio > 0.375) {
      pictureNo = '30'
    } else if (timeLeftRatio <= 0.375 && timeLeftRatio > 0.25) {
      pictureNo = '37'
    } else if (timeLeftRatio <= 0.25 && timeLeftRatio > 0.125) {
      pictureNo = '45'
    } else if (timeLeftRatio <= 0.125 && timeLeftRatio > 0.065) {
      pictureNo = '52'
    } else {
      pictureNo = '60'
    }
    if (monochrome) {
      if (platform === 'darwin') {
        return `${imagePath}traytMacMonochrome${pictureNo}Template.png`
      } else {
        return `${imagePath}traytMonochrome${invertedMonochromeString}${pictureNo}.png`
      }
    } else {
      if (platform === 'darwin') {
        return `${imagePath}traytMac${darkModeString}${pictureNo}.png`
      } else {
        return `${imagePath}trayt${darkModeString}${pictureNo}.png`
      }
    }
  }


  get windowIconFileName () {
    const invertedMonochromeString = this.inverted ? 'Inverted' : ''
    const darkModeString = this.darkMode ? 'Dark' : ''

    if (this.monochrome) {
      return `trayMonochrome${invertedMonochromeString}.png`
    } else {
      return `tray${darkModeString}.png`
    }
  }
}

module.exports = AppIcon
