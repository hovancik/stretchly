class AppIcon {
  constructor ({
    platform,
    paused,
    monochrome,
    inverted,
    darkMode,
    trayIconStyle,
    timeToBreak,
    percentage,
    reference
  }) {
    this.platform = platform
    this.paused = paused
    this.monochrome = monochrome
    this.inverted = inverted
    this.darkMode = darkMode
    this.trayIconStyle = trayIconStyle
    this.timeToBreak = timeToBreak
    this.percentage = percentage
    this.reference = reference
  }

  get trayIconFileName () {
    const pausedString = this.paused ? 'Paused' : ''
    const invertedMonochromeString = this.inverted ? 'Inverted' : ''
    const darkModeString = this.darkMode ? 'Dark' : ''
    let suffixString = ''

    if (!(this.paused || this.reference === 'finishMicrobreak' || this.reference === 'finishBreak')) {
      if (this.trayIconStyle === 'progress' && Number.isInteger(this.percentage) && this.percentage >= 0 && this.percentage <= 100) {
        suffixString = `Progress${this.percentage}`
      } else if (this.trayIconStyle === 'time' && Number.isInteger(this.timeToBreak) && this.timeToBreak >= 0) {
        suffixString = `Number${this.timeToBreak}`
      }
    }

    if (this.monochrome) {
      if (this.platform === 'darwin') {
        return `trayMacMonochrome${pausedString}${suffixString}Template.png`
      } else {
        return `trayMonochrome${invertedMonochromeString}${pausedString}${suffixString}.png`
      }
    } else {
      if (this.platform === 'darwin') {
        return `trayMac${pausedString}${darkModeString}${suffixString}.png`
      } else {
        return `tray${pausedString}${darkModeString}${suffixString}.png`
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

export default AppIcon
