// process.on('uncaughtException', (...args) => console.error(...args))
const { app, nativeTheme, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut } = require('electron')
const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')
const log = require('electron-log')

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
const Command = require('./utils/commands')

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
let syncPreferencesWindow = null
let myStretchlyWindow = null
let settings
let pausedForSuspendOrLock = false
let nextIdea = null

app.setAppUserModelId('net.hovancik.stretchly')

global.shared = {
  isNewVersion: false,
  isContributor: false
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log('Stretchly command instance: started\n')
  const args = process.argv.slice(app.isPackaged ? 1 : 2)
  const cmd = new Command(args, app.getVersion())
  cmd.runOrForward()
  app.quit()
  return
}

app.on('ready', startProcessWin)
app.on('ready', loadSettings)
app.on('ready', createTrayIcon)
app.on('ready', startPowerMonitoring)
app.on('second-instance', runCommand)
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
  log.info('System: suspend or lock')
  if (!breakPlanner.isPaused) {
    pausedForSuspendOrLock = true
    pauseBreaks(1)
    updateTray()
  }
}

function onResumeOrUnlock () {
  log.info('System: resume or unlock')
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

function displaysX (displayID = -1, width = 800, fullscreen = false) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays() || displayID < 0) {
    // Graceful handling of invalid displayID
    log.warn('Stretchly: invalid displayID to displaysX')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  if (fullscreen) {
    return Math.ceil(bounds.x)
  } else {
    return Math.ceil(bounds.x + ((bounds.width - width) / 2))
  }
}

function displaysY (displayID = -1, height = 600, fullscreen = false) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays()) {
    // Graceful handling of invalid displayID
    log.warn('Stretchly: invalid displayID to displaysY')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  if (fullscreen) {
    return Math.ceil(bounds.y)
  } else {
    return Math.ceil(bounds.y + ((bounds.height - height) / 2))
  }
}

function displaysWidth (displayID = -1) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays()) {
    // Graceful handling of invalid displayID
    log.warn('Stretchly: invalid displayID to displaysY')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  return Math.ceil(bounds.width)
}

