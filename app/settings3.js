const {ipcRenderer} = require('electron')
const lang = require('./lang')
lang.loadsetting3();
let eventsAttached = false
ipcRenderer.send('send-settings')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

ipcRenderer.on('renderSettings', (event, data) => {
  let enableElements = document.getElementsByClassName('enable')
  for (var i = 0; i < enableElements.length; i++) {
    let element = enableElements[i]
    element.checked = data[element.value]
    if (!eventsAttached) {
      element.addEventListener('click', function (e) {
        ipcRenderer.send('save-setting', element.value, element.checked)
      })
    }
  }

  document.body.style.background = data['mainColor']

  eventsAttached = true
})

document.getElementById('defaults').addEventListener('click', function (e) {
  ipcRenderer.send('set-default-settings', ['fullscreen', 'ideas', 'breakNotification'])
})

document.getElementById('Language').addEventListener('click', function (e) {
  var langsetting = document.getElementById("Language").value;
  ipcRenderer.send('save-setting', 'lang', langsetting)
  lang.loadsetting3();
})
