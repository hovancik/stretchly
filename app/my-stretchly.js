const {remote} = require('electron')

window.ElectronBridge = {
  helloWorld () {
    console.log("Hello World")
  }
}
