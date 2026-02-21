import { isAllowedImageFilename, resolveLocalImage } from '../app/utils/imageResolver'
import { beforeEach, afterEach } from 'vitest'
import { should as chaiShould } from 'chai'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'node:fs'

const should = chaiShould()

describe('imageResolver', function () {
  const testDir = join(__dirname, 'test-images')

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('isAllowedImageFilename', () => {
    it('allows valid PNG filenames', () => {
      isAllowedImageFilename('image.png').should.equal(true)
      isAllowedImageFilename('my-image.png').should.equal(true)
      isAllowedImageFilename('my_image.png').should.equal(true)
      isAllowedImageFilename('image123.png').should.equal(true)
    })

    it('allows valid JPEG filenames', () => {
      isAllowedImageFilename('photo.jpg').should.equal(true)
      isAllowedImageFilename('photo.jpeg').should.equal(true)
      isAllowedImageFilename('PHOTO.JPG').should.equal(true)
    })

    it('allows valid WebP filenames', () => {
      isAllowedImageFilename('image.webp').should.equal(true)
      isAllowedImageFilename('IMAGE.WEBP').should.equal(true)
    })

    it('allows valid GIF filenames', () => {
      isAllowedImageFilename('animation.gif').should.equal(true)
      isAllowedImageFilename('ANIMATION.GIF').should.equal(true)
    })

    it('rejects invalid extensions', () => {
      isAllowedImageFilename('image.svg').should.equal(false)
      isAllowedImageFilename('image.bmp').should.equal(false)
      isAllowedImageFilename('image.txt').should.equal(false)
      isAllowedImageFilename('script.js').should.equal(false)
    })

    it('rejects filenames with paths', () => {
      isAllowedImageFilename('../image.png').should.equal(false)
      isAllowedImageFilename('./image.png').should.equal(false)
      isAllowedImageFilename('/image.png').should.equal(false)
      isAllowedImageFilename('folder/image.png').should.equal(false)
    })

    it('rejects filenames with special characters', () => {
      isAllowedImageFilename('image$.png').should.equal(false)
      isAllowedImageFilename('image@.png').should.equal(false)
      isAllowedImageFilename('image!.png').should.equal(false)
      isAllowedImageFilename('image .png').should.equal(false)
    })

    it('rejects filenames without extension', () => {
      isAllowedImageFilename('image').should.equal(false)
      isAllowedImageFilename('').should.equal(false)
    })

    it('rejects URLs', () => {
      isAllowedImageFilename('http://example.com/image.png').should.equal(false)
      isAllowedImageFilename('https://example.com/image.png').should.equal(false)
      isAllowedImageFilename('file:///image.png').should.equal(false)
    })
  })

  describe('resolveLocalImage', () => {
    it('returns file URL for existing image', () => {
      const filename = 'test-image.png'
      const filepath = join(testDir, filename)
      writeFileSync(filepath, 'test')

      const result = resolveLocalImage(testDir, filename)
      result.should.equal('file://' + filepath)
    })

    it('returns null for non-existent image', () => {
      const result = resolveLocalImage(testDir, 'nonexistent.png')
      should.not.exist(result)
    })

    it('returns null for invalid filename', () => {
      const result = resolveLocalImage(testDir, '../image.png')
      should.not.exist(result)
    })

    it('returns null for invalid extension', () => {
      const filename = 'test.svg'
      const filepath = join(testDir, filename)
      writeFileSync(filepath, 'test')

      const result = resolveLocalImage(testDir, filename)
      should.not.exist(result)
    })

    it('handles different valid image formats', () => {
      const formats = ['test.png', 'test.jpg', 'test.jpeg', 'test.webp', 'test.gif']

      formats.forEach(filename => {
        const filepath = join(testDir, filename)
        writeFileSync(filepath, 'test')

        const result = resolveLocalImage(testDir, filename)
        result.should.equal('file://' + filepath)

        unlinkSync(filepath)
      })
    })

    it('returns null for path traversal attempts', () => {
      const result = resolveLocalImage(testDir, '../../../etc/passwd.png')
      should.not.exist(result)
    })

    it('returns null for Windows-style path traversal attempts', () => {
      const result = resolveLocalImage(testDir, '..\\..\\..\\secret.png')
      should.not.exist(result)
    })

    it('is case insensitive for extensions', () => {
      const filename = 'test-image.PNG'
      const filepath = join(testDir, filename)
      writeFileSync(filepath, 'test')

      const result = resolveLocalImage(testDir, filename)
      result.should.equal('file://' + filepath)
    })
  })
})
