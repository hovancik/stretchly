import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('process', {
  platform: () => process.platform,
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  windowsStore: () => process.versions.windowsStore,
  getSystemVersion: () => process.getSystemVersion()
})
