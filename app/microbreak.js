const { ipcRenderer, remote } = require('electron')
const Utils = remote.require('./utils/utils')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

document.getElementById('close').addEventListener('click', event =>
  ipcRenderer.send('finish-microbreak', false)
)

document.getElementById('postpone').addEventListener('click', event =>
  ipcRenderer.send('postpone-microbreak')
)

ipcRenderer.on('microbreakIdea', (event, message) => {
  const microbreakIdea = document.getElementsByClassName('microbreak-idea')[0]
  // TODO use some library to auto scale test
  if (message.length > 80) {
    microbreakIdea.style.fontSize = '60px'
  }
  if (message.length > 100) {
    microbreakIdea.style.fontSize = '55px'
  }
  microbreakIdea.innerHTML = message
})

ipcRenderer.on('progress', (event, started, duration, strictMode, postpone, postponePercent) => {
  const progress = document.getElementById('progress')
  const progressTime = document.getElementById('progress-time')
  const postponeElement = document.getElementById('postpone')
  const closeElement = document.getElementById('close')

  window.setInterval(function () {
    if (Date.now() - started < duration) {
      const passedPercent = (Date.now() - started) / duration * 100
      postponeElement.style.visibility =
        Utils.canPostpone(postpone, passedPercent, postponePercent) ? 'visible' : 'hidden'
      closeElement.style.visibility =
        Utils.canSkip(strictMode, postpone, passedPercent, postponePercent) ? 'visible' : 'hidden'
      progress.value = passedPercent * progress.max / 100
      progressTime.innerHTML = Utils.formatRemaining(Math.trunc((duration - Date.now() + started) / 1000))
    }
  }, 100)
})
