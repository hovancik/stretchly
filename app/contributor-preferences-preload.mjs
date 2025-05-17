import { ipcRenderer, contextBridge } from 'electron'

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
