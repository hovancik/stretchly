import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('ElectronBridge', {
  // helloWorld: () {
  //   console.log("Hello World")
  // },

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
    return ipcRenderer.invoke('restore-remote-settings', remoteSettings)
  }
})
