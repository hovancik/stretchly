const {ipcRenderer} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
    new HtmlTranslate(document).translate()
  })
  let eventsAttached = false
  ipcRenderer.send('send-settings', ['X'])

  ipcRenderer.on('renderSettings', (event, data) => {  
    document.body.style.background = data['mainColor']
    document.getElementById('language').value = data['language']
    eventsAttached = true
  })

document.getElementById('language').addEventListener('change', function (e) {
    ipcRenderer.send('change-language', e.target.value)
    ipcRenderer.send('save-setting', 'language', e.target.value)
    window.location.replace("welcome.html")
 })