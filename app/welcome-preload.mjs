import { ipcRenderer, shell, contextBridge } from 'electron'
import './expose-process.js'

contextBridge.exposeInMainWorld('settings', {
  currentSettings: async () => {
    return await ipcRenderer.invoke('current-settings')
  },
  saveSettings: async (key, value) => {
    ipcRenderer.send('save-setting', key, value)
  }
})

contextBridge.exposeInMainWorld('i18next', {
  t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options),
  dir: () => ipcRenderer.invoke('i18next-dir')
})

contextBridge.exposeInMainWorld('electronAPI', {
  onTranslate: (callback) => ipcRenderer.on('translate',
    (_event) => callback()),
  openExternal: (path) => shell.openExternal(path),
  openPreferences: () => ipcRenderer.send('open-preferences'),
  closeWindow: () => ipcRenderer.send('close-welcome-window')
})
