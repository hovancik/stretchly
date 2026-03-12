import { vi } from 'vitest'
import 'chai/register-should'
import { join } from 'path'
import CallAndScreenShareManager from '../app/utils/callAndScreenShareManager'
import Store from 'electron-store'
import defaultSettings from '../app/utils/defaultSettings'
import { unlink } from 'node:fs'

const timeout = process.env.CI ? 30000 : 10000

describe('callAndScreenShareManager', function () {
  vi.setConfig({ testTimeout: timeout })
  let settings = null
  let manager = null

  beforeEach(() => {
    settings = new Store({
      cwd: join(__dirname),
      name: 'test-settings-callAndScreenShareManager',
      defaults: defaultSettings
    })
    manager = new CallAndScreenShareManager(settings)
  })

  it('should have default state', () => new Promise((resolve) => {
    manager.isInCallOrSharing.should.be.equal(false)
    if (process.platform === 'darwin') {
      manager.monitorCallsAndSharing.should.be.equal(true)
    }
    resolve()
  }))

  it('should not be running with monitorCallsAndSharing: false', () => new Promise((resolve) => {
    settings.set('monitorCallsAndSharing', false)
    manager.stop()
    manager = null
    manager = new CallAndScreenShareManager(settings)
    manager.isInCallOrSharing.should.be.equal(false)
    manager.monitorCallsAndSharing.should.be.equal(false)
    resolve()
  }))

  it('should report isSchedulerCleared correctly', () => new Promise((resolve) => {
    manager.isSchedulerCleared.should.be.equal(false)
    resolve()
  }))

  it('should start when start()', () => new Promise((resolve) => {
    manager.stop()
    manager.start()
    if (process.platform === 'darwin') {
      manager.monitorCallsAndSharing.should.be.equal(true)
    }
    manager.isInCallOrSharing.should.be.equal(false)
    resolve()
  }))

  it('should stop when stop()', () => new Promise((resolve) => {
    manager.stop()
    manager.monitorCallsAndSharing.should.be.equal(false)
    manager.isInCallOrSharing.should.be.equal(false)
    resolve()
  }))

  describe('_detectTeamsActivity with mocked exec', () => {
    it('should return false when Teams is not running', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: '' })
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(false)
    })

    it('should return true when Teams is running and camera is active', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: 'MSTeams' })
        .mockResolvedValueOnce({ stdout: '1234\n' })
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(true)
    })

    it('should return true when Teams is running and microphone is active', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: 'MSTeams' })
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: '1\n' })
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(true)
    })

    it('should return false when Teams is running but no mic or camera active', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: 'Microsoft Teams' })
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: '0\n' })
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(false)
    })

    it('should return false when monitoring is disabled', async () => {
      manager.monitorCallsAndSharing = false
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(false)
    })

    it('should return false when exec throws an error', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockRejectedValue(new Error('osascript failed'))
      const result = await manager._detectTeamsActivity()
      result.should.be.equal(false)
    })

    it('should check for Teams process not window titles', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: '' })
      await manager._detectTeamsActivity()
      const command = manager.__asyncExec.mock.calls[0][0]
      command.should.include('name of every process')
      command.should.not.include('name of every window')
    })
  })

  describe('_isMicOrCameraActive with mocked exec', () => {
    it('should return true when camera process is found', async () => {
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: '1234\n' })
      const result = await manager._isMicOrCameraActive()
      result.should.be.equal(true)
    })

    it('should return true when microphone input is active', async () => {
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: '1\n' })
      const result = await manager._isMicOrCameraActive()
      result.should.be.equal(true)
    })

    it('should return false when neither camera nor mic is active', async () => {
      manager.__asyncExec = vi.fn()
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: '0\n' })
      const result = await manager._isMicOrCameraActive()
      result.should.be.equal(false)
    })

    it('should return false on error', async () => {
      manager.__asyncExec = vi.fn().mockRejectedValue(new Error('check failed'))
      const result = await manager._isMicOrCameraActive()
      result.should.be.equal(false)
    })
  })

  describe('_detectScreenSharing with mocked exec', () => {
    it('should return true when screencaptureui is running', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: 'screencaptureui' })
      const result = await manager._detectScreenSharing()
      result.should.be.equal(true)
    })

    it('should return true when Screen Sharing is running', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: 'Screen Sharing' })
      const result = await manager._detectScreenSharing()
      result.should.be.equal(true)
    })

    it('should return false when no screen sharing processes found', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: '' })
      const result = await manager._detectScreenSharing()
      result.should.be.equal(false)
    })

    it('should not query Teams windows for sharing detection', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockResolvedValue({ stdout: '' })
      await manager._detectScreenSharing()
      manager.__asyncExec.mock.calls.length.should.be.equal(1)
      const command = manager.__asyncExec.mock.calls[0][0]
      command.should.not.include('Teams')
    })

    it('should return false when monitoring is disabled', async () => {
      manager.monitorCallsAndSharing = false
      const result = await manager._detectScreenSharing()
      result.should.be.equal(false)
    })

    it('should return false when exec throws an error', async () => {
      manager.monitorCallsAndSharing = true
      manager.__asyncExec = vi.fn().mockRejectedValue(new Error('osascript failed'))
      const result = await manager._detectScreenSharing()
      result.should.be.equal(false)
    })
  })

  afterEach(() => {
    if (manager) {
      manager.stop()
      manager = null
    }

    if (settings) {
      unlink(join(__dirname, '/test-settings-callAndScreenShareManager.json'), (_) => {})
      settings = null
    }
  })
})
