const { ipcRenderer } = require('electron')
let eventsAttached = false
ipcRenderer.send('send-settings')

let microbreakNotificationIntervalPlus = document.getElementById('microbreakNotificationIntervalPlus')
let microbreakNotificationIntervalMinus = document.getElementById('microbreakNotificationIntervalMinus')
let microbreakNotificationInterval = document.getElementById('microbreakNotificationInterval')
let breakNotificationIntervalPlus = document.getElementById('breakNotificationIntervalPlus')
let breakNotificationIntervalMinus = document.getElementById('breakNotificationIntervalMinus')
let breakNotificationInterval = document.getElementById('breakNotificationInterval')
let breakPostponeTimePlus = document.getElementById('breakPostponeTimePlus')
let breakPostponeTimeMinus = document.getElementById('breakPostponeTimeMinus')
let breakPostponeTime = document.getElementById('breakPostponeTime')
let microbreakPostponeTimePlus = document.getElementById('microbreakPostponeTimePlus')
let microbreakPostponeTimeMinus = document.getElementById('microbreakPostponeTimeMinus')
let microbreakPostponeTime = document.getElementById('microbreakPostponeTime')
let breakPostponableDurationPercentPlus = document.getElementById('breakPostponableDurationPercentPlus')
let breakPostponableDurationPercentMinus = document.getElementById('breakPostponableDurationPercentMinus')
let breakPostponableDurationPercent = document.getElementById('breakPostponableDurationPercent')
let microbreakPostponableDurationPercentPlus = document.getElementById('microbreakPostponableDurationPercentPlus')
let microbreakPostponableDurationPercentMinus = document.getElementById('microbreakPostponableDurationPercentMinus')
let microbreakPostponableDurationPercent = document.getElementById('microbreakPostponableDurationPercent')



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

breakPostponeTimePlus.addEventListener('click', function (e) {
  if (breakNotificationInterval.innerHTML !== '600') {
    ipcRenderer.send('save-setting', 'breakPostponeTime', (parseInt(breakPostponeTime.innerHTML, 10) + 5) * 1000)
  }
})

breakPostponeTimeMinus.addEventListener('click', function (e) {
  if (breakPostponeTime.innerHTML !== '60') {
    ipcRenderer.send('save-setting', 'breakPostponeTime', (parseInt(breakPostponeTime.innerHTML, 10) - 5) * 1000)
  }
})

microbreakPostponeTimePlus.addEventListener('click', function (e) {
  if (breakNotificationInterval.innerHTML !== '600') {
    ipcRenderer.send('save-setting', 'microbreakPostponeTime', (parseInt(microbreakPostponeTime.innerHTML, 10) + 5) * 1000)
  }
})

microbreakPostponeTimeMinus.addEventListener('click', function (e) {
  if (microbreakPostponeTime.innerHTML !== '60') {
    ipcRenderer.send('save-setting', 'microbreakPostponeTime', (parseInt(microbreakPostponeTime.innerHTML, 10) - 5) * 1000)
  }
})

breakPostponableDurationPercentPlus.addEventListener('click', function (e) {
  console.log(breakNotificationInterval.innerHTML)
  if (breakPostponableDurationPercentPlus.innerHTML !== '80') {
    ipcRenderer.send('save-setting', 'breakPostponableDurationPercent', (parseInt(breakPostponableDurationPercent.innerHTML, 10) + 5))
  }
})

breakPostponableDurationPercentMinus.addEventListener('click', function (e) {
  if (breakPostponableDurationPercent.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'breakPostponableDurationPercent', (parseInt(breakPostponableDurationPercent.innerHTML, 10) - 5))
  }
})

microbreakPostponableDurationPercentPlus.addEventListener('click', function (e) {
  if (microbreakPostponableDurationPercent.innerHTML !== '80') {
    ipcRenderer.send('save-setting', 'microbreakPostponableDurationPercent', (parseInt(microbreakPostponableDurationPercent.innerHTML, 10) + 5))
  }
})

microbreakPostponableDurationPercentMinus.addEventListener('click', function (e) {
  if (microbreakPostponableDurationPercent.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'microbreakPostponableDurationPercent', (parseInt(microbreakPostponableDurationPercent.innerHTML, 10) - 5))
  }
})

ipcRenderer.on('renderSettings', (event, data) => {
  let enableElements = document.getElementsByClassName('enable')
  for (let i = 0; i < enableElements.length; i++) {
    let element = enableElements[i]
    element.checked = data[element.value]
    if (!eventsAttached) {
      element.addEventListener('click', function (e) {
        ipcRenderer.send('save-setting', element.value, element.checked)
      })
    }
  }

  microbreakNotificationInterval.innerHTML = data['microbreakNotificationInterval'] / 1000
  breakNotificationInterval.innerHTML = data['breakNotificationInterval'] / 1000
  breakPostponeTime.innerHTML = data['breakPostponeTime'] / 1000
  microbreakPostponeTime.innerHTML = data['microbreakPostponeTime'] / 1000
  breakPostponableDurationPercent.innerHTML = data['breakPostponableDurationPercent']
  microbreakPostponableDurationPercent.innerHTML = data['microbreakPostponableDurationPercent']
  document.body.style.background = data['mainColor']
  eventsAttached = true
})
