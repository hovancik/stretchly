let Application = require('spectron').Application
let electronPath = require('electron')
const AppSettings = require('../app/utils/settings')

function modifySettings (key, value) {
  const app = new Application({
    path: electronPath,
    args: [
      `${__dirname}/../app`
    ]
  })

  return app.start()
    .then(() => {
      app.client.addCommand('getUserDataPath', function () {
        return this.execute(function () {
          // spectron does not have the ability to "get path", so we
          // instruct spectron to get the contents of the electron module
          // and get the location of the settings file directory
          // (https://github.com/electron/spectron/issues/16)
          return require('electron').remote.app.getPath('userData')
        })
      })

      return app.client.getUserDataPath()
    })
    .then((path) => {
      const settingsFile = `${path.value}/config.json`
      const settings = new AppSettings(settingsFile)
      settings.set(key, value)
      return app.stop()
    })
}

module.exports = {
  modifySettings
}
