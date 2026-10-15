import { isAllowedAudioFilename, resolveLocalAudio } from '../app/utils/audioResolver'
import { beforeEach, afterEach } from 'vitest'
import { expect } from 'chai'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

describe('audioResolver', function () {
  let testDir
  let audioPath

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'stretchly-audio-'))
    audioPath = join(testDir, 'audio')
    mkdirSync(audioPath)
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('detects added and removed overrides', () => {
    const filename = 'crystal-glass.wav'
    const filepath = join(audioPath, filename)

    expect(resolveLocalAudio(audioPath, filename)).to.equal(null)

    writeFileSync(filepath, 'custom sound')
    const url = new URL(resolveLocalAudio(audioPath, filename))
    expect(fileURLToPath(url)).to.equal(filepath)
    expect(readFileSync(url, 'utf8')).to.equal('custom sound')

    unlinkSync(filepath)
    expect(resolveLocalAudio(audioPath, filename)).to.equal(null)
  })

  it('resolves custom filenames with a case-insensitive WAV extension', () => {
    const filename = 'custom_sound-2.WAV'
    const filepath = join(audioPath, filename)
    writeFileSync(filepath, 'custom sound')

    const result = resolveLocalAudio(audioPath, filename)

    expect(fileURLToPath(result)).to.equal(filepath)
  })

  it('returns null when the audio folder does not exist', () => {
    expect(resolveLocalAudio(join(testDir, 'missing'), 'crystal-glass.wav')).to.equal(null)
  })

  it('rejects existing files with unsupported extensions', () => {
    for (const filename of ['sound.mp3', 'sound.png', 'sound.wav.bak']) {
      writeFileSync(join(audioPath, filename), 'unsupported file')

      expect(resolveLocalAudio(audioPath, filename), filename).to.equal(null)
    }
  })

  it('rejects paths to files outside the audio folder', () => {
    const filepath = join(testDir, 'outside.wav')
    writeFileSync(filepath, 'outside sound')

    for (const filename of ['../outside.wav', '..\\outside.wav', filepath]) {
      expect(isAllowedAudioFilename(filename), filename).to.equal(false)
      expect(resolveLocalAudio(audioPath, filename), filename).to.equal(null)
    }
  })

  it('returns a usable file URL when the audio folder path contains special characters', () => {
    const specialAudioPath = join(testDir, 'audio #1 %20 zvuky-č')
    const filename = 'crystal-glass.wav'
    const filepath = join(specialAudioPath, filename)
    mkdirSync(specialAudioPath)
    writeFileSync(filepath, 'custom sound')

    const url = new URL(resolveLocalAudio(specialAudioPath, filename))

    expect(url.protocol).to.equal('file:')
    expect(url.hash).to.equal('')
    expect(url.search).to.equal('')
    expect(fileURLToPath(url)).to.equal(filepath)
    expect(readFileSync(url, 'utf8')).to.equal('custom sound')
  })
})
