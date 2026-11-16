import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import log from 'electron-log/main.js'
import BackgroundImages from '../app/utils/backgroundImage.js'

vi.mock('electron-log/main.js', () => ({ default: { error: vi.fn() } }))

describe('BackgroundImages', () => {
  let directory

  beforeEach(() => {
    directory = fs.mkdtempSync(join(tmpdir(), 'stretchly-backgrounds-'))
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(directory, { recursive: true, force: true })
  })

  function addImages (...names) {
    for (const name of names) {
      fs.writeFileSync(join(directory, name), 'image candidate')
    }
  }

  function nextFilename (backgrounds) {
    const result = backgrounds.nextImage()
    expect(result).toBeTypeOf('string')
    return basename(fileURLToPath(result))
  }

  it('does not read the directory or log an error while disabled', () => {
    addImages('photo.png')
    const scan = vi.spyOn(fs, 'readdirSync')
    const backgrounds = new BackgroundImages(false, directory)

    expect(backgrounds.nextImage()).toBeNull()
    expect(scan).not.toHaveBeenCalled()
    expect(log.error).not.toHaveBeenCalled()
  })

  it('logs invalid folders and returns no image', () => {
    for (const folder of [undefined, null, '', 42, {}, 'pictures', 'https://example.com/photos']) {
      vi.mocked(log.error).mockClear()
      const backgrounds = new BackgroundImages(true, folder)

      expect(backgrounds.nextImage()).toBeNull()
      expect(log.error).toHaveBeenCalledOnce()
    }
  })

  it('logs an empty or missing directory and returns no image', () => {
    for (const folder of [directory, join(directory, 'missing')]) {
      vi.mocked(log.error).mockClear()
      const backgrounds = new BackgroundImages(true, folder)

      expect(backgrounds.nextImage()).toBeNull()
      expect(log.error).toHaveBeenCalledOnce()
    }
  })

  it('logs an unreadable directory and returns no image', () => {
    const error = Object.assign(new Error('Permission denied'), { code: 'EACCES' })
    vi.spyOn(fs, 'readdirSync').mockImplementationOnce(() => { throw error })

    expect(new BackgroundImages(true, directory).nextImage()).toBeNull()
    expect(log.error).toHaveBeenCalledWith(expect.any(String), directory, error)
  })

  it('selects supported regular files without searching subdirectories', () => {
    addImages('a.PNG', 'b.jpg', 'c.JPEG', 'd.webp', 'notes.txt', 'vector.svg', 'animated.gif')
    fs.mkdirSync(join(directory, 'fake.png'))
    fs.writeFileSync(join(directory, 'fake.png', 'nested.jpg'), 'nested image')
    const backgrounds = new BackgroundImages(true, directory)

    expect(Array.from({ length: 4 }, () => nextFilename(backgrounds)).sort())
      .toEqual(['a.PNG', 'b.jpg', 'c.JPEG', 'd.webp'])
  })

  it('takes a directory snapshot that changes only when initialized again', () => {
    addImages('first.png')
    const scan = vi.spyOn(fs, 'readdirSync')
    const backgrounds = new BackgroundImages(true, directory)
    addImages('second.png')

    expect(nextFilename(backgrounds)).toBe('first.png')
    expect(nextFilename(backgrounds)).toBe('first.png')
    expect(scan).toHaveBeenCalledOnce()

    const reloaded = new BackgroundImages(true, directory)
    expect(Array.from({ length: 2 }, () => nextFilename(reloaded)).sort())
      .toEqual(['first.png', 'second.png'])
  })

  it('uses every image once per shuffled round across successive breaks', () => {
    addImages('one.png', 'two.png', 'three.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const backgrounds = new BackgroundImages(true, directory)

    for (let round = 0; round < 2; round++) {
      expect(Array.from({ length: 3 }, () => nextFilename(backgrounds)).sort())
        .toEqual(['one.png', 'three.png', 'two.png'])
    }
  })

  it('skips a deleted image and tries a different candidate across round boundaries', () => {
    addImages('a.png', 'z.png')
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99)
      .mockReturnValue(0)
    const backgrounds = new BackgroundImages(true, directory)
    expect(nextFilename(backgrounds)).toBe('a.png')
    fs.unlinkSync(join(directory, 'z.png'))

    expect(nextFilename(backgrounds)).toBe('a.png')
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('skips an image that became a directory', () => {
    addImages('a.png', 'b.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const backgrounds = new BackgroundImages(true, directory)
    fs.unlinkSync(join(directory, 'a.png'))
    fs.mkdirSync(join(directory, 'a.png'))

    expect(nextFilename(backgrounds)).toBe('b.png')
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('logs an unreadable image and tries a different candidate', () => {
    addImages('a.png', 'b.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const backgrounds = new BackgroundImages(true, directory)
    const error = Object.assign(new Error('Permission denied'), { code: 'EACCES' })
    vi.spyOn(fs, 'accessSync').mockImplementationOnce(() => { throw error })

    expect(nextFilename(backgrounds)).toBe('b.png')
    expect(log.error).toHaveBeenCalledWith(expect.any(String), join(directory, 'a.png'), error)
  })

  it('stops after one alternative even when a later candidate is usable', () => {
    addImages('a.png', 'b.png', 'c.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const backgrounds = new BackgroundImages(true, directory)
    fs.unlinkSync(join(directory, 'a.png'))
    fs.unlinkSync(join(directory, 'b.png'))

    expect(backgrounds.nextImage()).toBeNull()
    expect(log.error).toHaveBeenCalledTimes(2)
    expect(nextFilename(backgrounds)).toBe('c.png')
  })

  it('terminates when its only cached image has disappeared', () => {
    addImages('photo.png')
    const backgrounds = new BackgroundImages(true, directory)
    fs.unlinkSync(join(directory, 'photo.png'))

    expect(backgrounds.nextImage()).toBeNull()
    expect(log.error).toHaveBeenCalledOnce()
  })

  it('preserves special characters in local file URLs', () => {
    const filename = "John's 中文 forest #50%.png"
    addImages(filename)
    const backgrounds = new BackgroundImages(true, directory)

    const result = backgrounds.nextImage()
    expect(result).toBeTypeOf('string')
    const url = new URL(result)

    expect(url.protocol).toBe('file:')
    expect(url.hash).toBe('')
    expect(url.search).toBe('')
    expect(fileURLToPath(url)).toBe(join(directory, filename))
    expect(fs.readFileSync(url, 'utf8')).toBe('image candidate')
  })
})
