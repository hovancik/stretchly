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
let breakPostponesLimitPlus = document.getElementById('breakPostponesLimitPlus')
let breakPostponesLimitMinus = document.getElementById('breakPostponesLimitMinus')
let breakPostponesLimit = document.getElementById('breakPostponesLimit')
let microbreakPostponableDurationPercentPlus = document.getElementById('microbreakPostponableDurationPercentPlus')
let microbreakPostponableDurationPercentMinus = document.getElementById('microbreakPostponableDurationPercentMinus')
let microbreakPostponableDurationPercent = document.getElementById('microbreakPostponableDurationPercent')
let microbreakPostponesLimitPlus = document.getElementById('microbreakPostponesLimitPlus')
let microbreakPostponesLimitMinus = document.getElementById('microbreakPostponesLimitMinus')
let microbreakPostponesLimit = document.getElementById('microbreakPostponesLimit')
let morningHourPlus = document.getElementById('morningHourPlus')
let morningHourMinus = document.getElementById('morningHourMinus')
let morningHour = document.getElementById('morningHour')

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

breakPostponesLimitPlus.addEventListener('click', function (e) {
  if (breakPostponesLimit.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'breakPostponesLimit', (parseInt(breakPostponesLimit.innerHTML, 10) + 1))
  }
})

breakPostponesLimitMinus.addEventListener('click', function (e) {
  if (breakPostponesLimit.innerHTML !== '1') {
    ipcRenderer.send('save-setting', 'breakPostponesLimit', (parseInt(breakPostponesLimit.innerHTML, 10) - 1))
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

microbreakPostponesLimitPlus.addEventListener('click', function (e) {
  if (microbreakPostponesLimit.innerHTML !== '5') {
    ipcRenderer.send('save-setting', 'microbreakPostponesLimit', (parseInt(microbreakPostponesLimit.innerHTML, 10) + 1))
  }
})

microbreakPostponesLimitMinus.addEventListener('click', function (e) {
  if (microbreakPostponesLimit.innerHTML !== '1') {
    ipcRenderer.send('save-setting', 'microbreakPostponesLimit', (parseInt(microbreakPostponesLimit.innerHTML, 10) - 1))
  }
})

morningHourPlus.addEventListener('click', function (e) {
  if (morningHour.innerHTML !== '10') {
    ipcRenderer.send('save-setting', 'morningHour', (parseInt(morningHour.innerHTML, 10) + 1))
  }
})

morningHourMinus.addEventListener('click', function (e) {
  if (morningHour.innerHTML !== '3') {
    ipcRenderer.send('save-setting', 'morningHour', (parseInt(morningHour.innerHTML, 10) - 1))
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
  breakPostponesLimit.innerHTML = data['breakPostponesLimit']
  microbreakPostponableDurationPercent.innerHTML = data['microbreakPostponableDurationPercent']
  microbreakPostponesLimit.innerHTML = data['microbreakPostponesLimit']
  morningHour.innerHTML = data['morningHour']
  document.body.style.background = data['mainColor']
  eventsAttached = true
})
