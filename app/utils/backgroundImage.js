import fs from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import log from 'electron-log/main.js'
import Shuffled from './shuffled.js'

function findImages (enabled, folder) {
  if (enabled !== true) return []

  if (typeof folder !== 'string' || !isAbsolute(folder)) {
    log.error('Stretchly: invalid background image folder', folder)
    return []
  }

  try {
    const files = fs.readdirSync(folder, { withFileTypes: true })
      .filter(entry => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
      .map(entry => join(folder, entry.name))
      .sort()
    if (files.length === 0) {
      log.error('Stretchly: no background images found in folder', folder)
    }
    return files
  } catch (error) {
    log.error('Stretchly: could not read background image folder', folder, error)
    return []
  }
}

class BackgroundImages {
  constructor (enabled, folder) {
    this.images = new Shuffled(findImages(enabled, folder))
  }

  nextImage () {
    const attempted = new Set()
    const maximumAttempts = Math.min(2, this.images.array.length)
    while (attempted.size < maximumAttempts) {
      const image = this.images.randomElement
      if (attempted.has(image)) continue
      attempted.add(image)
      try {
        if (!fs.statSync(image).isFile()) throw new Error('Not a regular file')
        fs.accessSync(image, fs.constants.R_OK)
        return pathToFileURL(image).href
      } catch (error) {
        log.error('Stretchly: could not use background image', image, error)
      }
    }
    return null
  }
}

export default BackgroundImages
