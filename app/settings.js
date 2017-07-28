const {ipcRenderer} = require('electron')

let eventsAttached = false
ipcRenderer.send('send-settings')

let microbreakIntervalPlus = document.getElementById('microbreakIntervalPlus')
let microbreakIntervalMinus = document.getElementById('microbreakIntervalMinus')
let microbreakInterval = document.getElementById('microbreakInterval')

let microbreakDurationPlus = document.getElementById('microbreakDurationPlus')
let microbreakDurationMinus = document.getElementById('microbreakDurationMinus')
let microbreakDuration = document.getElementById('microbreakDuration')

let breakIntervalPlus = document.getElementById('breakIntervalPlus')
let breakIntervalMinus = document.getElementById('breakIntervalMinus')
let breakInterval = document.getElementById('breakInterval')

let breakDurationPlus = document.getElementById('breakDurationPlus')
let breakDurationMinus = document.getElementById('breakDurationMinus')
let breakDuration = document.getElementById('breakDuration')
let realBreakInterval = document.getElementById('realBreakInterval')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

microbreakIntervalPlus.addEventListener('click', function (e) {
  if (microbreakInterval.innerHTML !== '30') {
    ipcRenderer.send('save-setting', 'microbreakInterval', (parseInt(microbreakInterval.innerHTML, 10) + 5) * 1000 * 60)
  }
})

microbreakIntervalMinus.addEventListener('click', function (e) {
  if (microbreakInterval.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'microbreakInterval', (parseInt(microbreakInterval.innerHTML, 10) - 5) * 1000 * 60)
  }
})

microbreakDurationPlus.addEventListener('click', function (e) {
  if (microbreakDuration.innerHTML !== '30') {
    ipcRenderer.send('save-setting', 'microbreakDuration', (parseInt(microbreakDuration.innerHTML, 10) + 5) * 1000)
  }
})

microbreakDurationMinus.addEventListener('click', function (e) {
  if (microbreakDuration.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'microbreakDuration', (parseInt(microbreakDuration.innerHTML, 10) - 5) * 1000)
  }
})

breakIntervalPlus.addEventListener('click', function (e) {
  if (breakInterval.innerHTML !== '30') {
    ipcRenderer.send('save-setting', 'breakInterval', parseInt(breakInterval.innerHTML, 10) + 1)
  }
})

breakIntervalMinus.addEventListener('click', function (e) {
  if (breakInterval.innerHTML !== '1') {
    ipcRenderer.send('save-setting', 'breakInterval', parseInt(breakInterval.innerHTML, 10) - 1)
  }
})

breakDurationPlus.addEventListener('click', function (e) {
  if (breakDuration.innerHTML !== '15') {
    ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) + 5) * 1000 * 60)
  }
})

breakDurationMinus.addEventListener('click', function (e) {
  if (breakDuration.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) - 5) * 1000 * 60)
  }
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

  microbreakInterval.innerHTML = data['microbreakInterval'] / 1000 / 60
  microbreakDuration.innerHTML = data['microbreakDuration'] / 1000
  breakInterval.innerHTML = data['breakInterval']
  breakDuration.innerHTML = data['breakDuration'] / 1000 / 60
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
