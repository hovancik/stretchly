import { vi } from 'vitest'
import { expect } from 'chai'
import VersionChecker from '../app/utils/versionChecker'

describe('VersionChecker', () => {
  describe('latest', () => {
    it('fetches tag name', async () => {
      const tagName = 'tag name'
      const body = 'body'
      JSON.parse = vi.fn().mockReturnValue({ tag_name: tagName })
      const response = {
        text: vi.fn().mockReturnValue(Promise.resolve(body))
      }
      globalThis.fetch = vi.fn().mockReturnValue(Promise.resolve(response))

      const checker = new VersionChecker()
      const result = await checker.latest()

      expect(result).to.equal(tagName)
      expect(fetch.mock.calls[0]).toEqual([
        'https://api.github.com/repos/hovancik/stretchly/releases/latest',
        {
          method: 'GET',
          headers: { 'User-Agent': 'hovancik/stretchly' },
          mode: 'cors',
          cache: 'default'
        }
      ])

      expect(response.text).toHaveBeenCalled()
      expect(JSON.parse.mock.calls[0]).toEqual([body])
    })
  })
})
