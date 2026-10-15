import { join } from 'path'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const audioFilenameRegex = /^[A-Za-z0-9._-]+\.wav$/i

const isAllowedAudioFilename = name => audioFilenameRegex.test(name)

const resolveLocalAudio = (audioPath, filename) => {
  if (!isAllowedAudioFilename(filename)) return null
  const p = join(audioPath, filename)
  if (existsSync(p)) return pathToFileURL(p).href
  return null
}

export { isAllowedAudioFilename, resolveLocalAudio }
