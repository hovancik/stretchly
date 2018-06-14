// process.on('uncaughtException', (...args) => console.error(...args))
const {app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut} = require('electron')
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')

startI18next()

const AppSettings = require('./utils/settings')
const Utils = require('./utils/utils')
const defaultSettings = require('./utils/defaultSettings')
const IdeasLoader = require('./utils/ideasLoader')
const BreaksPlanner = require('./breaksPlanner')

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
let settings
let isOnIndefinitePause

app.setAppUserModelId('net.hovancik.stretchly')

global.shared = {
  isNewVersion: false
}

let shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
  if (appIcon) {
    // Someone tried to run a second instance
  }
})

if (shouldQuit) {
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
      debug: true,
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
        appIcon.setContextMenu(getTrayMenu())
      }
    })
}

i18next.on('languageChanged', function (lng) {
  if (appIcon) {
    updateToolTip()
    appIcon.setContextMenu(getTrayMenu())
  }
})

function startPowerMonitoring () {
  const electron = require('electron')
  electron.powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep')
    if (!isOnIndefinitePause) pauseBreaks(1)
  })
  electron.powerMonitor.on('resume', () => {
    console.log('The system is resuming')
    if (!isOnIndefinitePause) resumeBreaks()
  })
}

function numberOfDisplays () {
  const electron = require('electron')
  return electron.screen.getAllDisplays().length
}

function closeWindows (windowArray) {
  for (let i = windowArray.length - 1; i >= 0; i--) {
    windowArray[i].close()
  }
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
    let screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  let bounds = theScreen.bounds
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
    let screens = electron.screen.getAllDisplays()
    theScreen = screens[displayID]
  }
  let bounds = theScreen.bounds
  return Math.ceil(bounds.y + ((bounds.height - height) / 2))
}

function createTrayIcon () {
  const iconFolder = `${__dirname}/images`
  if (process.platform === 'darwin') {
    appIcon = new Tray(iconFolder + '/trayTemplate.png')
    app.dock.hide()
  } else {
    appIcon = new Tray(iconFolder + '/stretchly_18x18.png')
  }
  appIcon.setContextMenu(getTrayMenu())
  updateToolTip()
  setInterval(updateToolTip, 10000)
}

function startProcessWin () {
  const modalPath = `file://${__dirname}/process.html`
  processWin = new BrowserWindow({
    icon: `${__dirname}/images/stretchly_18x18.png`,
    show: false
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
      autoHideMenuBar: true,
      icon: `${__dirname}/images/stretchly_18x18.png`,
      backgroundColor: settings.get('mainColor')
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
    autoHideMenuBar: true,
    icon: `${__dirname}/images/stretchly_18x18.png`,
    backgroundColor: settings.get('mainColor')
  })
  tutorialWin.loadURL(modalPath)
  if (tutorialWin) {
    tutorialWin.on('closed', () => {
      tutorialWin = null
    })
  }
}

function planVersionCheck (seconds = 1) {
  setTimeout(checkVersion, seconds * 1000)
}

function checkVersion () {
  processWin.webContents.send('checkVersion', `v${app.getVersion()}`, settings.get('notifyNewVersion'))
  planVersionCheck(3600 * 5)
}

function startMicrobreakNotification () {
  processWin.webContents.send('showNotification', i18next.t('main.microbreakIn', {seconds: settings.get('microbreakNotificationInterval') / 1000}))
  breakPlanner.nextBreakAfterNotification('startMicrobreak')
}

