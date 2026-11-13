import 'chai/register-should'
import { describe, expect, it } from 'vitest'
import { usesOverlayFullscreen, overlayFullscreenWindowOptions, overlayFullscreenBounds } from '../app/utils/kioskMode.js'

const kioskOff = {
  platform: 'darwin',
  fullscreen: true,
  useKioskMode: false,
  showBreaksAsRegularWindows: false
}

describe('kioskMode', () => {
  it('replaces kiosk mode on macOS full screen breaks when it is turned off', () => {
    expect(usesOverlayFullscreen(kioskOff)).toBe(true)
  })

  it('keeps kiosk mode by default', () => {
    expect(usesOverlayFullscreen({ ...kioskOff, useKioskMode: true })).toBe(false)
    expect(usesOverlayFullscreen({ ...kioskOff, useKioskMode: undefined })).toBe(false)
  })

  it('does not change breaks in a window', () => {
    expect(usesOverlayFullscreen({ ...kioskOff, fullscreen: false })).toBe(false)
  })

  it('does not change breaks shown as regular windows', () => {
    expect(usesOverlayFullscreen({ ...kioskOff, showBreaksAsRegularWindows: true })).toBe(false)
  })

  it('does not change other platforms', () => {
    expect(usesOverlayFullscreen({ ...kioskOff, platform: 'win32' })).toBe(false)
    expect(usesOverlayFullscreen({ ...kioskOff, platform: 'linux' })).toBe(false)
  })

  it('covers the whole display, including the menu bar and Dock areas', () => {
    const options = overlayFullscreenWindowOptions({ x: -1440, y: 0, width: 1440, height: 900 })
    expect(options).toMatchObject({ x: -1440, y: 0, width: 1440, height: 900, enableLargerThanScreen: true })
  })

  it('has no title bar and no rounded corners, so macOS does not keep it below the menu bar', () => {
    const options = overlayFullscreenWindowOptions({ x: 0, y: 0, width: 1, height: 1 })
    expect(options).toMatchObject({ titleBarStyle: 'default', titleBarOverlay: false, roundedCorners: false })
  })

  it('keeps only the bounds from the window options', () => {
    const options = overlayFullscreenWindowOptions({ x: 0, y: 0, width: 1440, height: 900 })
    expect(overlayFullscreenBounds(options)).toEqual({ x: 0, y: 0, width: 1440, height: 900 })
  })
})