function displaysHeight (displayID = -1) {
  const electron = require('electron')
  let theScreen
  if (displayID === -1) {
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else if (displayID >= numberOfDisplays()) {
    // Graceful handling of invalid displayID
    log.warn('Stretchly: invalid displayID to displaysY')
    theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  } else {
    const screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  const bounds = theScreen.bounds
  return Math.ceil(bounds.height)
}

function createTrayIcon () {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  appIcon = new Tray(trayIconPath())
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

function createSyncPreferencesWindow () {
  if (syncPreferencesWindow) {
    syncPreferencesWindow.show()
    return
  }

  const syncPreferencesUrl = 'https://my.stretchly.net/app/v1/sync'
  syncPreferencesWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1000,
    height: 700,
    icon: windowIconPath(),
    x: displaysX(),
    y: displaysY(),
    backgroundColor: 'whitesmoke',
    webPreferences: {
      preload: path.resolve(__dirname, './electron-bridge.js'),
      nodeIntegration: false
    }
  })
  syncPreferencesWindow.loadURL(syncPreferencesUrl)
  if (syncPreferencesWindow) {
    syncPreferencesWindow.on('closed', () => {
      syncPreferencesWindow = null
    })
  }
}

function planVersionCheck (seconds = 1) {
  setTimeout(checkVersion, seconds * 1000)
}

function checkVersion () {
  if (settings.get('checkNewVersion')) {
    processWin.webContents.send('checkVersion', {
      oldVersion: `v${app.getVersion()}`,
      notify: settings.get('notifyNewVersion'),
      silent: settings.get('silentNotifications')
    })
    planVersionCheck(3600 * 5)
  }
}

function startMicrobreakNotification () {
  showNotification(i18next.t('main.microbreakIn', { seconds: settings.get('microbreakNotificationInterval') / 1000 }))
  log.info('Stretchly: showing Mini Break notification')
  breakPlanner.nextBreakAfterNotification()
  updateTray()
}

function startBreakNotification () {
  showNotification(i18next.t('main.breakIn', { seconds: settings.get('breakNotificationInterval') / 1000 }))
  log.info('Stretchly: showing Long Break notification')
  breakPlanner.nextBreakAfterNotification()
  updateTray()
}

function startMicrobreak () {
  if (!microbreakIdeas) {
    loadIdeas()
  }
  // don't start another break if break running
  if (microbreakWins) {
    log.warn('Stretchly: Mini Break already running, not starting Mini Break')
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
    globalShortcut.register(settings.get('endBreakShortcut'), () => {
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

  const idea = nextIdea || (settings.get('ideas') ? microbreakIdeas.randomElement : [''])
  nextIdea = null

  if (settings.get('microbreakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }

  for (let localDisplayId = 0; localDisplayId < numberOfDisplays(); localDisplayId++) {
    const windowOptions = {
      width: Number.parseInt(displaysWidth(localDisplayId) * settings.get('breakWindowWidth')),
      height: Number.parseInt(displaysHeight(localDisplayId) * settings.get('breakWindowHeight')),
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: false,
      show: false,
      transparent: settings.get('transparentMode'),
      backgroundColor: calculateBackgroundColor(),
      skipTaskbar: true,
      focusable: false,
      title: 'Stretchly',
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    }

    if (settings.get('fullscreen') && process.platform !== 'darwin') {
      windowOptions.width = displaysWidth(localDisplayId)
      windowOptions.height = displaysHeight(localDisplayId)
      windowOptions.x = displaysX(localDisplayId, 0, true)
      windowOptions.y = displaysY(localDisplayId, 0, true)
    } else if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displaysX(localDisplayId, windowOptions.width, false)
      windowOptions.y = displaysY(localDisplayId, windowOptions.height, false)
    }

    let microbreakWinLocal = new BrowserWindow(windowOptions)
    // seems to help with multiple-displays problems
    microbreakWinLocal.setSize(windowOptions.width, windowOptions.height)
    // microbreakWinLocal.webContents.openDevTools()
    microbreakWinLocal.once('ready-to-show', () => {
      microbreakWinLocal.showInactive()
      log.info(`Stretchly: showing window ${localDisplayId + 1} of ${numberOfDisplays()}`)
      if (process.platform === 'darwin') {
        microbreakWinLocal.setKiosk(settings.get('fullscreen'))
      }
      if (localDisplayId === 0) {
        breakPlanner.emit('microbreakStarted', true)
        log.info('Stretchly: starting Mini Break')
      }
      microbreakWinLocal.webContents.send('microbreakIdea', idea)
      microbreakWinLocal.webContents.send('progress', startTime,
        breakDuration, strictMode, postponable, postponableDurationPercent, settings.get('endBreakShortcut'))
      if (!settings.get('fullscreen') && process.platform !== 'darwin') {
        setTimeout(() => {
          microbreakWinLocal.center()
        }, 0)
      }
    })

    microbreakWinLocal.loadURL(modalPath)
    microbreakWinLocal.setVisibleOnAllWorkspaces(true)
    microbreakWinLocal.setAlwaysOnTop(true, 'screen-saver')
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
  if (breakWins) {
    log.warn('Stretchly: Long Break already running, not starting Long Break')
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
    globalShortcut.register(settings.get('endBreakShortcut'), () => {
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

  const defaultNextIdea = settings.get('ideas') ? breakIdeas.randomElement : ['', '']
  const idea = nextIdea ? (nextIdea.map((val, index) => val || defaultNextIdea[index])) : defaultNextIdea
  nextIdea = null

  if (settings.get('breakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }

  for (let localDisplayId = 0; localDisplayId < numberOfDisplays(); localDisplayId++) {
    const windowOptions = {
      width: Number.parseInt(displaysWidth(localDisplayId) * settings.get('breakWindowWidth')),
      height: Number.parseInt(displaysHeight(localDisplayId) * settings.get('breakWindowHeight')),
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: false,
      show: false,
      transparent: settings.get('transparentMode'),
      backgroundColor: calculateBackgroundColor(),
      skipTaskbar: true,
      focusable: false,
      title: 'Stretchly',
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true
      }
    }

    if (settings.get('fullscreen') && process.platform !== 'darwin') {
      windowOptions.width = displaysWidth(localDisplayId)
      windowOptions.height = displaysHeight(localDisplayId)
      windowOptions.x = displaysX(localDisplayId, 0, true)
      windowOptions.y = displaysY(localDisplayId, 0, true)
    } else if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displaysX(localDisplayId, windowOptions.width, false)
      windowOptions.y = displaysY(localDisplayId, windowOptions.height, false)
    }

    let breakWinLocal = new BrowserWindow(windowOptions)
    // seems to help with multiple-displays problems
    breakWinLocal.setSize(windowOptions.width, windowOptions.height)
    // breakWinLocal.webContents.openDevTools()
    breakWinLocal.once('ready-to-show', () => {
      breakWinLocal.showInactive()
      log.info(`Stretchly: showing window ${localDisplayId + 1} of ${numberOfDisplays()}`)
      if (process.platform === 'darwin') {
        breakWinLocal.setKiosk(settings.get('fullscreen'))
      }
      if (localDisplayId === 0) {
        breakPlanner.emit('breakStarted', true)
        log.info('Stretchly: starting Mini Break')
      }
      breakWinLocal.webContents.send('breakIdea', idea)
      breakWinLocal.webContents.send('progress', startTime,
        breakDuration, strictMode, postponable, postponableDurationPercent, settings.get('endBreakShortcut'))
      if (!settings.get('fullscreen') && process.platform !== 'darwin') {
        setTimeout(() => {
          breakWinLocal.center()
        }, 0)
      }
    })
    breakWinLocal.loadURL(modalPath)
    breakWinLocal.setVisibleOnAllWorkspaces(true)
    breakWinLocal.setAlwaysOnTop(true, 'screen-saver')
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
  globalShortcut.unregister(settings.get('endBreakShortcut'))
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
  log.info('Stretchly: finishing Mini Break')
  breakPlanner.nextBreak()
  updateTray()
}

function finishBreak (shouldPlaySound = true) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  log.info('Stretchly: finishing Long Break')
  breakPlanner.nextBreak()
  updateTray()
}

function postponeMicrobreak (shouldPlaySound = false) {
  microbreakWins = breakComplete(shouldPlaySound, microbreakWins)
  breakPlanner.postponeCurrentBreak()
  log.info('Stretchly: postponing Mini Break')
  updateTray()
}

function postponeBreak (shouldPlaySound = false) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.postponeCurrentBreak()
  log.info('Stretchly: postponing Long Break')
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
  log.info('Stretchly: skipping to Mini Break')
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
  log.info('Stretchly: skipping to Long Break')
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
  log.info('Stretchly: reseting breaks')
  updateTray()
}

function calculateBackgroundColor () {
  const themeColor = settings.get('mainColor')
  const opacity = settings.get('opacity')
  return '#' + Math.round(opacity * 255).toString(16) + themeColor.substr(1)
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
  log.info(`Stretchly: pausing breaks for ${milliseconds}`)
  updateTray()
}

function resumeBreaks (notify = true) {
  if (breakPlanner.dndManager.isOnDnd) {
    log.info('Stretchly: not resuming breaks because in DND')
  } else {
    breakPlanner.resume()
    log.info('Stretchly: resuming breaks')
    if (notify) {
      showNotification(i18next.t('main.resumingBreaks'))
    }
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
            const untilMorning = new UntilMorning(settings).msToSunrise()
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
    })
  }

  if (breakPlanner.scheduler.reference === 'finishMicrobreak' && settings.get('microbreakStrictMode')) {
  } else if (breakPlanner.scheduler.reference === 'finishBreak' && settings.get('breakStrictMode')) {
  } else {
    trayMenu.push({
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
  })

  if (global.shared.isContributor) {
    trayMenu.push({
      label: i18next.t('main.contributorPreferences'),
      click: function () {
        createContributorSettingsWindow()
      }
    }, {
      label: i18next.t('main.syncPreferences'),
      click: function () {
        createSyncPreferencesWindow()
      }
    })
  }

  trayMenu.push({
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

function runCommand (event, argv, workingDirectory) {
  const args = argv.slice(app.isPackaged ? 1 : 2)
  const cmd = new Command(args, app.getVersion())

  // if this command is already executed by the second-instance, return early
  if (!cmd.checkInMain()) {
    log.info('Stretchly: command executed in second-instance, dropped in main instance')
    return
  }

  switch (cmd.command) {
    case 'reset':
      log.info('Stretchly: reseting breaks (requested by second instance)')
      resetBreaks()
      break

    case 'mini':
      log.info('Stretchly: skip to Mini Break (requested by second instance)')
      if (cmd.options.title) nextIdea = [cmd.options.title]
      if (!cmd.options.noskip) skipToMicrobreak()
      break

    case 'long':
      log.info('Stretchly: skip to Long Break (requested by second instance)')
      nextIdea = [cmd.options.title ? cmd.options.title : null, cmd.options.text ? cmd.options.text : null]
      if (!cmd.options.noskip) skipToBreak()
      break

    case 'resume':
      log.info('Stretchly: resume Breaks (requested by second instance)')
      if (breakPlanner.isPaused) resumeBreaks(false)
      break

    case 'toggle':
      log.info('Stretchly: toggle Breaks (requested by second instance)')
      if (breakPlanner.isPaused) resumeBreaks(false)
      else pauseBreaks(1)
      break

    case 'pause':
      log.info('Stretchly: pause Breaks (requested by second instance)')
      var ms = cmd.durationToMs(settings)
      // -1 indicates an invalid value
      if (ms === -1) {
        log.error('Stretchly: error when parsing duration to ms because of unvalid value')
        return
      }
      pauseBreaks(ms)
      break

    default:
      log.error(`Stretchly: Command ${cmd.command} is not supported`)
  }
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
  const logsFile = log.transports.file.getFile().path
  event.sender.send('debugInfo', reference, timeleft,
    breaknumber, postponesnumber, settingsFile, logsFile, doNotDisturb)
})

ipcMain.on('open-preferences', function (event) {
  createPreferencesWindow()
})

ipcMain.on('set-contributor', function (event) {
  global.shared.isContributor = true
  if (preferencesWin) {
    preferencesWin.send('enableContributorPreferences')
  }
  updateTray()
})

ipcMain.on('open-contributor-preferences', function (event) {
  createContributorSettingsWindow()
})

ipcMain.on('open-contributor-auth', function (event, provider) {
  if (myStretchlyWindow) {
    myStretchlyWindow.show()
    return
  }
  const myStretchlyUrl = `https://my.stretchly.net/app/v1?provider=${provider}`
  myStretchlyWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1000,
    height: 700,
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
  if (myStretchlyWindow) {
    myStretchlyWindow.on('closed', () => {
      myStretchlyWindow = null
    })
  }
})

ipcMain.on('open-sync-preferences', function (event) {
  createSyncPreferencesWindow()
})

ipcMain.handle('current-settings', (event) => {
  return settings.data
})

ipcMain.handle('restore-remote-settings', (event, remoteSettings) => {
  settings.restoreRemote(remoteSettings)
  setTimeout(() => {
    app.relaunch()
    log.info('Stretchly: relaunching app')
    app.exit(0)
  }, 1000)
})
