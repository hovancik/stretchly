import VersionChecker from './utils/versionChecker.js'

window.onload = async (e) => {
  window.electronAPI.onPlaySound((file, volume) => {
    __electronLog.info(`Stretchly: playing audio/${file}.wav (volume: ${volume})`)
    const audio = new Audio(`audio/${file}.wav`)
    audio.volume = volume
    audio.play()
  })

  window.electronAPI.onShowNotification(async (text, silent) => {
    __electronLog.info(`Stretchly: showing notification "${text}" (silent: ${silent})`)
    const title = await window.utils.shouldShowNotificationTitle(
      await window.process.platform,
      await window.process.getSystemVersion()
    )
      ? 'Stretchly'
      : ''
    const notification = new Notification(title, {
      body: text,
      requireInteraction: true,
      silent
    })
    setTimeout(() => notification.close(), 7000)
  })

  window.electronAPI.onCheckVersion(async (oldVersion, notify, silent) => {
    if (window.global.getValue('isNewVersion') && notify) {
      notifyNewVersion(silent)
    } else {
      new VersionChecker()
        .latest()
        .then(async version => {
          if (version) {
            const cleanVersion = await window.semver.clean(version)
            __electronLog.info(`Stretchly: checking for new version (local: ${oldVersion}, remote: ${cleanVersion})`)
            if (await window.semver.valid(cleanVersion) && await window.semver.gt(cleanVersion, oldVersion)) {
              await window.global.setValue('isNewVersion', true)
              window.electronAPI.updateTray()
              if (notify) {
                notifyNewVersion(silent)
              }
            }
          } else {
            __electronLog.info('Stretchly: could not check for new version')
          }
        })
        .catch(exception => __electronLog.error(exception))
    }
  })

  async function notifyNewVersion (silent) {
    const title = await window.utils.shouldShowNotificationTitle(await window.process.platform, await window.process.getSystemVersion()) ? 'Stretchly' : ''
    const notification = new Notification(title, {
      body: await window.i18next.t('process.newVersionAvailable'),
      silent
    })
    notification.onclick = () => window.electronAPI.openExternal('https://hovancik.net/stretchly/downloads')
  }
}
