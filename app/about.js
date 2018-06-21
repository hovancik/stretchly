const {shell, ipcRenderer, remote} = require('electron')
const VersionChecker = require('./utils/versionChecker')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
})

document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

document.getElementById('homepage').addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://hovancik.net/stretchly')
})

const updateElement = document.getElementById('update')

updateElement.addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://hovancik.net/stretchly/downloads')
})

new VersionChecker()
  .latest()
  .then(version => {
    updateElement.innerHTML = version
  })
  .catch(exception => {
    console.error(exception)
    updateElement.innerHTML = 'Error getting latest version'
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

document.getElementById('open-tutorial').addEventListener('click', function (e) {
  ipcRenderer.send('open-tutorial')
  remote.getCurrentWindow().close()
})
