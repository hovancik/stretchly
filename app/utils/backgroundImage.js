import fs from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import Shuffled from './shuffled.js'

class BackgroundImages {
  constructor () {
    this.files = []
    this.images = new Shuffled([])
  }

  nextImage (enabled, folder) {
    if (enabled !== true || typeof folder !== 'string' || !isAbsolute(folder)) {
      return null
    }

    let files
    try {
      files = fs.readdirSync(folder, { withFileTypes: true })
        .filter(entry => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
        .map(entry => join(folder, entry.name))
        .sort()
    } catch {
      return null
    }

    if (files.length !== this.files.length || files.some((file, index) => file !== this.files[index])) {
      this.files = files
      this.images = new Shuffled(files)
    }

    const image = this.images.randomElement
    return image ? pathToFileURL(image).href : null
  }
}

export default BackgroundImages
