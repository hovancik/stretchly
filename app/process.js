const { ipcRenderer, shell, remote } = require('electron')
const VersionChecker = require('./utils/versionChecker')
const i18next = remote.require('i18next')
const semver = require('semver')

ipcRenderer.on('playSound', (event, file, volume) => {
  const audio = new Audio(`audio/${file}.wav`)
  audio.volume = volume
  audio.play()
})

ipcRenderer.on('checkVersion', (event, { oldVersion, notify, silent }) => {
  if (remote.getGlobal('shared').isNewVersion) {
    notifyNewVersion(silent)
  } else {
    new VersionChecker()
      .latest()
      .then(version => {
        const cleanVersion = semver.clean(version)
        if (semver.valid(cleanVersion) && semver.gt(cleanVersion, oldVersion)) {
          remote.getGlobal('shared').isNewVersion = true
          ipcRenderer.send('update-tray')
          if (notify) {
            notifyNewVersion(silent)
          }
        }
      })
      .catch(exception => console.error(exception))
  }
})

ipcRenderer.on('showNotification', (event, { text, silent }) => {
  new Notification('stretchly', { // eslint-disable-line no-new
    body: text,
    silent
  })
})

function notifyNewVersion (silent) {
  const notification = new Notification('stretchly', {
    body: i18next.t('process.newVersionAvailable'),
    silent
  })
  notification.onclick = () => shell.openExternal('https://hovancik.net/stretchly/downloads')
}
