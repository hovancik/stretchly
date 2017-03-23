const {ipcRenderer} = require('electron')

let eventsAttached = false

let realBreakInterval = document.getElementById('realBreakInterval')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

let microbreakDuration = document.getElementById('microbreakDuration')
microbreakDuration.addEventListener('change', function () {
  ipcRenderer.send('save-setting', 'microbreakDuration', microbreakDuration.value * 1000)
})

let microbreakInterval = document.getElementById('microbreakInterval')
microbreakInterval.addEventListener('change', function () {
  ipcRenderer.send('save-setting', 'microbreakInterval', microbreakInterval.value * 1000 * 60)
})

let breakInterval = document.getElementById('breakInterval')
breakInterval.addEventListener('change', function () {
  ipcRenderer.send('save-setting', 'breakInterval', breakInterval.value)
})

let breakDuration = document.getElementById('breakDuration')
breakDuration.addEventListener('change', function () {
  ipcRenderer.send('save-setting', 'breakDuration', breakDuration.value * 1000 * 60)
})

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

  microbreakInterval.value = data['microbreakInterval'] / 1000 / 60
  microbreakDuration.value = data['microbreakDuration'] / 1000
  breakInterval.value = data['breakInterval']
  breakDuration.value = data['breakDuration'] / 1000 / 60
  realBreakInterval.innerHTML = data['microbreakInterval'] / 1000 / 60 * (data['breakInterval'] + 1)

  document.body.style.background = data['mainColor']

  eventsAttached = true
})

document.getElementById('defaults').addEventListener('click', function (e) {
  ipcRenderer.send('set-default-settings', [
    'break',
    'microbreak',
    'breakInterval',
    'breakDuration',
    'microbreakInterval',
    'microbreakDuration',
    'microbreakStrictMode',
    'breakStrictMode'
  ])
})
