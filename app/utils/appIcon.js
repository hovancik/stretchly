class AppIcon {
  constructor ({
    platform,
    paused,
    monochrome,
    inverted,
    darkMode,
    timeToBreakInTray,
    timeToBreak,
    reference
  }) {
    this.platform = platform
    this.paused = paused
    this.monochrome = monochrome
    this.inverted = inverted
    this.darkMode = darkMode
    this.timeToBreakInTray = timeToBreakInTray
    this.timeToBreak = timeToBreak
    this.reference = reference
  }

  get trayIconFileName () {
    const pausedString = this.paused ? 'Paused' : ''
    const invertedMonochromeString = this.inverted ? 'Inverted' : ''
    const darkModeString = this.darkMode ? 'Dark' : ''
    const timeToBreakInTrayString = (this.paused || this.reference === 'finishMicrobreak' ||
      this.reference === 'finishBreak' || !this.timeToBreakInTray || !Number.isInteger(this.timeToBreak))
      ? ''
      : `Number${this.timeToBreak}`

    if (this.monochrome) {
      if (this.platform === 'darwin') {
        return `trayMacMonochrome${pausedString}${timeToBreakInTrayString}Template.png`
      } else {
        return `trayMonochrome${invertedMonochromeString}${pausedString}${timeToBreakInTrayString}.png`
      }
    } else {
      if (this.platform === 'darwin') {
        return `trayMac${pausedString}${darkModeString}${timeToBreakInTrayString}.png`
      } else {
        return `tray${pausedString}${darkModeString}${timeToBreakInTrayString}.png`
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
