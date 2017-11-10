const {ipcRenderer, shell, remote} = require('electron')
let VersionChecker = require('./utils/versionChecker')
const i18next = remote.require('i18next')
ipcRenderer.on('playSound', (event, data) => {
  let audio = new Audio(`audio/${data}.wav`)
  audio.play()
})

ipcRenderer.on('checkVersion', (event, data) => {
  if (remote.getGlobal('shared').isNewVersion) {
    notifyNewVersion()
  } else {
    new VersionChecker()
      .latest()
      .then(version => {
        const semantic = /^v([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/
        if (version.match(semantic) && data !== version) {
          remote.getGlobal('shared').isNewVersion = true
          ipcRenderer.send('update-tray')
          notifyNewVersion()
        }
      })
      .catch(exception => console.error(exception))
  }
})

ipcRenderer.on('showNotification', (event, data) => {
  new Notification('stretchly', { // eslint-disable-line no-new
    body: data
  })
})

function notifyNewVersion () {
  let notification = new Notification('stretchly', {
    body: i18next.t('process.newVersionAvailable')
  })
  notification.onclick = () => shell.openExternal('https://github.com/hovancik/stretchly/releases')
}
