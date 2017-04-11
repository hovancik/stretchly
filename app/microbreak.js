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
  let progress = document.getElementById('progress')
  let progressTime = document.getElementById('progress-time')
  window.setInterval(Utils.updateProgress.bind(null, started, duration, progress, progressTime), 10)
})
