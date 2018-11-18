const {remote, ipcRenderer} = require('electron')

window.ElectronBridge = {
  helloWorld () {
    console.log("Hello World")
  },

  openContriborSettings () {
    ipcRenderer.send('open-contributor-settings')
    remote.getCurrentWindow().close()
  }
}
