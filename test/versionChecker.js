const expect = require('chai').expect
const sinon = require('sinon')
const VersionChecker = require('../app/utils/versionChecker')

describe('VersionChecker', () => {
  describe('latest', () => {
    let sandbox

    beforeEach(() => {
      sandbox = sinon.createSandbox()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('fetches tag name', (done) => {
      const tagName = 'tag name'
      const body = 'body'
      sandbox.stub(JSON, 'parse').returns({ tag_name: tagName })
      const response = {
        text: sinon.stub().returns(Promise.resolve(body))
      }
      global.fetch = sinon.stub().returns(Promise.resolve(response))

      const checker = new VersionChecker()

      checker.latest()
        .then((result) => {
          expect(result).to.equal(tagName)

          sinon.assert.calledWithExactly(
            fetch,
            'https://api.github.com/repos/hovancik/stretchly/releases/latest',
            {
              method: 'GET',
              headers: {'User-Agent': 'hovancik/stretchly'},
              mode: 'cors',
              cache: 'default'
            })

          sinon.assert.called(response.text)
          sinon.assert.calledWithExactly(JSON.parse, body)

          done()
        })
    })
  })
})
