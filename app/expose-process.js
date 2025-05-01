import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('process', {
  platform: () => process.platform,
  windowsStore: () => process.windowsStore
})