function startBreakNotification () {
  processWin.webContents.send('showNotification', i18next.t('main.breakIn', {seconds: settings.get('breakNotificationInterval') / 1000}))
  breakPlanner.nextBreakAfterNotification('startBreak')
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
  if (!settings.get('microbreakStrictMode')) {
    globalShortcut.register('CommandOrControl+X', () => {
      finishMicrobreak(false)
    })
  }
  const modalPath = `file://${__dirname}/microbreak.html`
  microbreakWins = []

  let idea = null
  if (settings.get('ideas')) {
    idea = microbreakIdeas.randomElement
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    let microbreakWinLocal = new BrowserWindow({
      icon: `${__dirname}/images/stretchly_18x18.png`,
      x: displaysX(displayIdx),
      y: displaysY(displayIdx),
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'stretchly'
    })
    // microbreakWinLocal.webContents.openDevTools()
    microbreakWinLocal.once('ready-to-show', () => {
      microbreakWinLocal.show()
      microbreakWinLocal.setFullScreen(settings.get('fullscreen'))
      if (displayIdx === 0) {
        breakPlanner.emit('microbreakStarted', true)
      }
      microbreakWinLocal.webContents.send('microbreakIdea', idea, settings.get('microbreakStrictMode'))
      microbreakWinLocal.webContents.send('progress', Date.now(), settings.get('microbreakDuration'))
      microbreakWinLocal.setAlwaysOnTop(true)
    })
    microbreakWinLocal.loadURL(modalPath)
    microbreakWins.push(microbreakWinLocal)

    if (!settings.get('allScreens')) {
      break
    }
  }

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
  if (!settings.get('breakStrictMode')) {
    globalShortcut.register('CommandOrControl+X', () => {
      finishBreak(false)
    })
  }
  const modalPath = `file://${__dirname}/break.html`
  breakWins = []

  let idea = null
  if (settings.get('ideas')) {
    idea = breakIdeas.randomElement
  }

  for (let displayIdx = 0; displayIdx < numberOfDisplays(); displayIdx++) {
    let breakWinLocal = new BrowserWindow({
      icon: `${__dirname}/images/stretchly_18x18.png`,
      x: displaysX(displayIdx),
      y: displaysY(displayIdx),
      frame: false,
      show: false,
      backgroundColor: settings.get('mainColor'),
      skipTaskbar: true,
      focusable: false,
      title: 'stretchly'
    })
    // breakWinLocal.webContents.openDevTools()
    breakWinLocal.once('ready-to-show', () => {
      breakWinLocal.show()
      breakWinLocal.setFullScreen(settings.get('fullscreen'))
      if (displayIdx === 0) {
        breakPlanner.emit('breakStarted', true)
      }
      breakWinLocal.webContents.send('breakIdea', idea, settings.get('breakStrictMode'))
      breakWinLocal.webContents.send('progress', Date.now(), settings.get('breakDuration'))
      breakWinLocal.setAlwaysOnTop(true)
    })
    breakWinLocal.loadURL(modalPath)
    breakWins.push(breakWinLocal)

    if (!settings.get('allScreens')) {
      break
    }
  }

  updateToolTip()
}

function finishMicrobreak (shouldPlaySound = true) {
  globalShortcut.unregister('CommandOrControl+X')
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }
  if (microbreakWins) {
    if (process.platform === 'darwin') {
      // get focus on the last app
      Menu.sendActionToFirstResponder('hide:')
    }
    closeWindows(microbreakWins)
    microbreakWins = null
    breakPlanner.nextBreak()
  }
  updateToolTip()
}

function finishBreak (shouldPlaySound = true) {
  globalShortcut.unregister('CommandOrControl+X')
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }
  if (breakWins) {
    if (process.platform === 'darwin') {
      // get focus on the last app
      Menu.sendActionToFirstResponder('hide:')
    }
    closeWindows(breakWins)
    breakWins = null
    breakPlanner.nextBreak()
  }
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

function pauseBreaks (milliseconds, keepAfterPowerResume = false) {
  isOnIndefinitePause = keepAfterPowerResume
  if (microbreakWins) {
    finishMicrobreak(false)
  }
  if (breakWins) {
    finishBreak(false)
  }
  breakPlanner.pause(milliseconds)
  appIcon.setContextMenu(getTrayMenu())
  updateToolTip()
}

function resumeBreaks () {
  isOnIndefinitePause = false
  breakPlanner.resume()
  appIcon.setContextMenu(getTrayMenu())
  processWin.webContents.send('showNotification', i18next.t('main.resumingBreaks'))
  updateToolTip()
}

function showAboutWindow () {
  if (aboutWin) {
    aboutWin.show()
    return
  }
  const modalPath = `file://${__dirname}/about.html`
  aboutWin = new BrowserWindow({
    icon: `${__dirname}/images/stretchly_18x18.png`,
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: i18next.t('main.aboutStretchly', {version: app.getVersion()})
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
    icon: `${__dirname}/images/stretchly_18x18.png`,
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: i18next.t('main.settings')
  })
  settingsWin.loadURL(modalPath)
  // settingsWin.webContents.openDevTools()
  settingsWin.on('closed', () => {
    settingsWin = null
  })
}

function saveDefaultsFor (array, next) {
  for (let index in array) {
    settings.set(array[index], defaultSettings[array[index]])
  }
}

