const chai = require('chai')
const fs = require('fs')
// Actual Test Imports
const Settings = require('./../app/utils/settings')
const defaultSettings = require('./../app/utils/defaultSettings')

const testFileLocation = `${__dirname}/testFile`
const testMissingFileLocation = `${__dirname}/test-missing.json`
const testMissingFileCopyLocation = `${__dirname}/test-missing-copy.json`

chai.should()

describe('Settings', () => {
  let settings
  beforeEach(() => {
    settings = new Settings(testFileLocation)
  })

  it('should initialize with default settings', () => {
    settings.data.should.be.deep.equal(defaultSettings)
  })

  it('should load missing settings', () => {
    const testData = fs.readFileSync(testMissingFileLocation)
    fs.writeFileSync(testMissingFileCopyLocation, testData)
    // we create copy to not worry about git changes to `test-missing.json`
    settings = new Settings(testMissingFileCopyLocation)
    defaultSettings['microbreak'] = false
    settings.data.should.be.deep.equal(defaultSettings)
  })

  it('should set a new value in the runtime', () => {
    settings.set('test_key', 'test_value')
    settings.get('test_key').should.be.equal('test_value')
  })

  it('should save a value to a file', (done) => {
    settings.set('test_key', 'test_value')
    setTimeout(() => {
      settings = null
      settings = new Settings(testFileLocation)
      settings.get('test_key').should.be.equal('test_value')
      done()
    }, 300)
  })

  it('should instantly save to a file with force enabled', () => {
    settings.set('test_key', 'test_value')
    settings._save(true)
    settings = null
    settings = new Settings(testFileLocation)
    settings.get('test_key').should.be.equal('test_value')
  })

  afterEach(() => {
    if (settings && settings.destroy) {
      settings.destroy()
      settings = null
    }
  })
})
