const { ipcRenderer } = require('electron')
const remote = require('@electron/remote')
const Utils = remote.require('./utils/utils')
const HtmlTranslate = require('./utils/htmlTranslate')
const Store = require('electron-store')
const settings = new Store()

window.onload = (event) => {
  require('./platform')
  new HtmlTranslate(document).translate()

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  document.querySelector('#close').onclick = event =>
    ipcRenderer.send('finish-break', false)

  document.querySelector('#postpone').onclick = event =>
    ipcRenderer.send('postpone-break')

  ipcRenderer.on('breakIdea', (event, message) => {
    const breakIdea = document.querySelector('.break-idea')
    breakIdea.innerHTML = message[0]
    const breakText = document.querySelector('.break-text')
    breakText.innerHTML = message[1]
  })

  ipcRenderer.on('progress', (event, started, duration, strictMode, postpone, postponePercent) => {
    const progress = document.querySelector('#progress')
    const progressTime = document.querySelector('#progress-time')
    const postponeElement = document.querySelector('#postpone')
    const closeElement = document.querySelector('#close')
    const mainColor = settings.get('mainColor')
    document.body.classList.add(mainColor.substring(1))

    document.querySelectorAll('.tiptext').forEach(tt => {
      const keyboardShortcut = settings.get('endBreakShortcut')
      tt.innerHTML = Utils.formatKeyboardShortcut(keyboardShortcut)
    })

    window.setInterval(() => {
      if (Date.now() - started < duration) {
        const passedPercent = (Date.now() - started) / duration * 100
        Utils.canSkip(strictMode, postpone, passedPercent, postponePercent)
        postponeElement.style.display =
          Utils.canPostpone(postpone, passedPercent, postponePercent) ? 'flex' : 'none'
        closeElement.style.display =
          Utils.canSkip(strictMode, postpone, passedPercent, postponePercent) ? 'flex' : 'none'
        progress.value = (100 - passedPercent) * progress.max / 100
        progressTime.innerHTML = Utils.formatTimeRemaining(Math.trunc(duration - Date.now() + started))
      }
    }, 100)
  })
}
