import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('ElectronBridge', {
  // helloWorld: () {
  //   console.log("Hello World")
  // },

  showAdvancedPreferences: () => {
    ipcRenderer.send('open-advanced-preferences')
    ipcRenderer.send('close-current-window')
  },

  setContributor: () => {
    ipcRenderer.send('set-contributor')
  },

  openExternal: (link) => {
    shell.openExternal(link)
  },

  stretchlyVersion: () => {
    return ipcRenderer.invoke('get-version')
  },

  currentSettings: async () => {
    return await ipcRenderer.invoke('current-settings')
  },

  restoreRemoteSettings: (remoteSettings) => {
    ipcRenderer.invoke('restore-remote-settings', remoteSettings)
  }
})
