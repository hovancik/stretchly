import VersionChecker from './utils/versionChecker.js'

window.onload = async (e) => {
  window.stretchly.onPlaySound((file, volume) => {
    __electronLog.info(`Stretchly: playing audio/${file}.wav (volume: ${volume})`)
    const audio = new Audio(`audio/${file}.wav`)
    audio.volume = volume
    audio.play()
  })

  window.stretchly.onShowNotification(async (text, silent) => {
    __electronLog.info(`Stretchly: showing notification "${text}" (silent: ${silent})`)
    const title = await window.utils.shouldShowNotificationTitle(
      await window.process.platform(),
      await window.process.getSystemVersion()
    )
      ? 'Stretchly'
      : ''
    const notification = new Notification(title, {
      body: text,
      requireInteraction: true,
      silent,
      icon: '../build/icon.ico'
    })
    setTimeout(() => notification.close(), 7000)
  })

  window.stretchly.onCheckVersion(async (oldVersion, notify, silent) => {
    if (await window.global.getValue('isNewVersion') && notify) {
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
              window.stretchly.updateTray()
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
    const title = await window.utils.shouldShowNotificationTitle(await window.process.platform(), await window.process.getSystemVersion()) ? 'Stretchly' : ''
    const notification = new Notification(title, {
      body: await window.i18next.t('process.newVersionAvailable'),
      silent,
      icon: '../build/icon.ico'
    })
    notification.onclick = () => window.electronApi.openExternal('https://hovancik.net/stretchly/downloads')
  }
}
