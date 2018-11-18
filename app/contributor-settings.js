const { ipcRenderer } = require('electron')
let eventsAttached = false
ipcRenderer.send('send-settings')

let microbreakNotificationIntervalPlus = document.getElementById('microbreakNotificationIntervalPlus')
let microbreakNotificationIntervalMinus = document.getElementById('microbreakNotificationIntervalMinus')
let microbreakNotificationInterval = document.getElementById('microbreakNotificationInterval')
let breakNotificationIntervalPlus = document.getElementById('breakNotificationIntervalPlus')
let breakNotificationIntervalMinus = document.getElementById('breakNotificationIntervalMinus')
let breakNotificationInterval = document.getElementById('breakNotificationInterval')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

microbreakNotificationIntervalPlus.addEventListener('click', function (e) {
  if (microbreakNotificationInterval.innerHTML !== '120') {
    ipcRenderer.send('save-setting', 'microbreakNotificationInterval', (parseInt(microbreakNotificationInterval.innerHTML, 10) + 5) * 1000)
  }
})

microbreakNotificationIntervalMinus.addEventListener('click', function (e) {
  if (microbreakNotificationInterval.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'microbreakNotificationInterval', (parseInt(microbreakNotificationInterval.innerHTML, 10) - 5) * 1000)
  }
})

breakNotificationIntervalPlus.addEventListener('click', function (e) {
  if (breakNotificationInterval.innerHTML !== '120') {
    ipcRenderer.send('save-setting', 'breakNotificationInterval', (parseInt(breakNotificationInterval.innerHTML, 10) + 5) * 1000)
  }
})

breakNotificationIntervalMinus.addEventListener('click', function (e) {
  if (breakNotificationInterval.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'breakNotificationInterval', (parseInt(breakNotificationInterval.innerHTML, 10) - 5) * 1000)
  }
})

ipcRenderer.on('renderSettings', (event, data) => {
  microbreakNotificationInterval.innerHTML = data['microbreakNotificationInterval'] / 1000
  breakNotificationInterval.innerHTML = data['breakNotificationInterval'] / 1000
  document.body.style.background = data['mainColor']
  eventsAttached = true
})
