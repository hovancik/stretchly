const shell = require('electron').shell

document.getElementById('homepage').addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://hovancik.net/strechly')
})

document.getElementById('update').addEventListener('click', function (e) {
  e.preventDefault()
  shell.openExternal('https://github.com/hovancik/strechly/releases')
})
