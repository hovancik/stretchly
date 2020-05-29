// process.on('uncaughtException', (...args) => console.error(...args))
const { app, nativeTheme, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut } = require('electron')
const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')

startI18next()

nativeTheme.on('updated', function theThemeHasChanged () {
  appIcon.setImage(trayIconPath())
})

const AppSettings = require('./utils/settings')
const Utils = require('./utils/utils')
const IdeasLoader = require('./utils/ideasLoader')
const BreaksPlanner = require('./breaksPlanner')
const AppIcon = require('./utils/appIcon')
const { UntilMorning } = require('./utils/untilMorning')

let microbreakIdeas
let breakIdeas
let breakPlanner
let appIcon = null
let processWin = null
let microbreakWins = null
let breakWins = null
let preferencesWin = null
let welcomeWin = null
let contributorPreferencesWindow = null
let settings
let pausedForSuspendOrLock = false

app.setAppUserModelId('net.hovancik.stretchly')

global.shared = {
  isNewVersion: false,
  isContributor: false
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log('Stretchly is already running.')
  app.quit()
  return
}

app.on('ready', startProcessWin)
app.on('ready', loadSettings)
app.on('ready', createTrayIcon)
app.on('ready', startPowerMonitoring)
app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})

function startI18next () {
  i18next
    .use(Backend)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      backend: {
        loadPath: `${__dirname}/locales/{{lng}}.json`,
        jsonIndent: 2
      }
    }, function (err, t) {
      if (err) {
        console.log(err.stack)
      }
      if (appIcon) {
        updateTray()
      }
    })
}

i18next.on('languageChanged', function (lng) {
  if (appIcon) {
    updateTray()
  }
})

function onSuspendOrLock () {
  if (!breakPlanner.isPaused) {
    pausedForSuspendOrLock = true
    pauseBreaks(1)
    updateTray()
  }
}

function onResumeOrUnlock () {
  if (pausedForSuspendOrLock) {
    pausedForSuspendOrLock = false
    resumeBreaks(false)
  } else if (breakPlanner.isPaused) {
    // corrrect the planner for the time spent in suspend
    breakPlanner.correctScheduler()
  }
  updateTray()
}

function startPowerMonitoring () {
  const electron = require('electron')
  electron.powerMonitor.on('suspend', onSuspendOrLock)
  electron.powerMonitor.on('lock-screen', onSuspendOrLock)
  electron.powerMonitor.on('resume', onResumeOrUnlock)
  electron.powerMonitor.on('unlock-screen', onResumeOrUnlock)
}

function numberOfDisplays () {
  const electron = require('electron')
  return electron.screen.getAllDisplays().length
}

function closeWindows (windowArray) {
  for (let i = windowArray.length - 1; i >= 0; i--) {
    windowArray[i].close()
  }
  return null
}

function displaysX (displayID = -1, width = 800) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays() || displayID < 0) {
    // Graceful handling of invalid displayID
    console.log('warning: invalid displayID to displaysX')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  return Math.ceil(bounds.x + ((bounds.width - width) / 2))
}

function displaysY (displayID = -1, height = 600) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays()) {
    // Graceful handling of invalid displayID
    console.log('warning: invalid displayID to displaysY')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  return Math.ceil(bounds.y + ((bounds.height - height) / 2))
}

function createTrayIcon () {
  appIcon = new Tray(trayIconPath())
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  updateTray()
  setInterval(updateTray, 10000)
}

function trayIconPath () {
  const params = {
    paused: breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd || breakPlanner.naturalBreaksManager.isSchedulerCleared,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: process.platform
  }
  const trayIconFileName = new AppIcon(params).trayIconFileName
  return `${__dirname}/images/app-icons/${trayIconFileName}`
}

function windowIconPath () {
  const params = {
    paused: breakPlanner.isPaused,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: process.platform
  }
  const windowIconFileName = new AppIcon(params).windowIconFileName
  return `${__dirname}/images/app-icons/${windowIconFileName}`
}

function startProcessWin () {
  const modalPath = `file://${__dirname}/process.html`
  processWin = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  processWin.loadURL(modalPath)
  processWin.once('ready-to-show', () => {
    planVersionCheck()
  })
}

function createWelcomeWindow () {
  if (settings.get('isFirstRun')) {
    const modalPath = `file://${__dirname}/welcome.html`
    welcomeWin = new BrowserWindow({
      x: displaysX(-1, 1000),
      y: displaysY(),
      width: 1000,
      autoHideMenuBar: true,
      icon: windowIconPath(),
      backgroundColor: 'EDEDED',
      webPreferences: {
        nodeIntegration: true
      }
    })
    welcomeWin.loadURL(modalPath)
    if (welcomeWin) {
      welcomeWin.on('closed', () => {
        welcomeWin = null
      })
    }
  }
}

