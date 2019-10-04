// process.on('uncaughtException', (...args) => console.error(...args))
const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut } = require('electron')
const path = require('path')
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')

startI18next()

const AppSettings = require('./utils/settings')
const Utils = require('./utils/utils')
const defaultSettings = require('./utils/defaultSettings')
const IdeasLoader = require('./utils/ideasLoader')
const BreaksPlanner = require('./breaksPlanner')
const { UntilMorning } = require('./utils/untilMorning')

let microbreakIdeas
let breakIdeas
let breakPlanner
let appIcon = null
let processWin = null
let microbreakWins = null
let breakWins = null
let aboutWin = null
let settingsWin = null
let tutorialWin = null
let welcomeWin = null
let contributorSettingsWindow = null
let settings
let pausedForSuspendOrLock = false

app.setAppUserModelId('net.hovancik.stretchly')

global.shared = {
  isNewVersion: false
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  console.log('stretchly is already running.')
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
        updateToolTip()
        appIcon.setImage(trayIconPath())
        appIcon.setContextMenu(getTrayMenu())
      }
    })
}

i18next.on('languageChanged', function (lng) {
  if (appIcon) {
    updateToolTip()
    appIcon.setImage(trayIconPath())
    appIcon.setContextMenu(getTrayMenu())
  }
})

function onSuspendOrLock () {
  if (!breakPlanner.isPaused) {
    pausedForSuspendOrLock = true
    pauseBreaks(1)
  }
}

function onResumeOrUnlock () {
  if (pausedForSuspendOrLock) {
    pausedForSuspendOrLock = false
    resumeBreaks(false)
    updateToolTip()
    appIcon.setContextMenu(getTrayMenu())
    appIcon.setImage(trayIconPath())
  } else if (breakPlanner.isPaused) {
    // corrrect the planner for the time spent in suspend
    breakPlanner.correctScheduler()
  }
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

  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
  setInterval(updateToolTip, 10000)
}

function trayIconPath () {
  const pausedString = breakPlanner.isPaused ? 'Paused' : ''
  const iconFolder = `${__dirname}/images`
  if (settings.get('useMonochromeTrayIcon')) {
    if (process.platform === 'darwin') {
      return `${iconFolder}/trayMacMonochrome${pausedString}Template.png`
    } else {
      return `${iconFolder}/trayMonochrome${pausedString}.png`
    }
  } else {
    if (process.platform === 'darwin') {
      return `${iconFolder}/trayMac${pausedString}.png`
    } else {
      return `${iconFolder}/tray${pausedString}.png`
    }
  }
}

function startProcessWin () {
  const modalPath = `file://${__dirname}/process.html`
  processWin = new BrowserWindow({
    icon: `${__dirname}/images/windowIcon.png`,
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
      x: displaysX(),
      y: displaysY(),
      resizable: false,
      autoHideMenuBar: true,
      icon: `${__dirname}/images/windowIcon.png`,
      backgroundColor: settings.get('mainColor'),
      webPreferences: {
        nodeIntegration: true
      }
    })
    welcomeWin.loadURL(modalPath)
  }
  if (welcomeWin) {
    welcomeWin.on('closed', () => {
      welcomeWin = null
    })
  }
}

