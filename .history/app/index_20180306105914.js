const {ipcRenderer} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
    new HtmlTranslate(document).translate()
  })

document.getElementById('language').addEventListener('change', function (e) {
    ipcRenderer.send('change-language', e.target.value)
    ipcRenderer.send('save-setting', 'language', e.target.value)
    window.location.replace("welcome.html")
 })