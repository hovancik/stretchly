const Application = require('spectron').Application
const electronPath = require('electron')
const path = require('path')
const AppSettings = require('../app/utils/settings')

async function modifySettings (key, value) {
  const settingsFile = `${path.join(__dirname, '/stretchly-test-tmp/config.json')}`
  const settings = new AppSettings(settingsFile)
  settings.set(key, value)
}

module.exports = {
  modifySettings
}
