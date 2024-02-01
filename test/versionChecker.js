const expect = require('chai').expect
const VersionChecker = require('../app/utils/versionChecker')

describe('VersionChecker', () => {
  describe('latest', () => {
    it('fetches tag name', async () => {
      const tagName = 'tag name'
      const body = 'body'
      JSON.parse = globalThis.vi.fn().mockReturnValue({ tag_name: tagName })
      const response = {
        text: globalThis.vi.fn().mockReturnValue(Promise.resolve(body))
      }
      global.fetch = globalThis.vi.fn().mockReturnValue(Promise.resolve(response))

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
