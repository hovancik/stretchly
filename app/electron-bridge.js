const { remote, ipcRenderer, shell } = require('electron')
const defaultSettings = require('./utils/defaultSettings')

window.ElectronBridge = {
  // helloWorld () {
  //   console.log("Hello World")
  // },

  showContributorPreferences () {
    ipcRenderer.send('open-contributor-preferences')
    remote.getCurrentWindow().close()
  },

  setContributor () {
    ipcRenderer.send('set-contributor')
  },

  openExternal (link) {
    shell.openExternal(link)
  },

  stretchlyVersion () {
    return remote.app.getVersion()
  },

  defaultSettings () {
    return defaultSettings
  },

  async currentSettings () {
    return await ipcRenderer.invoke('current-settings')
  }

}
