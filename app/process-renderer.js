import VersionChecker from './utils/versionChecker.js'

window.onload = async (e) => {
  window.stretchly.onPlaySound(async (file, volume) => {
    const customAudio = file === 'silence'
      ? null
      : await window.electronApi.resolveLocalAudio(`${file}.wav`)
    const source = customAudio || `audio/${file}.wav`
    __electronLog.info(`Stretchly: playing ${source} (volume: ${volume})`)
    const audio = new Audio(source)
    audio.volume = volume
    audio.play().catch(exception => __electronLog.error(exception))
  })

  window.stretchly.onShowNotification(async (text, silent) => {
    __electronLog.info(`Stretchly: showing notification "${text}" (silent: ${silent})`)
    const title = await window.utils.shouldShowNotificationTitle(
      await window.runtime.platform(),
      await window.runtime.getSystemVersion()
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
    const title = await window.utils.shouldShowNotificationTitle(await window.runtime.platform(), await window.runtime.getSystemVersion()) ? 'Stretchly' : ''
    const notification = new Notification(title, {
      body: await window.i18next.t('process.newVersionAvailable'),
      silent,
      icon: '../build/icon.ico'
    })
    notification.onclick = () => window.electronApi.openExternal('https://hovancik.net/stretchly/downloads')
  }
}
