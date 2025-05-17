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
  onTranslate: (callback) => ipcRenderer.on('translate', () => callback()),
  onEnableContributorPreferences: (callback) => ipcRenderer.on('enable-contributor-preferences', () => callback()),
  openExternal: (path) => shell.openExternal(path),
  openPath: (path) => shell.openPath(path),
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),
  openContributorPreferences: () => ipcRenderer.send('open-contributor-preferences'),
  openSyncPreferences: () => ipcRenderer.send('open-sync-preferences'),
  showDebug: () => ipcRenderer.invoke('show-debug'),
  restoreDefaults: () => ipcRenderer.send('restore-defaults'),
  playSound: (name) => ipcRenderer.send('play-sound', name),
  openContributorAuth: (provider) => ipcRenderer.send('open-contributor-auth', provider)
})

contextBridge.exposeInMainWorld('global', {
  setValue: (name, value) => ipcRenderer.send('set-global-value', name, value),
  getValue: (name) => ipcRenderer.invoke('get-global-value', name)
})
