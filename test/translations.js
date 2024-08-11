import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { expect } from 'vitest'

const jsonDirectory = join(__dirname, '../app/locales')

function getJsonFiles (dir) {
  return readdirSync(dir).filter(file => file.endsWith('.json'))
}

describe('Translations files', () => {
  const jsonFiles = getJsonFiles(jsonDirectory)

  jsonFiles.forEach(file => {
    it(`${file} is valid`, () => {
      const filePath = join(jsonDirectory, file)
      const data = readFileSync(filePath, 'utf8')

      expect(() => {
        JSON.parse(data)
      }).not.toThrow()
    })
  })
})
