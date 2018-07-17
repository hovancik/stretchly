const {ipcRenderer, remote} = require('electron')
const Utils = remote.require('./utils/utils')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

document.getElementById('close').addEventListener('click', function (e) {
  ipcRenderer.send('finish-microbreak', false)
})

ipcRenderer.on('microbreakIdea', (event, message, strictMode) => {
  if (!strictMode) {
    document.getElementById('close').style.visibility = 'visible'
  }
  if (message) {
    let microbreakIdea = document.getElementsByClassName('microbreak-idea')[0]
    microbreakIdea.innerHTML = message
  }
})

ipcRenderer.on('progress', (event, started, duration) => {
  let progress = document.getElementById('progress')
  let progressTime = document.getElementById('progress-time')
  window.setInterval(function () {
    if (Date.now() - started < duration) {
      progress.value = (Date.now() - started) / duration * 10000
      progressTime.innerHTML = Utils.formatRemaining(Math.trunc((duration - Date.now() + started) / 1000))
    }
  }, 100)
})
