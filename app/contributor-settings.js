const { ipcRenderer } = require('electron')
let eventsAttached = false
ipcRenderer.send('send-settings')

const microbreakNotificationIntervalPlus = document.getElementById('microbreakNotificationIntervalPlus')
const microbreakNotificationIntervalMinus = document.getElementById('microbreakNotificationIntervalMinus')
const microbreakNotificationInterval = document.getElementById('microbreakNotificationInterval')
const breakNotificationIntervalPlus = document.getElementById('breakNotificationIntervalPlus')
const breakNotificationIntervalMinus = document.getElementById('breakNotificationIntervalMinus')
const breakNotificationInterval = document.getElementById('breakNotificationInterval')
const breakPostponeTimePlus = document.getElementById('breakPostponeTimePlus')
const breakPostponeTimeMinus = document.getElementById('breakPostponeTimeMinus')
const breakPostponeTime = document.getElementById('breakPostponeTime')
const microbreakPostponeTimePlus = document.getElementById('microbreakPostponeTimePlus')
const microbreakPostponeTimeMinus = document.getElementById('microbreakPostponeTimeMinus')
const microbreakPostponeTime = document.getElementById('microbreakPostponeTime')
const breakPostponableDurationPercentPlus = document.getElementById('breakPostponableDurationPercentPlus')
const breakPostponableDurationPercentMinus = document.getElementById('breakPostponableDurationPercentMinus')
const breakPostponableDurationPercent = document.getElementById('breakPostponableDurationPercent')
const breakPostponesLimitPlus = document.getElementById('breakPostponesLimitPlus')
const breakPostponesLimitMinus = document.getElementById('breakPostponesLimitMinus')
const breakPostponesLimit = document.getElementById('breakPostponesLimit')
const microbreakPostponableDurationPercentPlus = document.getElementById('microbreakPostponableDurationPercentPlus')
const microbreakPostponableDurationPercentMinus = document.getElementById('microbreakPostponableDurationPercentMinus')
const microbreakPostponableDurationPercent = document.getElementById('microbreakPostponableDurationPercent')
const microbreakPostponesLimitPlus = document.getElementById('microbreakPostponesLimitPlus')
const microbreakPostponesLimitMinus = document.getElementById('microbreakPostponesLimitMinus')
const microbreakPostponesLimit = document.getElementById('microbreakPostponesLimit')
const morningHourPlus = document.getElementById('morningHourPlus')
const morningHourMinus = document.getElementById('morningHourMinus')
const morningHour = document.getElementById('morningHour')

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
  const enableElements = document.getElementsByClassName('enable')
  for (let i = 0; i < enableElements.length; i++) {
    const element = enableElements[i]
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
