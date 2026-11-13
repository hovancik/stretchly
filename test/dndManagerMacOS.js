import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import log from 'electron-log/main.js'
import DndManager from '../app/utils/dndManager.js'

vi.mock('node:fs/promises', () => ({ readFile: vi.fn() }))
vi.mock('electron-log/main.js', () => ({ default: { info: vi.fn(), error: vi.fn() } }))
vi.mock('windows-focus-assist', () => ({ getFocusAssist: vi.fn() }))
vi.mock('@particle/dbus-next', () => ({ default: {} }))

const dndOn = JSON.stringify({
  data: [{
    storeAssertionRecords: [{
      assertionDetails: { assertionDetailsModeIdentifier: 'com.apple.donotdisturb.mode.default' }
    }]
  }]
})
const dndOff = JSON.stringify({ data: [{ storeAssertionRecords: [] }] })

describe('macOS Do Not Disturb detection', () => {
  let manager
  let platformDescriptor
  let versionDescriptor
  let exec

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.mocked(readFile).mockReset()
    platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')
    versionDescriptor = Object.getOwnPropertyDescriptor(process, 'getSystemVersion')
    Object.defineProperty(process, 'platform', { configurable: true, value: 'darwin' })
    Object.defineProperty(process, 'getSystemVersion', { configurable: true, value: vi.fn(() => '27.2') })
    const settings = { monitorDnd: true, monitorDndCheckInterval: 2000 }
    manager = new DndManager({ get: key => settings[key] })
    exec = vi.fn().mockResolvedValue({ stdout: '1\n' })
    vi.spyOn(manager, '_getOrCreateAsyncExec').mockReturnValue(exec)
  })

  afterEach(() => {
    manager.stop()
    vi.restoreAllMocks()
    vi.useRealTimers()
    Object.defineProperty(process, 'platform', platformDescriptor)
    if (versionDescriptor) {
      Object.defineProperty(process, 'getSystemVersion', versionDescriptor)
    } else {
      delete process.getSystemVersion
    }
  })

  it('detects DND on macOS 27 without querying the removed preference key', async () => {
    vi.mocked(readFile).mockResolvedValue(dndOn)

    expect(await manager._doNotDisturb()).toBe(true)
    expect(readFile).toHaveBeenCalledWith(join(homedir(), 'Library', 'DoNotDisturb', 'DB', 'Assertions.json'), 'utf8')
    expect(exec).not.toHaveBeenCalled()
  })

  it('detects other Focus modes and checks all assertion stores', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({
      data: [{}, {
        storeAssertionRecords: [{
          assertionDetails: { assertionDetailsModeIdentifier: 'com.apple.focus.work' }
        }]
      }]
    }))

    expect(await manager._doNotDisturb()).toBe(true)
  })

  it.each([
    { data: [] },
    { data: [{}] },
    { data: [{ storeAssertionRecords: null }] },
    { data: [{ storeAssertionRecords: [] }] },
    { data: [{ storeAssertionRecords: [{ assertionDetails: {} }] }] }
  ])('detects no active Focus in %j', async contents => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(contents))

    expect(await manager._doNotDisturb()).toBe(false)
    expect(log.error).not.toHaveBeenCalled()
  })

  it('emits start and finish events as DND changes, without repeating unchanged states', async () => {
    const started = vi.fn()
    const finished = vi.fn()
    manager.on('dndStarted', started)
    manager.on('dndFinished', finished)
    vi.mocked(readFile).mockResolvedValue(dndOn)

    await vi.advanceTimersByTimeAsync(4000)
    expect(manager.isOnDnd).toBe(true)
    expect(started).toHaveBeenCalledTimes(1)
    expect(finished).not.toHaveBeenCalled()

    vi.mocked(readFile).mockResolvedValue(dndOff)
    await vi.advanceTimersByTimeAsync(4000)
    expect(manager.isOnDnd).toBe(false)
    expect(finished).toHaveBeenCalledTimes(1)
  })

  it.each(['EACCES', 'EPERM'])('logs actionable guidance once for %s and retries', async code => {
    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('Permission denied'), { code }))

    await vi.advanceTimersByTimeAsync(4000)
    expect(manager.isOnDnd).toBe(false)
    expect(log.error).toHaveBeenCalledTimes(1)
    expect(log.error.mock.calls[0][0]).toContain('Full Disk Access')

    vi.mocked(readFile).mockResolvedValue(dndOn)
    await vi.advanceTimersByTimeAsync(2000)
    expect(manager.isOnDnd).toBe(true)
  })

  it('does not resume breaks when the assertion file temporarily disappears', async () => {
    const finished = vi.fn()
    manager.on('dndFinished', finished)
    vi.mocked(readFile).mockResolvedValue(dndOn)
    await vi.advanceTimersByTimeAsync(2000)

    vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('File not found'), { code: 'ENOENT' }))
    await vi.advanceTimersByTimeAsync(4000)
    expect(manager.isOnDnd).toBe(true)
    expect(finished).not.toHaveBeenCalled()
    expect(log.error).toHaveBeenCalledTimes(1)

    vi.mocked(readFile).mockResolvedValue(dndOff)
    await vi.advanceTimersByTimeAsync(2000)
    expect(finished).toHaveBeenCalledTimes(1)
  })

  it.each(['{', '{}', '{"data":{}}'])('preserves an active DND state for invalid data: %s', async contents => {
    manager.isOnDnd = true
    vi.mocked(readFile).mockResolvedValue(contents)

    expect(await manager._doNotDisturb()).toBe(true)
    expect(log.error).toHaveBeenCalledTimes(1)
  })

  it('does not read Focus state when monitoring is disabled', async () => {
    manager.stop()

    expect(await manager._doNotDisturb()).toBe(false)
    await vi.advanceTimersByTimeAsync(4000)
    expect(readFile).not.toHaveBeenCalled()
    expect(exec).not.toHaveBeenCalled()
  })

  it.each([
    ['26.5', 'NSStatusItem VisibleCC FocusModes'],
    ['15.7', 'NSStatusItem Visible FocusModes']
  ])('retains the existing detector on macOS %s', async (version, key) => {
    vi.mocked(process.getSystemVersion).mockReturnValue(version)

    expect(await manager._doNotDisturb()).toBe(true)
    expect(exec).toHaveBeenCalledWith(`defaults read com.apple.controlcenter "${key}"`)
    expect(readFile).not.toHaveBeenCalled()
  })
})