function createContributorSettingsWindow () {
  if (contributorPreferencesWindow) {
    contributorPreferencesWindow.show()
    return
  }
  const modalPath = `file://${__dirname}/contributor-preferences.html`
  contributorPreferencesWindow = new BrowserWindow({
    x: displaysX(-1, 735),
    y: displaysY(),
    width: 735,
    autoHideMenuBar: true,
    icon: windowIconPath(),
    backgroundColor: 'EDEDED',
    webPreferences: {
      nodeIntegration: true
    }
  })
  contributorPreferencesWindow.loadURL(modalPath)
  if (contributorPreferencesWindow) {
    contributorPreferencesWindow.on('closed', () => {
      contributorPreferencesWindow = null
    })
  }
}
function planVersionCheck (seconds = 1) {
  setTimeout(checkVersion, seconds * 1000)
}

function checkVersion () {
  processWin.webContents.send('checkVersion', {
    oldVersion: `v${app.getVersion()}`,
    notify: settings.get('notifyNewVersion'),
    silent: settings.get('silentNotifications')
  })
  planVersionCheck(3600 * 5)
}

function startMicrobreakNotification () {
  showNotification(i18next.t('main.microbreakIn', { seconds: settings.get('microbreakNotificationInterval') / 1000 }))
  breakPlanner.nextBreakAfterNotification()
  updateTray()
}

function startBreakNotification () {
  showNotification(i18next.t('main.breakIn', { seconds: settings.get('breakNotificationInterval') / 1000 }))
  breakPlanner.nextBreakAfterNotification()
  updateTray()
}

function startMicrobreak () {
  if (!microbreakIdeas) {
    loadIdeas()
  }
  if (breakPlanner.naturalBreaksManager.idleTime > settings.get('breakDuration')) {
    console.log('in natural break')
    return
  }

  // don't start another break if break running
  if (microbreakWins) {
    console.log('microbreak already running')
    return
  }

  const startTime = Date.now()
  const breakDuration = settings.get('microbreakDuration')
  const strictMode = settings.get('microbreakStrictMode')
  const postponesLimit = settings.get('microbreakPostponesLimit')
  const postponableDurationPercent = settings.get('microbreakPostponableDurationPercent')
  const postponable = settings.get('microbreakPostpone') &&
    breakPlanner.postponesNumber < postponesLimit && postponesLimit > 0

  if (!strictMode || postponable) {
    globalShortcut.register(getKeyboardShortcut(), () => {
      const passedPercent = (Date.now() - startTime) / breakDuration * 100
      if (Utils.canPostpone(postponable, passedPercent, postponableDurationPercent)) {
        postponeMicrobreak()
      } else if (Utils.canSkip(strictMode, postponable, passedPercent, postponableDurationPercent)) {
        finishMicrobreak(false)
      }
    })
  }

  const modalPath = `file://${__dirname}/microbreak.html`
  microbreakWins = []

  const idea = settings.get('ideas') ? microbreakIdeas.randomElement : ['']

  if (settings.get('microbreakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    const windowOptions = {
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'Stretchly',
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    }

    if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displaysX(displayIdx)
      windowOptions.y = displaysY(displayIdx)
    }

    let microbreakWinLocal = new BrowserWindow(windowOptions)
    // microbreakWinLocal.webContents.openDevTools()
    microbreakWinLocal.once('ready-to-show', () => {
      microbreakWinLocal.showInactive()
      microbreakWinLocal.setKiosk(settings.get('fullscreen'))
      if (displayIdx === 0) {
        breakPlanner.emit('microbreakStarted', true)
      }
      microbreakWinLocal.webContents.send('microbreakIdea', idea)
      microbreakWinLocal.webContents.send('progress', startTime,
        breakDuration, strictMode, postponable, postponableDurationPercent, getKeyboardShortcut())
      microbreakWinLocal.setAlwaysOnTop(true)
    })
    microbreakWinLocal.loadURL(modalPath)
    microbreakWinLocal.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    if (microbreakWinLocal) {
      microbreakWinLocal.on('closed', () => {
        microbreakWinLocal = null
      })
    }
    microbreakWins.push(microbreakWinLocal)

    if (!settings.get('allScreens')) {
      break
    }
  }
  updateTray()
}

