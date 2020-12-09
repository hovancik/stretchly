const { ipcRenderer, remote } = require('electron')
const Utils = remote.require('./utils/utils')
const HtmlTranslate = require('./utils/htmlTranslate')

window.onload = (event) =>
  new HtmlTranslate(document).translate()

document.ondragover = event =>
  event.preventDefault()

document.ondrop = event =>
  event.preventDefault()

document.querySelector('#close').onclick = event =>
  ipcRenderer.send('finish-microbreak', false)

document.querySelector('#postpone').onclick = event =>
  ipcRenderer.send('postpone-microbreak')

ipcRenderer.on('microbreakIdea', (event, message) => {
  const microbreakIdea = document.querySelector('.microbreak-idea')
  // TODO use some library to auto scale test
  // if (message.length > 80) {
  //   microbreakIdea.style.fontSize = '60px'
  // }
  // if (message.length > 100) {
  //   microbreakIdea.style.fontSize = '55px'
  // }
  microbreakIdea.innerHTML = message
})

ipcRenderer.on('progress', (event, started, duration, strictMode, postpone, postponePercent, settings) => {
  const theme = settings.data.themeName
  document.body.classList.add(theme)
  const progress = document.querySelector('#progress')
  const progressTime = document.querySelector('#progress-time')
  const postponeElement = document.querySelector('#postpone')
  const closeElement = document.querySelector('#close')

  document.querySelectorAll('.tiptext').forEach(tt => {
    const keyboardShortcut = settings.data.endBreakShortcut
    tt.innerHTML = Utils.formatKeyboardShortcut(keyboardShortcut)
  })

  window.setInterval(() => {
    if (Date.now() - started < duration) {
      const passedPercent = (Date.now() - started) / duration * 100
      postponeElement.style.display =
        Utils.canPostpone(postpone, passedPercent, postponePercent) ? 'flex' : 'none'
      closeElement.style.display =
        Utils.canSkip(strictMode, postpone, passedPercent, postponePercent) ? 'flex' : 'none'
      progress.value = (100 - passedPercent) * progress.max / 100
      progressTime.innerHTML = Utils.formatTimeRemaining(Math.trunc(duration - Date.now() + started))
    }
  }, 100)
})
