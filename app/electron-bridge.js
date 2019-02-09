const {remote, ipcRenderer, shell} = require('electron')

window.ElectronBridge = {
  // helloWorld () {
  //   console.log("Hello World")
  // },

  openContriborSettings () {
    ipcRenderer.send('open-contributor-settings')
    remote.getCurrentWindow().close()
  },

  openExternal (link) {
    shell.openExternal(link)
  },

  stretchlyVersion () {
    return remote.app.getVersion()
  }
}