function startBreak () {
  if (!breakIdeas) {
    loadIdeas()
  }
  if (breakPlanner.naturalBreaksManager.idleTime > settings.get('breakDuration')) {
    console.log('in natural break')
    return
  }
  // don't start another break if break running
  if (breakWins) {
    console.log('break already running')
    return
  }

  const startTime = Date.now()
  const breakDuration = settings.get('breakDuration')
  const strictMode = settings.get('breakStrictMode')
  const postponesLimit = settings.get('breakPostponesLimit')
  const postponableDurationPercent = settings.get('breakPostponableDurationPercent')
  const postponable = settings.get('breakPostpone') &&
    breakPlanner.postponesNumber < postponesLimit && postponesLimit > 0

  if (!strictMode || postponable) {
    globalShortcut.register(getKeyboardShortcut(), () => {
      const passedPercent = (Date.now() - startTime) / breakDuration * 100
      if (Utils.canPostpone(postponable, passedPercent, postponableDurationPercent)) {
        postponeBreak()
      } else if (Utils.canSkip(strictMode, postponable, passedPercent, postponableDurationPercent)) {
        finishBreak(false)
      }
    })
  }

  const modalPath = `file://${__dirname}/break.html`
  breakWins = []

  const idea = settings.get('ideas') ? breakIdeas.randomElement : ['', '']

  if (settings.get('breakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    const windowOptions = {
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'Stretchly',
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    }

    if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displaysX(displayIdx)
      windowOptions.y = displaysY(displayIdx)
    }

    let breakWinLocal = new BrowserWindow(windowOptions)
    // breakWinLocal.webContents.openDevTools()
    breakWinLocal.once('ready-to-show', () => {
      breakWinLocal.showInactive()
      breakWinLocal.setKiosk(settings.get('fullscreen'))
      if (displayIdx === 0) {
        breakPlanner.emit('breakStarted', true)
      }
      breakWinLocal.webContents.send('breakIdea', idea)
      breakWinLocal.webContents.send('progress', startTime,
        breakDuration, strictMode, postponable, postponableDurationPercent, getKeyboardShortcut())
      breakWinLocal.setAlwaysOnTop(true)
    })
    breakWinLocal.loadURL(modalPath)
    breakWinLocal.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    if (breakWinLocal) {
      breakWinLocal.on('closed', () => {
        breakWinLocal = null
      })
    }
    breakWins.push(breakWinLocal)

    if (!settings.get('allScreens')) {
      break
    }
  }

  updateTray()
}

function breakComplete (shouldPlaySound, windows) {
  globalShortcut.unregister(getKeyboardShortcut())
  if (shouldPlaySound && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }
  if (process.platform === 'darwin') {
    // get focus on the last app
    Menu.sendActionToFirstResponder('hide:')
  }
  return closeWindows(windows)
}

function finishMicrobreak (shouldPlaySound = true) {
  microbreakWins = breakComplete(shouldPlaySound, microbreakWins)
  breakPlanner.nextBreak()
  updateTray()
}

function finishBreak (shouldPlaySound = true) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.nextBreak()
  updateTray()
}

function postponeMicrobreak (shouldPlaySound = false) {
  microbreakWins = breakComplete(shouldPlaySound, microbreakWins)
  breakPlanner.postponeCurrentBreak()
  updateTray()
}

function postponeBreak (shouldPlaySound = false) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.postponeCurrentBreak()
  updateTray()
}

function skipToMicrobreak () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.skipToMicrobreak()
  updateTray()
}

function skipToBreak () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.skipToBreak()
  updateTray()
}

function resetBreaks () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.reset()
  updateTray()
}

function loadSettings () {
  const dir = app.getPath('userData')
  const settingsFile = `${dir}/config.json`
  settings = new AppSettings(settingsFile)
  breakPlanner = new BreaksPlanner(settings)
  breakPlanner.nextBreak() // plan first break
  breakPlanner.on('startMicrobreakNotification', () => { startMicrobreakNotification() })
  breakPlanner.on('startBreakNotification', () => { startBreakNotification() })
  breakPlanner.on('startMicrobreak', () => { startMicrobreak() })
  breakPlanner.on('finishMicrobreak', (shouldPlaySound) => { finishMicrobreak(shouldPlaySound) })
  breakPlanner.on('startBreak', () => { startBreak() })
  breakPlanner.on('finishBreak', (shouldPlaySound) => { finishBreak(shouldPlaySound) })
  breakPlanner.on('resumeBreaks', () => { resumeBreaks() })
  breakPlanner.on('updateToolTip', function () {
    updateTray()
  })
  i18next.changeLanguage(settings.get('language'))
  createWelcomeWindow()
  nativeTheme.themeSource = settings.get('themeSource')
}

