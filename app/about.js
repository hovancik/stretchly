let {shell} = require('electron')
let VersionChecker = require('./utils/versionChecker')

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
