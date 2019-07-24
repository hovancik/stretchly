const { shell, ipcRenderer, remote } = require('electron')
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

document.querySelector('#node').innerHTML = process.versions.node
document.querySelector('#chrome').innerHTML = process.versions.chrome
document.querySelector('#electron').innerHTML = process.versions.electron

const updateElement = document.getElementById('update')

updateElement.addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://hovancik.net/stretchly/downloads')
})

const settingsfileElement = document.getElementById('settingsfile')

settingsfileElement.addEventListener('click', function (e) {
  e.preventDefault()
  shell.openItem(settingsfileElement.innerHTML)
})

// TODO refactor out?
const copyToClipBoard = (str) => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

document.querySelector('#copy').addEventListener('click', function (e) {
  e.preventDefault()
  const toCopy = document.querySelector('#to-copy')
  copyToClipBoard(toCopy.textContent)
  const copiedEl = document.createElement('span')
  copiedEl.innerHTML = ' copied!'
  this.parentNode.appendChild(copiedEl)
  setTimeout(() => copiedEl.remove(), 1275)
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

ipcRenderer.on('debugInfo', (event, reference, timeleft, breaknumber,
  postponesnumber, settingsfile, doNotDisturb) => {
  const visible = document.getElementsByClassName('debug')[0].style.visibility === 'visible'
  if (visible) {
    document.getElementsByClassName('debug')[0].style.visibility = 'hidden'
  } else {
    document.getElementsByClassName('debug')[0].style.visibility = 'visible'
    const referenceElement = document.getElementById('reference')
    referenceElement.innerHTML = reference
    const timeleftElement = document.getElementById('timeleft')
    timeleftElement.innerHTML = timeleft
    const breakNumber = document.getElementById('breakNumber')
    breakNumber.innerHTML = breaknumber
    const postponesNumber = document.getElementById('postponesNumber')
    postponesNumber.innerHTML = postponesnumber
    const settingsfileElement = document.getElementById('settingsfile')
    settingsfileElement.innerHTML = settingsfile
    const donotdisturbElement = document.getElementById('donotdisturb')
    donotdisturbElement.innerHTML = doNotDisturb
  }
})

document.getElementById('open-tutorial').addEventListener('click', function (e) {
  ipcRenderer.send('open-tutorial')
  remote.getCurrentWindow().close()
})
