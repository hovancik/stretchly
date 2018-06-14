const {ipcRenderer, remote} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})

ipcRenderer.send('send-settings')

ipcRenderer.on('renderSettings', (event, data) => {
  document.getElementById('language').value = data['language']
})

document.getElementById('language').addEventListener('change', function (e) {
  ipcRenderer.send('change-language', e.target.value)
  ipcRenderer.send('save-setting', 'language', e.target.value)
  window.location.reload()
})

document.getElementById('skip').addEventListener('click', function (e) {
  ipcRenderer.send('save-setting', 'isFirstRun', false)
  remote.getCurrentWindow().close()
})

document.getElementById('tutorial').addEventListener('click', function (e) {
  ipcRenderer.send('save-setting', 'isFirstRun', false)
  ipcRenderer.send('open-tutorial')
  remote.getCurrentWindow().close()
})
