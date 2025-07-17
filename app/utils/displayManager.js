import { screen } from 'electron'

class DisplayManager {
  constructor (settings, log) {
    this.settings = settings
    this.log = log
  }

  getDisplayCount () {
    return screen.getAllDisplays().length
  }

  getTargetDisplay (displayID = -1) {
    let targetScreen

    // If not using all screens, check screen preference
    if (!this.settings.get('allScreens')) {
      const screenSetting = this.settings.get('screen')
      if (screenSetting === 'primary') {
        targetScreen = screen.getPrimaryDisplay()
      } else if (screenSetting === 'cursor') {
        targetScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
      } else {
        displayID = parseInt(screenSetting)
      }
    }

    // If we already have a target screen from settings, return it
    if (targetScreen) {
      return targetScreen
    }

    // Handle displayID-based selection
    if (displayID === -1) {
      targetScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    } else if (displayID >= this.getDisplayCount() || displayID < 0) {
      this.log.warn(`Stretchly: invalid displayID ${displayID}, falling back to cursor display`)
      targetScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    } else {
      const screens = screen.getAllDisplays()
      targetScreen = screens[displayID]
    }

    return targetScreen
  }

  getDisplayBounds (displayID = -1) {
    return this.getTargetDisplay(displayID).bounds
  }

  getDisplayX (displayID = -1, width = 800, fullscreen = false) {
    const bounds = this.getDisplayBounds(displayID)
    if (fullscreen) {
      return Math.floor(bounds.x)
    } else {
      return Math.floor(bounds.x + ((bounds.width - width) / 2))
    }
  }

  getDisplayY (displayID = -1, height = 600, fullscreen = false) {
    const bounds = this.getDisplayBounds(displayID)
    if (fullscreen) {
      return Math.floor(bounds.y)
    } else {
      return Math.floor(bounds.y + ((bounds.height - height) / 2))
    }
  }

  getDisplayWidth (displayID = -1) {
    const bounds = this.getDisplayBounds(displayID)
    return Math.floor(bounds.width)
  }

  getDisplayHeight (displayID = -1) {
    const bounds = this.getDisplayBounds(displayID)
    return Math.floor(bounds.height)
  }

  getWindowPosition (displayID = -1, { width = 800, height = 600, fullscreen = false } = {}) {
    return {
      x: this.getDisplayX(displayID, width, fullscreen),
      y: this.getDisplayY(displayID, height, fullscreen),
      width: fullscreen ? this.getDisplayWidth(displayID) : width,
      height: fullscreen ? this.getDisplayHeight(displayID) : height
    }
  }
}

export default DisplayManager
