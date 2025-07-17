import { vi, describe, it, beforeEach, expect } from 'vitest'
import 'chai/register-should'
import { screen } from 'electron'
import DisplayManager from '../app/utils/displayManager.js'

vi.mock('electron', () => {
  const mockScreen = {
    getAllDisplays: vi.fn(() => [
      { id: 0, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
      { id: 1, bounds: { x: 1920, y: 0, width: 1440, height: 900 } }
    ]),
    getPrimaryDisplay: vi.fn(() => ({ id: 0, bounds: { x: 0, y: 0, width: 1920, height: 1080 } })),
    getDisplayNearestPoint: vi.fn(() => ({ id: 0, bounds: { x: 0, y: 0, width: 1920, height: 1080 } })),
    getCursorScreenPoint: vi.fn(() => ({ x: 960, y: 540 }))
  }
  return { screen: mockScreen }
})

describe('DisplayManager', function () {
  let displayManager
  let mockSettings
  let mockLog

  beforeEach(function () {
    vi.clearAllMocks()
    mockSettings = {
      get: vi.fn()
    }
    mockLog = {
      warn: vi.fn()
    }
  })

  describe('Mathematical Calculations', function () {
    beforeEach(function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return true
        return null
      })
      displayManager = new DisplayManager(mockSettings, mockLog)
    })

    it('centers window horizontally correctly', function () {
      const result = displayManager.getDisplayX(0, 800, false)
      result.should.equal(560)
    })

    it('centers window vertically correctly', function () {
      const result = displayManager.getDisplayY(0, 600, false)
      result.should.equal(240)
    })

    it('returns display origin for fullscreen X', function () {
      const result = displayManager.getDisplayX(1, 800, true)
      result.should.equal(1920)
    })

    it('returns display origin for fullscreen Y', function () {
      const result = displayManager.getDisplayY(1, 600, true)
      result.should.equal(0)
    })

    it('handles small windows correctly', function () {
      const result = displayManager.getDisplayX(0, 100, false)
      result.should.equal(910)
    })

    it('handles large windows correctly', function () {
      const result = displayManager.getDisplayX(0, 2000, false)
      result.should.equal(-40)
    })

    it('returns floored display width', function () {
      const result = displayManager.getDisplayWidth(0)
      result.should.equal(1920)
    })

    it('returns floored display height', function () {
      const result = displayManager.getDisplayHeight(0)
      result.should.equal(1080)
    })

    it('handles secondary display positioning', function () {
      const x = displayManager.getDisplayX(1, 800, false)
      const y = displayManager.getDisplayY(1, 600, false)
      x.should.equal(2240)
      y.should.equal(150)
    })
  })

  describe('Method Integration', function () {
    beforeEach(function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return true
        return null
      })
      displayManager = new DisplayManager(mockSettings, mockLog)
    })

    it('getWindowPosition returns consistent windowed positioning', function () {
      const position = displayManager.getWindowPosition(0, { width: 800, height: 600, fullscreen: false })
      position.should.have.property('x', 560)
      position.should.have.property('y', 240)
      position.should.have.property('width', 800)
      position.should.have.property('height', 600)
    })

    it('getWindowPosition returns consistent fullscreen positioning', function () {
      const position = displayManager.getWindowPosition(0, { width: 800, height: 600, fullscreen: true })

      position.should.have.property('x', 0)
      position.should.have.property('y', 0)
      position.should.have.property('width', 1920)
      position.should.have.property('height', 1080)
    })

    it('uses default parameters correctly', function () {
      const position = displayManager.getWindowPosition()

      position.should.have.property('x', 560)
      position.should.have.property('y', 240)
      position.should.have.property('width', 800)
      position.should.have.property('height', 600)
    })

    it('individual methods match getWindowPosition results', function () {
      const width = 1000
      const height = 700
      const displayID = 0

      const position = displayManager.getWindowPosition(displayID, { width, height, fullscreen: false })
      const x = displayManager.getDisplayX(displayID, width, false)
      const y = displayManager.getDisplayY(displayID, height, false)

      position.x.should.equal(x)
      position.y.should.equal(y)
      position.width.should.equal(width)
      position.height.should.equal(height)
    })

    it('all methods return valid numbers', function () {
      const x = displayManager.getDisplayX()
      const y = displayManager.getDisplayY()
      const width = displayManager.getDisplayWidth()
      const height = displayManager.getDisplayHeight()
      const position = displayManager.getWindowPosition()

      x.should.be.a('number')
      y.should.be.a('number')
      width.should.be.a('number')
      height.should.be.a('number')
      position.x.should.be.a('number')
      position.y.should.be.a('number')
      position.width.should.be.a('number')
      position.height.should.be.a('number')

      Number.isNaN(x).should.equal(false)
      Number.isNaN(y).should.equal(false)
      Number.isNaN(width).should.equal(false)
      Number.isNaN(height).should.equal(false)
    })
  })

  describe('Settings Integration', function () {
    beforeEach(function () {
      displayManager = new DisplayManager(mockSettings, mockLog)
    })

    it('uses cursor position when allScreens is true', function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return true
        return null
      })
      displayManager.getTargetDisplay()
      expect(screen.getDisplayNearestPoint).toHaveBeenCalled()
    })

    it('uses primary display when screen preference is "primary"', function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return false
        if (key === 'screen') return 'primary'
        return null
      })
      displayManager.getTargetDisplay()
      expect(screen.getPrimaryDisplay).toHaveBeenCalled()
    })

    it('uses cursor display when screen preference is "cursor"', function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return false
        if (key === 'screen') return 'cursor'
        return null
      })
      displayManager.getTargetDisplay()
      expect(screen.getDisplayNearestPoint).toHaveBeenCalled()
    })

    it('uses correct display with numeric screen setting', function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return false
        if (key === 'screen') return '1'
        return null
      })
      const target = displayManager.getTargetDisplay()
      expect(screen.getAllDisplays).toHaveBeenCalled()
      target.id.should.equal(1)
    })
  })

  describe('Error Handling', function () {
    beforeEach(function () {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'allScreens') return true
        return null
      })
      displayManager = new DisplayManager(mockSettings, mockLog)
    })

    it('handles invalid displayID by falling back and logging a warning', () => {
      const target = displayManager.getTargetDisplay(5)
      expect(mockLog.warn).toHaveBeenCalledWith('Stretchly: invalid displayID 5, falling back to cursor display')
      expect(screen.getDisplayNearestPoint).toHaveBeenCalled()
      target.id.should.equal(0)
    })

    it('handles boundary displayID values', function () {
      const target1 = displayManager.getTargetDisplay(0)
      const target2 = displayManager.getTargetDisplay(1)
      target1.id.should.equal(0)
      target2.id.should.equal(1)
    })

    it('handles extreme window sizes', function () {
      const verySmall = displayManager.getDisplayX(0, 1, false)
      const veryLarge = displayManager.getDisplayX(0, 5000, false)

      verySmall.should.be.a('number')
      veryLarge.should.be.a('number')
      Number.isNaN(verySmall).should.equal(false)
      Number.isNaN(veryLarge).should.equal(false)
    })

    it('handles zero dimensions gracefully', function () {
      const zeroWidth = displayManager.getDisplayX(0, 0, false)
      const zeroHeight = displayManager.getDisplayY(0, 0, false)

      zeroWidth.should.equal(960)
      zeroHeight.should.equal(540)
    })
  })
})
