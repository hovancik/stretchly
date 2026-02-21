import { join } from 'path'
import { existsSync } from 'node:fs'

const imageFilenameRegex = /^[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif)$/i

const isAllowedImageFilename = name => imageFilenameRegex.test(name)

const resolveLocalImage = (imagesPath, filename) => {
  if (!isAllowedImageFilename(filename)) return null
  const p = join(imagesPath, filename)
  if (existsSync(p)) return 'file://' + p
  return null
}

export { isAllowedImageFilename, resolveLocalImage }
