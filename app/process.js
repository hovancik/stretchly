const {ipcRenderer, shell, remote} = require('electron')
let VersionChecker = require('./utils/versionChecker')

ipcRenderer.on('playSound', (event, data) => {
  let audio = new Audio(`audio/${data}.wav`)
  audio.play()
})

ipcRenderer.on('checkVersion', (event, data) => {
  if (remote.getGlobal('shared').isNewVersion) {
    notifyNewVersion()
  } else {
    new VersionChecker().latest(function (version) {
      const semantic = /^v([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/
      if (version.match(semantic) && data !== version) {
        remote.getGlobal('shared').isNewVersion = true
        ipcRenderer.send('update-tray')
        notifyNewVersion()
      }
    })
  }
})

ipcRenderer.on('showNotification', (event, data) => {
  new Notification('stretchly', { // eslint-disable-line no-new
    body: data
  })
})

function notifyNewVersion () {
  let notification = new Notification('stretchly', {
    body: 'New version is available!'
  })
  notification.onclick = () => shell.openExternal('https://github.com/hovancik/stretchly/releases')
}
