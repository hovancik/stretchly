const {ipcRenderer} = require('electron')

ipcRenderer.on('playSound', (event, data) => {
  let audio = new Audio(`audio/${data}.wav`)
  audio.play()
})
