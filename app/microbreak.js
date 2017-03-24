const {ipcRenderer} = require('electron')
const Utils = require('./utils/utils')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

document.getElementById('close').addEventListener('click', function (e) {
  ipcRenderer.send('finish-microbreak', false)
})

ipcRenderer.on('microbreakIdea', (event, message, strictMode) => {
  if (!strictMode) {
    document.getElementById('close').style.visibility = 'visible'
    window.addEventListener('keydown', event => {
      if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
        ipcRenderer.send('finish-microbreak', false)
      }
    })
  }
  let microbreakIdea = document.getElementsByClassName('microbreak-idea')[0]
  microbreakIdea.innerHTML = message
})

ipcRenderer.on('progress', (event, started, duration) => {
  started = Date.now()
  let intervalID = window.setInterval(updateProgress, 10)
  function updateProgress () {
    if (Date.now() - started < duration) {
      document.getElementById('progress').value = (Date.now() - started) / duration * 10000
      document.getElementById('progress-time').innerHTML = Utils.formatRemaining(Math.trunc((duration - Date.now() + started) / 1000))
    } else {
      clearInterval(intervalID)
    }
  }
})
