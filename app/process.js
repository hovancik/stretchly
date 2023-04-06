const { ipcRenderer, shell } = require('electron')
const remote = require('@electron/remote')
const VersionChecker = require('./utils/versionChecker')
const i18next = remote.require('i18next')
const semver = require('semver')
const { shouldShowNotificationTitle } = require('./utils/utils')
const log = require('electron-log')
const path = require('path')
log.transports.file.resolvePath = () => path.join(remote.app.getPath('userData'), 'logs/main.log')

window.onload = (e) => {
  ipcRenderer.on('playSound', (event, file, volume) => {
    log.info(`Stretchly: playing audio/${file}.wav (volume: ${volume})`)
    const audio = new Audio(`audio/${file}.wav`)
    audio.volume = volume
    audio.play()
  })

  ipcRenderer.on('checkVersion', (event, { oldVersion, notify, silent }) => {
    if (remote.getGlobal('shared').isNewVersion && notify) {
      notifyNewVersion(silent)
    } else {
      new VersionChecker()
        .latest()
        .then(version => {
          if (version) {
            const cleanVersion = semver.clean(version)
            log.info(`Stretchly: checking for new version (local: ${oldVersion}, remote: ${cleanVersion})`)
            if (semver.valid(cleanVersion) && semver.gt(cleanVersion, oldVersion)) {
              remote.getGlobal('shared').isNewVersion = true
              ipcRenderer.send('update-tray')
              if (notify) {
                notifyNewVersion(silent)
              }
            }
          } else {
            log.info('Stretchly: could not check for new version')
          }
        })
        .catch(exception => log.error(exception))
    }
  })

  ipcRenderer.on('showNotification', (event, { text, silent }) => {
    const title = shouldShowNotificationTitle(process.platform, process.getSystemVersion()) ? 'Stretchly' : ''
    new Notification(title, { // eslint-disable-line no-new
      body: text,
      silent
    })
  })

  function notifyNewVersion (silent) {
    const title = shouldShowNotificationTitle(process.platform, process.getSystemVersion()) ? 'Stretchly' : ''
    const notification = new Notification(title, {
      body: i18next.t('process.newVersionAvailable'),
      silent
    })
    notification.onclick = () => shell.openExternal('https://hovancik.net/stretchly/downloads')
  }
}
