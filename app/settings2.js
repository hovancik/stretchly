const {ipcRenderer} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})
let eventsAttached = false
ipcRenderer.send('send-settings')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

ipcRenderer.on('renderSettings', (event, data) => {
  let colorElements = document.getElementsByClassName('color')
  for (var i = 0; i < colorElements.length; i++) {
    let element = colorElements[i]
    let color = element.dataset.color
    element.style.background = color
    if (!eventsAttached) {
      element.addEventListener('click', function (e) {
        ipcRenderer.send('save-setting', 'mainColor', color)
        document.body.style.background = color
      })
    }
    document.body.style.background = data['mainColor']
  }

  let audioElements = document.getElementsByClassName('audio')
  for (var y = 0; y < audioElements.length; y++) {
    let audioElement = audioElements[y]
    let audio = audioElement.dataset.audio
    if (audio === data['audio']) {
      audioElement.style.background = '#777'
    } else {
      audioElement.style.background = '#e2e2e2'
    }
    if (!eventsAttached) {
      audioElement.addEventListener('click', function (e) {
        new Audio(`audio/${audio}.wav`).play()
        ipcRenderer.send('save-setting', 'audio', audio)
      })
    }
  }

  eventsAttached = true
})

document.getElementById('defaults').addEventListener('click', function (e) {
  ipcRenderer.send('set-default-settings', ['audio', 'mainColor'])
})
