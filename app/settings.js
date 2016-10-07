const {ipcRenderer} = require('electron')

let microbreakIntervalPlus = document.getElementById('microbreakIntervalPlus')
let microbreakIntervalMinus = document.getElementById('microbreakIntervalMinus')
let microbreakInterval = document.getElementById('microbreakInterval')

let microbreakDurationPlus = document.getElementById('microbreakDurationPlus')
let microbreakDurationMinus = document.getElementById('microbreakDurationMinus')
let microbreakDuration = document.getElementById('microbreakDuration')

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

ipcRenderer.on('renderSettings', (event, data) => {
  let colorElements = document.getElementsByClassName('color')
  for (var i = 0; i < colorElements.length; i++) {
    let element = colorElements[i]
    let color = element.dataset.color
    element.style.background = color
    element.addEventListener('click', function (e) {
      ipcRenderer.send('save-setting', 'mainColor', color)
      document.body.style.background = color
    })
  }

  let audioElements = document.getElementsByClassName('audio')
  for (var y = 0; y < audioElements.length; y++) {
    let audioElement = audioElements[y]
    let audio = audioElement.dataset.audio
    if (audio === data['microbreakAudio']) {
      audioElement.style.background = '#777'
    } else {
      audioElement.style.background = '#e2e2e2'
    }
    audioElement.addEventListener('click', function (e) {
      new Audio(`audio/${audio}.wav`).play()
      ipcRenderer.send('save-setting', 'microbreakAudio', audio)
    })
  }

  microbreakInterval.innerHTML = data['microbreakInterval'] / 1000 / 60
  microbreakDuration.innerHTML = data['microbreakDuration'] / 1000
})
