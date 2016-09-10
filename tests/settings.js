const chai = require('chai')
// Actual Test Imports
const Settings = require('./../app/settings')
const defaultSettings = require('./../app/defaultSettings')

chai.should()

describe('Settings', () => {
  let settings

  beforeEach(() => {
    settings = new Settings('test')
  })

  it('should initialize with default settings', () => {
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
      settings = new Settings('test')
      settings.get('test_key').should.be.equal('test_value')
      done()
    }, 300)
  })

  it('should instantly save to a file with force enabled', () => {
    settings.set('test_key', 'test_value')
    settings._save(true)
    settings = null
    settings = new Settings('test')
    settings.get('test_key').should.be.equal('test_value')
  })

  afterEach(() => {
    if (settings && settings.destroy) {
      settings.destroy()
      settings = null
    }
  })
})
