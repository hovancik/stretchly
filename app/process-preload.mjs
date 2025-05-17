import { contextBridge, ipcRenderer, shell } from 'electron'
import semver from 'semver'
import humanizeDuration from 'humanize-duration'
import * as utils from './utils/utils.js'

contextBridge.exposeInMainWorld('electronAPI', {
  onPlaySound: (callback) => ipcRenderer.on('play-sound',
    (_event, file, volume) => callback(file, volume)),
  onShowNotification: (callback) => ipcRenderer.on('show-notification',
    (_event, text, silent) => callback(text, silent)),
  onCheckVersion: (callback) => ipcRenderer.on('check-version',
    (_event, oldVersion, notify, silent) => callback(oldVersion, notify, silent)),
  updateTray: () => ipcRenderer.send('update-tray'),
  openExternal: (path) => shell.openExternal(path)
})

contextBridge.exposeInMainWorld('humanize', {
  humanizeDuration: (ms, { opts }) => { humanizeDuration(ms, opts) }
})

contextBridge.exposeInMainWorld('semver', {
  valid: (version) => semver.valid(version),
  clean: (version) => semver.clean(version),
  coerce: (version) => semver.coerce(version),
  gt: (a, b) => semver.gt(a, b),
  gte: (a, b) => semver.gte(a, b)
})

contextBridge.exposeInMainWorld('process', {
  platform: () => process.platform,
  getSystemVersion: () => process.getSystemVersion()
})

contextBridge.exposeInMainWorld('global', {
  setValue: (name, value) => ipcRenderer.send('set-global-value', name, value),
  getValue: (name) => ipcRenderer.invoke('get-global-value', name)
})

contextBridge.exposeInMainWorld('i18next', {
  t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options)
})

contextBridge.exposeInMainWorld('utils', {
  shouldShowNotificationTitle: (platform, systemVersion) => {
    return utils.shouldShowNotificationTitle(platform, systemVersion, semver)
  }
})
