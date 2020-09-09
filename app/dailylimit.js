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
  ipcRenderer.send('finish-dailylimit', false)

document.querySelector('#postpone').onclick = event =>
  ipcRenderer.send('postpone-dailylimit')

ipcRenderer.on('dailylimitIdea', (event, message) => {
  const dailylimitIdea = document.querySelector('.daily-limit-idea')
  dailylimitIdea.innerHTML = message
})

ipcRenderer.on('progress', (event, keyboardShortcut) => {
  const postponeElement = document.querySelector('#postpone')
  const closeElement = document.querySelector('#close')

  document.querySelectorAll('.tiptext').forEach(tt => {
    tt.innerHTML = Utils.formatKeyboardShortcut(keyboardShortcut)
  })

  postponeElement.style.display = 'flex'
  closeElement.style.display = 'flex'
})