function createTutorialWindow () {
  const modalPath = `file://${__dirname}/tutorial.html`
  tutorialWin = new BrowserWindow({
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    autoHideMenuBar: true,
    icon: `${__dirname}/images/windowIcon.png`,
    backgroundColor: settings.get('mainColor'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  tutorialWin.loadURL(modalPath)
  if (tutorialWin) {
    tutorialWin.on('closed', () => {
      tutorialWin = null
    })
  }
}

function createContributorSettingsWindow () {
  const modalPath = `file://${__dirname}/contributor-settings.html`
  contributorSettingsWindow = new BrowserWindow({
    x: displaysX(),
    y: displaysY(),
    autoHideMenuBar: true,
    icon: `${__dirname}/images/windowIcon.png`,
    backgroundColor: settings.get('mainColor'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  contributorSettingsWindow.loadURL(modalPath)
  if (contributorSettingsWindow) {
    contributorSettingsWindow.on('closed', () => {
      contributorSettingsWindow = null
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
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
}

function startBreakNotification () {
  showNotification(i18next.t('main.breakIn', { seconds: settings.get('breakNotificationInterval') / 1000 }))
  breakPlanner.nextBreakAfterNotification()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
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
    globalShortcut.register('CommandOrControl+X', () => {
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

  if (settings.get('microbreakStartSoundPlaying')) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    const windowOptions = {
      autoHideMenuBar: true,
      icon: `${__dirname}/images/windowIcon.png`,
      resizable: false,
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'stretchly',
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
        breakDuration, strictMode, postponable, postponableDurationPercent)
      microbreakWinLocal.setAlwaysOnTop(true)
    })
    microbreakWinLocal.loadURL(modalPath)
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

  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
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
    globalShortcut.register('CommandOrControl+X', () => {
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

  if (settings.get('breakStartSoundPlaying')) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    const windowOptions = {
      autoHideMenuBar: true,
      icon: `${__dirname}/images/windowIcon.png`,
      resizable: false,
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'stretchly',
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
        breakDuration, strictMode, postponable, postponableDurationPercent)
      breakWinLocal.setAlwaysOnTop(true)
    })
    breakWinLocal.loadURL(modalPath)
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

  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
}

function breakComplete (shouldPlaySound, windows) {
  globalShortcut.unregister('CommandOrControl+X')
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('audio'))
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
  updateToolTip()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
}

function finishBreak (shouldPlaySound = true) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.nextBreak()
  updateToolTip()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
}

function postponeMicrobreak (shouldPlaySound = false) {
  microbreakWins = breakComplete(shouldPlaySound, microbreakWins)
  breakPlanner.postponeCurrentBreak()
  updateToolTip()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
}

function postponeBreak (shouldPlaySound = false) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.postponeCurrentBreak()
  // TODO look into how we can not call next 3 lines everywhere
  updateToolTip()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
}

function skipToMicrobreak () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.skipToMicrobreak()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
}

function skipToBreak () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.skipToBreak()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
}

function resetBreaks () {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.reset()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
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
    updateToolTip()
    appIcon.setContextMenu(getTrayMenu())
    appIcon.setImage(trayIconPath())
  })
  i18next.changeLanguage(settings.get('language'))
  createWelcomeWindow()
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
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  updateToolTip()
}

function resumeBreaks (notify = true) {
  breakPlanner.resume()
  appIcon.setContextMenu(getTrayMenu())
  appIcon.setImage(trayIconPath())
  if (notify) {
    showNotification(i18next.t('main.resumingBreaks'))
  }
  updateToolTip()
}

function showAboutWindow () {
  if (aboutWin) {
    aboutWin.show()
    return
  }
  const modalPath = `file://${__dirname}/about.html`
  aboutWin = new BrowserWindow({
    autoHideMenuBar: true,
    icon: `${__dirname}/images/windowIcon.png`,
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: i18next.t('main.aboutStretchly', { version: app.getVersion() }),
    webPreferences: {
      nodeIntegration: true
    }
  })
  aboutWin.loadURL(modalPath)
  aboutWin.on('closed', () => {
    aboutWin = null
  })
}

function showSettingsWindow () {
  if (settingsWin) {
    settingsWin.show()
    return
  }
  const modalPath = `file://${__dirname}/settings.html`
  settingsWin = new BrowserWindow({
    autoHideMenuBar: true,
    icon: `${__dirname}/images/windowIcon.png`,
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: i18next.t('main.settings'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  settingsWin.loadURL(modalPath)
  // settingsWin.webContents.openDevTools()
  settingsWin.on('closed', () => {
    settingsWin = null
  })
}

function saveDefaultsFor (array, next) {
  for (const index in array) {
    settings.set(array[index], defaultSettings[array[index]])
  }
}

function getTrayMenu () {
  const trayMenu = []
  const timeLeft = breakPlanner.scheduler.timeLeft
  const isPaused = breakPlanner.isPaused
  const reference = typeOfBreak()
  const nextBreak = Utils.formatTimeOfNextBreak(timeLeft)
  const doNotDisturb = breakPlanner.dndManager.isOnDnd

  if (global.shared.isNewVersion) {
    trayMenu.push({
      label: i18next.t('main.downloadLatestVersion'),
      click: function () {
        shell.openExternal('https://hovancik.net/stretchly/downloads')
      }
    })
  }

  if (timeLeft) {
    if (isPaused) {
      trayMenu.push({
        label: i18next.t('main.resumingAt', { hours: nextBreak[0], minutes: nextBreak[1] })
      })
    } else {
      trayMenu.push({
        label: i18next.t('main.breakAt', { hours: nextBreak[0], minutes: nextBreak[1], reference: i18next.t(`main.${reference.breakType}Reference`) })
      })
    }
  }

  if (doNotDisturb) {
    trayMenu.push({
      label: i18next.t('main.notificationStateMode')
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.about'),
    click: function () {
      showAboutWindow()
    }
  }, {
    label: i18next.t('main.becomePatron'),
    click: function () {
      shell.openExternal('https://www.patreon.com/hovancik')
    }
  }, {
    type: 'separator'
  })

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
        appIcon.setContextMenu(getTrayMenu())
        appIcon.setImage(trayIconPath())
        updateToolTip()
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
    label: i18next.t('main.settings'),
    click: function () {
      showSettingsWindow()
    }
  })

  if (process.platform === 'darwin' || process.platform === 'win32') {
    const loginItemSettings = app.getLoginItemSettings()
    const openAtLogin = loginItemSettings.openAtLogin
    trayMenu.push({
      label: i18next.t('main.startAtLogin'),
      type: 'checkbox',
      checked: openAtLogin,
      click: function () {
        app.setLoginItemSettings({ openAtLogin: !openAtLogin })
      }
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.yourStretchly'),
    click: function () {
      const myStretchlyUrl = 'https://my.stretchly.net'
      const myStretchlyWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 800,
        height: 600,
        icon: `${__dirname}/images/windowIcon.png`,
        x: displaysX(),
        y: displaysY(),
        resizable: false,
        backgroundColor: settings.get('mainColor'),
        webPreferences: {
          preload: path.resolve(__dirname, './electron-bridge.js'),
          nodeIntegration: false
        }
      })
      myStretchlyWindow.loadURL(myStretchlyUrl)
      // myStretchlyWindow.webContents.openDevTools()
      // myStretchlyWindow.webContents.session.clearCache(()=> {})
    }
  }, {
    type: 'separator'
  }, {
    label: i18next.t('main.quitStretchly'),
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}

function updateToolTip () {
  // TODO this needs to be refactored, was moved here to be able to use i18next
  const toolTipHeader = i18next.t('main.toolTipHeader')
  if (microbreakWins || breakWins) {
    appIcon.setToolTip(toolTipHeader)
    return
  }
  const doNotDisturb = breakPlanner.dndManager.isOnDnd

  let statusMessage = ''
  if (breakPlanner && breakPlanner.scheduler && breakPlanner.isPaused) {
    const timeLeft = breakPlanner.scheduler.timeLeft
    if (timeLeft) {
      statusMessage += i18next.t('main.pausedUntil', { timeLeft: Utils.formatPauseTimeLeft(timeLeft) })
    } else {
      statusMessage += i18next.t('main.pausedIndefinitely')
    }
  }

  if (breakPlanner && breakPlanner.scheduler && !breakPlanner.isPaused) {
    const breakType = typeOfBreak().breakType
    const breakNotification = typeOfBreak().breakNotification
    const notificationTime = breakNotification ? settings.get(`${breakType}NotificationInterval`) : 0
    if (breakType) {
      statusMessage += i18next.t('main.timeToNext', { timeLeft: Utils.formatTillBreak(breakPlanner.scheduler.timeLeft + notificationTime), breakType: i18next.t(`main.${breakType}`) })
      if (breakType === 'microbreak') {
        const breakInterval = settings.get('breakInterval') + 1
        const breakNumber = breakPlanner.breakNumber % breakInterval
        statusMessage += i18next.t('main.nextBreakFollowing', { count: breakInterval - breakNumber })
      }
    }
  }

  if (doNotDisturb) {
    statusMessage = i18next.t('main.notificationStatus')
  }

  appIcon.setToolTip(toolTipHeader + statusMessage)
}

function typeOfBreak () {
  let breakType = ''
  let breakNotification = false
  switch (breakPlanner.scheduler.reference) {
    case 'startMicrobreak': {
      breakType = 'microbreak'
      break
    }
    case 'startBreak': {
      breakType = 'break'
      break
    }
    case 'startMicrobreakNotification': {
      breakType = 'microbreak'
      breakNotification = true
      break
    }
    case 'startBreakNotification': {
      breakType = 'break'
      breakNotification = true
      break
    }
    default : {
      breakType = null
      breakNotification = null
      break
    }
  }
  return { breakType, breakNotification }
}

function showNotification (text) {
  processWin.webContents.send('showNotification', {
    text: text,
    silent: settings.get('silentNotifications')
  })
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
  settings.set(key, value)
  event.sender.send('renderSettings', settings.data)
  appIcon.setImage(trayIconPath())
  appIcon.setContextMenu(getTrayMenu())
})

ipcMain.on('update-tray', function (event) {
  updateToolTip()
  appIcon.setImage(trayIconPath())
  appIcon.setContextMenu(getTrayMenu())
})

ipcMain.on('set-default-settings', function (event, data) {
  const options = {
    type: 'info',
    title: i18next.t('main.resetToDefaults'),
    message: i18next.t('main.areYouSure'),
    buttons: [i18next.t('main.yes'), i18next.t('main.no')]
  }
  dialog.showMessageBox(options, function (index) {
    if (index === 0) {
      saveDefaultsFor(data)
      appIcon.setImage(trayIconPath())
      appIcon.setContextMenu(getTrayMenu())
      if (settingsWin) {
        settingsWin.webContents.send('renderSettings', settings.data)
      }
    }
  })
})

ipcMain.on('send-settings', function (event) {
  event.sender.send('renderSettings', settings.data)
})

ipcMain.on('show-debug', function (event) {
  const reference = breakPlanner.scheduler.reference
  const timeleft = Utils.formatRemaining(breakPlanner.scheduler.timeLeft / 1000.0)
  const breaknumber = breakPlanner.breakNumber
  const postponesnumber = breakPlanner.postponesNumber
  const doNotDisturb = breakPlanner.dndManager.doNotDisturb
  const dir = app.getPath('userData')
  const settingsFile = path.join(dir, 'config.json')
  aboutWin.webContents.send('debugInfo', reference, timeleft,
    breaknumber, postponesnumber, settingsFile, doNotDisturb)
})

ipcMain.on('change-language', function (event, language) {
  i18next.changeLanguage(language)
  event.sender.send('renderSettings', settings.data)
})

ipcMain.on('open-tutorial', function (event) {
  createTutorialWindow()
})

ipcMain.on('open-contributor-settings', function (event) {
  createContributorSettingsWindow()
})