function loadIdeas () {
  let breakIdeasData
  let microbreakIdeasData
  if (settings.get('useIdeasFromSettings')) {
    breakIdeasData = settings.get('breakIdeas')
    microbreakIdeasData = settings.get('microbreakIdeas')
  } else {
    breakIdeasData = require('./utils/defaultBreakIdeas')
    microbreakIdeasData = require('./utils/defaultMicrobreakIdeas')
  }
  breakIdeas = new IdeasLoader(breakIdeasData).ideas()
  microbreakIdeas = new IdeasLoader(microbreakIdeasData).ideas()
}

function pauseBreaks (milliseconds) {
  if (microbreakWins) {
    finishMicrobreak(false)
  }
  if (breakWins) {
    finishBreak(false)
  }
  breakPlanner.pause(milliseconds)
  updateTray()
}

function resumeBreaks (notify = true) {
  breakPlanner.resume()
  if (notify) {
    showNotification(i18next.t('main.resumingBreaks'))
  }
  updateTray()
}

function createPreferencesWindow () {
  const electron = require('electron')
  if (preferencesWin) {
    preferencesWin.show()
    return
  }
  const modalPath = `file://${__dirname}/preferences.html`
  const maxHeight = (electron.screen
    .getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    .workAreaSize.height - 530) / 2.0 + 490
  preferencesWin = new BrowserWindow({
    autoHideMenuBar: true,
    icon: windowIconPath(),
    width: 600,
    height: 530,
    maxHeight: Math.round(maxHeight),
    x: displaysX(-1, 600),
    y: displaysY(-1, 530),
    backgroundColor: '#EDEDED',
    webPreferences: {
      nodeIntegration: true
    }
  })
  preferencesWin.loadURL(modalPath)
  preferencesWin.on('closed', () => {
    preferencesWin = null
  })
}

function updateTray () {
  updateToolTip()
  appIcon.setImage(trayIconPath())
  appIcon.setContextMenu(getTrayMenu())
}

function getTrayMenu () {
  const trayMenu = []
  const doNotDisturb = breakPlanner.dndManager.isOnDnd

  if (global.shared.isNewVersion) {
    trayMenu.push({
      label: i18next.t('main.downloadLatestVersion'),
      click: function () {
        shell.openExternal('https://hovancik.net/stretchly/downloads')
      }
    }, {
      type: 'separator'
    })
  }

  const StatusMessages = require('./utils/statusMessages')
  const statusMessage = new StatusMessages({
    breakPlanner: breakPlanner,
    settings: settings
  }).trayMessage

  if (statusMessage !== '') {
    const messages = statusMessage.split('\n')
    for (const index in messages) {
      trayMenu.push({
        label: messages[index],
        enabled: false
      })
    }

    trayMenu.push({
      type: 'separator'
    })
  }

  if (!(breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd)) {
    let submenu = []
    if (settings.get('microbreak')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toMicrobreak'),
        click: skipToMicrobreak
      }])
    }
    if (settings.get('break')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toBreak'),
        click: skipToBreak
      }])
    }
    if (settings.get('break') || settings.get('microbreak')) {
      trayMenu.push({
        label: i18next.t('main.skipToTheNext'),
        submenu: submenu
      })
    }
  }

  if (breakPlanner.isPaused) {
    trayMenu.push({
      label: i18next.t('main.resume'),
      click: function () {
        resumeBreaks(false)
        updateTray()
      }
    })
  } else if (!doNotDisturb) {
    trayMenu.push({
      label: i18next.t('main.pause'),
      submenu: [
        {
          label: i18next.t('main.forHour'),
          click: function () {
            pauseBreaks(3600 * 1000)
          }
        }, {
          label: i18next.t('main.for2Hours'),
          click: function () {
            pauseBreaks(3600 * 2 * 1000)
          }
        }, {
          label: i18next.t('main.for5Hours'),
          click: function () {
            pauseBreaks(3600 * 5 * 1000)
          }
        }, {
          label: i18next.t('main.untilMorning'),
          click: function () {
            const untilMorning = new UntilMorning(settings).timeUntilMorning()
            pauseBreaks(untilMorning)
          }
        }, {
          type: 'separator'
        }, {
          label: i18next.t('main.indefinitely'),
          click: function () {
            pauseBreaks(1)
          }
        }
      ]
    }, {
      label: i18next.t('main.resetBreaks'),
      click: resetBreaks
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.preferences'),
    click: function () {
      createPreferencesWindow()
    }
  }, {
    type: 'separator'
  }, {
    label: i18next.t('main.quitStretchly'),
    role: 'quit',
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}

function updateToolTip () {
  const StatusMessages = require('./utils/statusMessages')
  let trayMessage = i18next.t('main.toolTipHeader')
  const message = new StatusMessages({
    breakPlanner: breakPlanner,
    settings: settings
  }).trayMessage
  if (message !== '') {
    trayMessage += '\n\n' + message
  }
  appIcon.setToolTip(trayMessage)
}

function showNotification (text) {
  processWin.webContents.send('showNotification', {
    text: text,
    silent: settings.get('silentNotifications')
  })
}

function getKeyboardShortcut () {
  const keyBoardShortcutModifier = settings.get('keyBoardShortcutModifier')
  const keyBoardShortcutKey = settings.get('keyBoardShortcutKey')

  if (Utils.isValidKeyboardShortcut(keyBoardShortcutModifier, keyBoardShortcutKey)) {
    return keyBoardShortcutModifier + '+' + keyBoardShortcutKey
  }

  // The keyboard shortcut you set in the config.json is not valid. It must be set back to the default "CommandOrControl+X".
  settings.set('keyBoardShortcutModifier', 'CommandOrControl')
  settings.set('keyBoardShortcutKey', 'X')
  return 'CommandOrControl+X'
}

ipcMain.on('postpone-microbreak', function (event, shouldPlaySound) {
  postponeMicrobreak()
})

ipcMain.on('postpone-break', function (event, shouldPlaySound) {
  postponeBreak()
})

ipcMain.on('finish-microbreak', function (event, shouldPlaySound) {
  finishMicrobreak(shouldPlaySound)
})

ipcMain.on('finish-break', function (event, shouldPlaySound) {
  finishBreak(shouldPlaySound)
})

ipcMain.on('save-setting', function (event, key, value) {
  if (key === 'naturalBreaks') {
    breakPlanner.naturalBreaks(value)
  }

  if (key === 'monitorDnd') {
    breakPlanner.doNotDisturb(value)
  }

  if (key === 'language') {
    i18next.changeLanguage(value)
  }

  if (key === 'themeSource') {
    nativeTheme.themeSource = value
  }

  if (key === 'openAtLogin') {
    app.setLoginItemSettings({ openAtLogin: value })
  } else {
    settings.set(key, value)
  }

  updateTray()
})

ipcMain.on('update-tray', function (event) {
  updateTray()
})

ipcMain.on('restore-defaults', (event) => {
  const dialogOpts = {
    type: 'question',
    title: i18next.t('main.restoreDefaults'),
    message: i18next.t('main.warning'),
    buttons: [i18next.t('main.continue'), i18next.t('main.cancel')]
  }
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      settings.restoreDefaults()
      i18next.changeLanguage(settings.get('language'))
      updateTray()
      event.sender.webContents.send('renderSettings', settingsToSend())
    }
  })
})

