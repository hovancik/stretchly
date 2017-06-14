const {shell, ipcRenderer} = require('electron')
const VersionChecker = require('./utils/versionChecker')

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

document.getElementById('homepage').addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://hovancik.net/stretchly')
})

document.getElementById('update').addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://github.com/hovancik/stretchly/releases')
})

new VersionChecker().latest(function (version) {
  document.getElementById('update').innerHTML = version
})

window.addEventListener('keydown', event => {
  if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
    ipcRenderer.send('show-debug')
  }
})

ipcRenderer.on('debugInfo', (event, reference, timeleft, settingsfile) => {
  let visible = document.getElementsByClassName('debug')[0].style.visibility === 'visible'
  if (visible) {
    document.getElementsByClassName('debug')[0].style.visibility = 'hidden'
  } else {
    document.getElementsByClassName('debug')[0].style.visibility = 'visible'
    let referenceElement = document.getElementById('reference')
    referenceElement.innerHTML = reference
    let timeleftElement = document.getElementById('timeleft')
    timeleftElement.innerHTML = timeleft
    let settingsfileElement = document.getElementById('settingsfile')
    settingsfileElement.innerHTML = settingsfile
  }
})
