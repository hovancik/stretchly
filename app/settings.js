const { ipcRenderer, remote } = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')
const i18next = remote.require('i18next')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})

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
  if (microbreakDuration.innerHTML !== '900') {
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
  if (Number(breakDuration.innerHTML) < 5) {
    ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) + 1) * 1000 * 60)
  } else {
    ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) + 5) * 1000 * 60)
  }
})

breakDurationMinus.addEventListener('click', function (e) {
  if (Number(breakDuration.innerHTML) > 1) {
    if (Number(breakDuration.innerHTML) <= 5) {
      ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) - 1) * 1000 * 60)
    } else {
      ipcRenderer.send('save-setting', 'breakDuration', (parseInt(breakDuration.innerHTML, 10) - 5) * 1000 * 60)
    }
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

  let enableBreakTypeElements = document.getElementsByClassName('enabletype')
  for (let i = 0; i < enableBreakTypeElements.length; i++) {
    let element = enableBreakTypeElements[i]
    if (!eventsAttached) {
      element.addEventListener('click', function (e) {
        if (enabletypeCheckedCount() === 0) {
          element.checked = 'true'
          ipcRenderer.send('save-setting', element.value, element.checked)
          alert(i18next.t('settings.cantDisableBoth'))
        }
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

let enabletypeCheckedCount = function () {
  let enabled = 0
  let enableBreakTypeElements = document.getElementsByClassName('enabletype')
  for (let i = 0; i < enableBreakTypeElements.length; i++) {
    let element = enableBreakTypeElements[i]
    if (element.checked) {
      enabled += 1
    }
  }
  return enabled
}

document.getElementById('defaults').addEventListener('click', function (e) {
  ipcRenderer.send('set-default-settings', [
    'break',
    'microbreak',
    'breakInterval',
    'breakDuration',
    'microbreakInterval',
    'microbreakDuration',
    'microbreakStrictMode',
    'breakStrictMode',
    'microbreakPostpone',
    'breakPostpone'
  ])
})
