const Application = require('spectron').Application
const electronPath = require('electron')
const path = require('path')
const AppSettings = require('../app/utils/settings')

async function modifySettings (key, value) {
  let app

  try {
    app = new Application({
      path: electronPath,
      args: [
        path.join(__dirname, '/../app')
      ],
      chromeDriverArgs: [
        `--user-data-dir=${path.join(__dirname, '/stretchly-test-tmp')}`
      ]
    })

    await app.start()
  } catch (err) {
    console.log('error starting app:', err)
    throw err
  }

  try {
    app.client.addCommand('getUserDataPath', function () {
      return this.execute(function () {
        // spectron does not have the ability to "get path", so we
        // instruct spectron to get the contents of the electron module
        // and get the location of the settings file directory
        // (https://github.com/electron/spectron/issues/16)
        return require('electron').remote.app.getPath('userData')
      })
    })
  } catch (err) {
    console.log('error stubbing getUserDataPath command:', err)
    throw err
  }

  try {
    const path = await app.client.getUserDataPath()
    const settingsFile = `${path.value}/config.json`
    const settings = new AppSettings(settingsFile)
    settings.set(key, value)
  } catch (err) {
    console.log('error updating settings:', err)
    throw err
  }

  try {
    await app.stop()
  } catch (err) {
    console.log('error stopping application:', err)
    throw err
  }
}

module.exports = {
  modifySettings
}
