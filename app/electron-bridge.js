import { ipcRenderer, shell, contextBridge } from 'electron'
import remote from '@electron/remote'

contextBridge.exposeInMainWorld('ElectronBridge', {
  // helloWorld: () {
  //   console.log("Hello World")
  // },

  showContributorPreferences: () => {
    ipcRenderer.send('open-contributor-preferences')
    remote.getCurrentWindow().close()
  },

  setContributor: () => {
    ipcRenderer.send('set-contributor')
  },

  openExternal: (link) => {
    shell.openExternal(link)
  },

  stretchlyVersion: () => {
    return remote.app.getVersion()
  },

  currentSettings: async () => {
    return await ipcRenderer.invoke('current-settings')
  },

  restoreRemoteSettings: (remoteSettings) => {
    ipcRenderer.invoke('restore-remote-settings', remoteSettings)
  }
})