ipcMain.on('send-settings', function (event) {
  event.sender.send('renderSettings', settingsToSend())
})

function settingsToSend () {
  const loginItemSettings = app.getLoginItemSettings()
  const openAtLogin = loginItemSettings.openAtLogin
  return Object.assign({}, settings.data, { openAtLogin: openAtLogin })
}

ipcMain.on('play-sound', function (event, sound) {
  processWin.webContents.send('playSound', sound, settings.get('volume'))
})

ipcMain.on('show-debug', function (event) {
  const reference = breakPlanner.scheduler.reference
  const timeleft = Utils.formatTimeRemaining(breakPlanner.scheduler.timeLeft)
  const breaknumber = breakPlanner.breakNumber
  const postponesnumber = breakPlanner.postponesNumber
  const doNotDisturb = breakPlanner.dndManager.isOnDnd
  const dir = app.getPath('userData')
  const settingsFile = path.join(dir, 'config.json')
  event.sender.send('debugInfo', reference, timeleft,
    breaknumber, postponesnumber, settingsFile, doNotDisturb)
})

ipcMain.on('open-preferences', function (event) {
  createPreferencesWindow()
})

ipcMain.on('set-contributor', function (event) {
  global.shared.isContributor = true
  if (preferencesWin) {
    preferencesWin.send('enableContributorPreferences')
  }
})

ipcMain.on('open-contributor-preferences', function (event) {
  createContributorSettingsWindow()
})

ipcMain.on('open-contributor-auth', function (event, provider) {
  const myStretchlyUrl = `https://my.stretchly.net/app/v1?provider=${provider}`
  const myStretchlyWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    icon: windowIconPath(),
    x: displaysX(),
    y: displaysY(),
    backgroundColor: 'whitesmoke',
    webPreferences: {
      preload: path.resolve(__dirname, './electron-bridge.js'),
      nodeIntegration: false
    }
  })
  myStretchlyWindow.loadURL(myStretchlyUrl)
})
