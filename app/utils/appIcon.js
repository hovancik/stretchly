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
      } else if (this.trayIconStyle === 'time' && Number.isInteger(this.timeToBreak) && this.timeToBreak >= 0 && this.timeToBreak <= 99) {
        suffixString = `Number${this.timeToBreak}`
      }
    }

    if (this.monochrome) {
      if (this.platform === 'darwin') {
        return `trayMacMonochrome${pausedString}${suffixString}Template.png`
      } else {
        const extString = this.platform === 'win32' ? 'ico' : 'png'
        return `trayMonochrome${invertedMonochromeString}${pausedString}${suffixString}.${extString}`
      }
    } else {
      if (this.platform === 'darwin') {
        return `trayMac${pausedString}${darkModeString}${suffixString}.png`
      } else {
        const extString = this.platform === 'win32' ? 'ico' : 'png'
        return `tray${pausedString}${darkModeString}${suffixString}.${extString}`
      }
    }
  }

  get windowIconFileName () {
    const darkModeString = this.darkMode ? 'Dark' : ''

    return `tray${darkModeString}.png`
  }
}

export default AppIcon
