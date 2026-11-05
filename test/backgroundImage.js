import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import BackgroundImages from '../app/utils/backgroundImage.js'

describe('BackgroundImages', () => {
  let directory
  let backgrounds

  beforeEach(() => {
    directory = fs.mkdtempSync(join(tmpdir(), 'stretchly-backgrounds-'))
    backgrounds = new BackgroundImages()
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

  function nextFilename () {
    const result = backgrounds.nextImage(true, directory)
    expect(result).toBeTypeOf('string')
    return basename(fileURLToPath(result))
  }

  it('does not read the directory while disabled', () => {
    addImages('photo.png')
    const scan = vi.spyOn(fs, 'readdirSync')

    expect(backgrounds.nextImage(false, directory)).toBeNull()
    expect(scan).not.toHaveBeenCalled()
  })

  it('returns no image for invalid settings or a relative path', () => {
    for (const folder of [undefined, null, '', 42, {}, 'pictures', 'https://example.com/photos']) {
      expect(backgrounds.nextImage(true, folder)).toBeNull()
    }
    expect(backgrounds.nextImage('true', directory)).toBeNull()
  })

  it('returns no image for an empty or missing directory', () => {
    expect(backgrounds.nextImage(true, directory)).toBeNull()
    expect(backgrounds.nextImage(true, join(directory, 'missing'))).toBeNull()
  })

  it('returns no image when the configured path is a file', () => {
    addImages('photo.png')

    expect(backgrounds.nextImage(true, join(directory, 'photo.png'))).toBeNull()
  })

  it('recovers after a directory cannot be read', () => {
    addImages('photo.png')
    vi.spyOn(fs, 'readdirSync').mockImplementationOnce(() => {
      throw Object.assign(new Error('Permission denied'), { code: 'EACCES' })
    })

    expect(backgrounds.nextImage(true, directory)).toBeNull()
    expect(nextFilename()).toBe('photo.png')
  })

  it('selects only supported regular image files without searching subdirectories', () => {
    addImages('a.PNG', 'b.jpg', 'c.JPEG', 'd.webp', 'notes.txt', 'vector.svg', 'animated.gif')
    fs.mkdirSync(join(directory, 'fake.png'))
    fs.writeFileSync(join(directory, 'fake.png', 'nested.jpg'), 'nested image')

    const selected = Array.from({ length: 4 }, nextFilename).sort()

    expect(selected).toEqual(['a.PNG', 'b.jpg', 'c.JPEG', 'd.webp'])
  })

  it('uses every image once in each round across successive breaks', () => {
    addImages('one.png', 'two.png', 'three.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)

    for (let round = 0; round < 2; round++) {
      expect(Array.from({ length: 3 }, nextFilename).sort()).toEqual(['one.png', 'three.png', 'two.png'])
    }
  })

  it('does not consume an image while disabled between breaks', () => {
    addImages('one.png', 'two.png')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const first = nextFilename()

    expect(backgrounds.nextImage(false, directory)).toBeNull()
    expect(nextFilename()).not.toBe(first)
  })

  it('switches to the newly configured directory', () => {
    addImages('old.png')
    expect(nextFilename()).toBe('old.png')
    const otherDirectory = join(directory, 'other')
    fs.mkdirSync(otherDirectory)
    fs.writeFileSync(join(otherDirectory, 'new.png'), 'new image')

    const result = backgrounds.nextImage(true, otherDirectory)

    expect(result).toBeTypeOf('string')
    expect(fileURLToPath(result)).toBe(join(otherDirectory, 'new.png'))
  })

  it('refreshes the selection when images are added or removed', () => {
    addImages('first.png')
    expect(nextFilename()).toBe('first.png')
    addImages('second.png')

    expect(Array.from({ length: 2 }, nextFilename).sort()).toEqual(['first.png', 'second.png'])

    fs.unlinkSync(join(directory, 'first.png'))
    expect(nextFilename()).toBe('second.png')
    fs.unlinkSync(join(directory, 'second.png'))
    expect(backgrounds.nextImage(true, directory)).toBeNull()
    addImages('third.png')
    expect(nextFilename()).toBe('third.png')
  })

  it('preserves special characters in local file URLs', () => {
    const filename = "John's 中文 forest #50%.png"
    addImages(filename)

    const result = backgrounds.nextImage(true, directory)
    expect(result).toBeTypeOf('string')
    const url = new URL(result)

    expect(url.protocol).toBe('file:')
    expect(url.hash).toBe('')
    expect(url.search).toBe('')
    expect(fileURLToPath(url)).toBe(join(directory, filename))
    expect(fs.readFileSync(url, 'utf8')).toBe('image candidate')
  })
})
