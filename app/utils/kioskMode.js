function usesOverlayFullscreen ({ platform, fullscreen, useKioskMode, showBreaksAsRegularWindows }) {
  return platform === 'darwin' && Boolean(fullscreen) &&
    useKioskMode === false && !showBreaksAsRegularWindows
}

function overlayFullscreenWindowOptions ({ x, y, width, height }) {
  return {
    x,
    y,
    width,
    height,
    enableLargerThanScreen: true,
    roundedCorners: false,
    titleBarStyle: 'default',
    titleBarOverlay: false
  }
}

function overlayFullscreenBounds ({ x, y, width, height }) {
  return { x, y, width, height }
}

export { usesOverlayFullscreen, overlayFullscreenWindowOptions, overlayFullscreenBounds }
