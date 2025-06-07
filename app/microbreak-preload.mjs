import { contextBridge, ipcRenderer } from 'electron'
import humanizeDuration from 'humanize-duration'
import * as utils from './utils/utils.js'
import './exposes/expose-process.js'

contextBridge.exposeInMainWorld('i18next', {
  t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options),
  dir: () => ipcRenderer.invoke('i18next-dir')
})

contextBridge.exposeInMainWorld('settings', {
  get: (key) => ipcRenderer.invoke('settings-get', key)
})

contextBridge.exposeInMainWorld('breaks', {
  sendBreakData: () => ipcRenderer.invoke('send-microbreak-data'),
  finishBreak: () => ipcRenderer.send('finish-microbreak', false),
  postponeBreak: () => ipcRenderer.send('postpone-microbreak'),
  signalLoaded: () => ipcRenderer.send('mini-break-loaded'),
  formatKeyboardShortcut: utils.formatKeyboardShortcut,
  formatTimeRemaining: async (milliseconds, locale) => {
    const i18n = {
      t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options)
    }
    return utils.formatTimeRemaining(milliseconds, locale, i18n, humanizeDuration)
  },
  canPostpone: utils.canPostpone,
  canSkip: utils.canSkip
})