function getTrayMenu () {
  let trayMenu = []
  if (global.shared.isNewVersion) {
    trayMenu.push({
      label: i18next.t('main.downloadLatestVersion'),
      click: function () {
        shell.openExternal('https://github.com/hovancik/stretchly/releases')
      }
    })
  }

  trayMenu.push({
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

  if (!breakPlanner.isPaused) {
    let submenu = []
    if (settings.get('microbreak')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toMicrobreak'),
        click: function () {
          if (microbreakWins) {
            closeWindows(microbreakWins)
            microbreakWins = null
          }
          if (breakWins) {
            closeWindows(breakWins)
            breakWins = null
          }
          breakPlanner.skipToMicrobreak()
          updateToolTip()
        }
      }])
    }
    if (settings.get('break')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toBreak'),
        click: function () {
          if (microbreakWins) {
            closeWindows(microbreakWins)
            microbreakWins = null
          }
          if (breakWins) {
            closeWindows(breakWins)
            breakWins = null
          }
          breakPlanner.skipToBreak()
          updateToolTip()
        }
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
        resumeBreaks()
        updateToolTip()
      }
    })
  } else {
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
          label: i18next.t('main.indefinitely'),
          click: function () {
            pauseBreaks(1, true)
          }
        }
      ]
    }, {
      label: i18next.t('main.resetBreaks'),
      click: function () {
        if (microbreakWins) {
          closeWindows(microbreakWins)
          microbreakWins = null
        }
        if (breakWins) {
          closeWindows(breakWins)
          breakWins = null
        }
        breakPlanner.reset()
        updateToolTip()
      }
    })
  }

  trayMenu.push({
    label: i18next.t('main.settings'),
    click: function () {
      showSettingsWindow()
    }
  })

  if (process.platform === 'darwin' || process.platform === 'win32') {
    let loginItemSettings = app.getLoginItemSettings()
    let openAtLogin = loginItemSettings.openAtLogin
    trayMenu.push({
      label: i18next.t('main.startAtLogin'),
      type: 'checkbox',
      checked: openAtLogin,
      click: function () {
        app.setLoginItemSettings({openAtLogin: !openAtLogin})
      }
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.yourStretchly'),
    click: function () {
      let color = settings.get('mainColor').replace('#', '')
      shell.openExternal(`https://my.stretchly.net/?bg=${color}`)
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
  let toolTipHeader = i18next.t('main.toolTipHeader')
  if (microbreakWins || breakWins) {
    appIcon.setToolTip(toolTipHeader)
  } else {
    let statusMessage = ''
    if (breakPlanner && breakPlanner.scheduler) {
      if (breakPlanner.isPaused) {
        let timeLeft = breakPlanner.scheduler.timeLeft
        if (timeLeft) {
          statusMessage += i18next.t('main.pausedUntil', {'timeLeft': Utils.formatPauseTimeLeft(timeLeft)})
        } else {
          statusMessage += i18next.t('main.pausedIndefinitely')
        }
      } else {
        let breakType
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
          default: {
            breakType = null
            break
          }
        }
        if (breakType) {
          let notificationTime
          if (breakNotification) {
            notificationTime = settings.get('breakNotificationInterval')
          } else {
            notificationTime = 0
          }
          statusMessage += i18next.t('main.timeToNext', {'timeLeft': Utils.formatTillBreak(breakPlanner.scheduler.timeLeft + notificationTime), 'breakType': i18next.t(`main.${breakType}`)})
          if (breakType === 'microbreak') {
            let breakInterval = settings.get('breakInterval') + 1
            let breakNumber = breakPlanner.breakNumber % breakInterval
            statusMessage += i18next.t('main.nextBreakFollowing', {'count': breakInterval - breakNumber})
          }
        }
      }
    }
    appIcon.setToolTip(toolTipHeader + statusMessage)
  }
}

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
  settings.set(key, value)
  event.sender.send('renderSettings', settings.data)
  appIcon.setContextMenu(getTrayMenu())
})

ipcMain.on('update-tray', function (event) {
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
      settingsWin.webContents.send('renderSettings', settings.data)
    }
  })
})

ipcMain.on('send-settings', function (event) {
  event.sender.send('renderSettings', settings.data)
})

ipcMain.on('show-debug', function (event) {
  let reference = breakPlanner.scheduler.reference
  let timeleft = Utils.formatRemaining(breakPlanner.scheduler.timeLeft / 1000.0)
  const dir = app.getPath('userData')
  const settingsFile = `${dir}/config.json`
  aboutWin.webContents.send('debugInfo', reference, timeleft, settingsFile)
})

ipcMain.on('change-language', function (event, language) {
  i18next.changeLanguage(language)
  event.sender.send('renderSettings', settings.data)
})

ipcMain.on('open-tutorial', function (event) {
  createTutorialWindow()
})
