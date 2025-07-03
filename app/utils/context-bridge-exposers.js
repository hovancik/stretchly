import semver from 'semver'
import humanizeDuration from 'humanize-duration'
import { contextBridge, ipcRenderer, shell } from 'electron'
import * as utils from './utils.js'

function exposeElectronApi () {
  contextBridge.exposeInMainWorld('electronApi', {
    openExternal: (path) => shell.openExternal(path),
    openPath: (path) => shell.openPath(path)
  })
}

function exposeGlobal () {
  contextBridge.exposeInMainWorld('global', {
    setValue: (name, value) => ipcRenderer.send('set-global-value', name, value),
    getValue: (name) => ipcRenderer.invoke('get-global-value', name)
  })
}

function exposeI18next () {
  contextBridge.exposeInMainWorld('i18next', {
    t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options),
    dir: () => ipcRenderer.invoke('i18next-dir')
  })
}

function exposeBreaks (type) {
  contextBridge.exposeInMainWorld('breaks', {
    sendBreakData: () => ipcRenderer.invoke(`send-${type}-break-data`),
    finishBreak: () => ipcRenderer.send(`finish-${type}-break`, false),
    postponeBreak: () => ipcRenderer.send(`postpone-${type}-break`),
    signalLoaded: () => ipcRenderer.send(`${type}-break-loaded`)
  })
}

function exposeProcess () {
  contextBridge.exposeInMainWorld('process', {
    platform: () => process.platform,
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    windowsStore: () => process.versions.windowsStore,
    getSystemVersion: () => process.getSystemVersion()
  })
}

function exposeSemver () {
  contextBridge.exposeInMainWorld('semver', {
    valid: (version) => semver.valid(version),
    clean: (version) => semver.clean(version),
    coerce: (version) => semver.coerce(version),
    gt: (a, b) => semver.gt(a, b),
    gte: (a, b) => semver.gte(a, b)
  })
}

function exposeSettings () {
  contextBridge.exposeInMainWorld('settings', {
    get: (key) => ipcRenderer.invoke('settings-get', key),
    currentSettings: async () => {
      return await ipcRenderer.invoke('current-settings')
    },
    saveSettings: async (key, value) => {
      ipcRenderer.send('save-setting', key, value)
    }
  })
}

function exposeStretchly () {
  contextBridge.exposeInMainWorld('stretchly', {
    onTranslate: (callback) => ipcRenderer.on('translate',
      () => callback()),
    onPlaySound: (callback) => ipcRenderer.on('play-sound',
      (_event, file, volume) => callback(file, volume)),
    onShowNotification: (callback) => ipcRenderer.on('show-notification',
      (_event, text, silent) => callback(text, silent)),
    onCheckVersion: (callback) => ipcRenderer.on('check-version',
      (_event, oldVersion, notify, silent) => callback(oldVersion, notify, silent)),
    onEnableContributorPreferences: (callback) => ipcRenderer.on('enable-contributor-preferences',
      () => callback()),
    getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
    getVersion: () => ipcRenderer.invoke('get-version'),
    setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),
    restoreDefaults: () => ipcRenderer.send('restore-defaults'),
    closeWindow: () => ipcRenderer.send('close-current-window'),
    openContributorAuth: (provider) => ipcRenderer.send('open-contributor-auth', provider),
    openContributorPreferences: () => ipcRenderer.send('open-contributor-preferences'),
    openSyncPreferences: () => ipcRenderer.send('open-sync-preferences'),
    openPreferences: () => ipcRenderer.send('open-preferences'),
    playSound: (name) => ipcRenderer.send('play-sound', name),
    showDebug: () => ipcRenderer.invoke('show-debug'),
    updateTray: () => ipcRenderer.send('update-tray')
  })
}

function exposeUtils () {
  const i18n = {
    t: (key, options) => ipcRenderer.invoke('i18next-translate', key, options)
  }
  contextBridge.exposeInMainWorld('utils', {
    formatKeyboardShortcut: utils.formatKeyboardShortcut,
    formatTimeRemaining: async (milliseconds, locale) => {
      return utils.formatTimeRemaining(milliseconds, locale, i18n, humanizeDuration)
    },
    formatUnitAndValue: (unit, value) => {
      return utils.formatUnitAndValue(unit, value, i18n)
    },
    shouldShowNotificationTitle: (platform, systemVersion) => {
      return utils.shouldShowNotificationTitle(platform, systemVersion, semver)
    },
    canPostpone: utils.canPostpone,
    canSkip: utils.canSkip
  })
}

export {
  exposeElectronApi,
  exposeGlobal,
  exposeI18next,
  exposeBreaks,
  exposeSemver,
  exposeSettings,
  exposeStretchly,
  exposeProcess,
  exposeUtils
}
