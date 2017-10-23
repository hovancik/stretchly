const {ipcRenderer} = require('electron')

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
  ipcRenderer.send('set-default-settings', ['fullscreen', 'ideas', 'breakNotification', 'naturalBreaks'])
})
