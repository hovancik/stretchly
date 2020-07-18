// Get path of correct app icon based on different criteria

class AppIcon {
  constructor ({ platform, paused, monochrome, inverted, darkMode }) {
    this.platform = platform
    this.paused = paused
    this.monochrome = monochrome
    this.inverted = inverted
    this.darkMode = darkMode
  }

  get trayIconFileName () {
    const pausedString = this.paused ? 'Paused' : ''
    const invertedMonochromeString = this.inverted ? 'Inverted' : ''
    const darkModeString = this.darkMode ? 'Dark' : ''

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
