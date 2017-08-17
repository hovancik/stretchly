// process.on('uncaughtException', (...args) => console.error(...args))
const {app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut} = require('electron')
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
let microbreakWin = null
let breakWin = null
let aboutWin = null
let settingsWin = null
let settings
let toolTipHeader = 'stretchly - break time reminder app'

global.shared = {
  isNewVersion: false
}

app.on('ready', startProcessWin)
app.on('ready', loadSettings)
app.on('ready', createTrayIcon)
app.on('ready', startPowerMonitoring)

app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})

let shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
  if (appIcon) {
    // Someone tried to run a second instance
  }
})

if (shouldQuit) {
  console.log('stretchly is already running.')
  app.quit()
}

function startPowerMonitoring () {
  const electron = require('electron')
  electron.powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep')
    pauseBreaks(1)
  })
  electron.powerMonitor.on('resume', () => {
    console.log('The system is resuming')
    resumeBreaks()
  })
}

function displaysX (width = 800) {
  const electron = require('electron')
  let theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  let bounds = theScreen.bounds
  return bounds.x + ((bounds.width - width) / 2)
}

function displaysY (height = 600) {
  const electron = require('electron')
  let theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
  let bounds = theScreen.bounds
  return bounds.y + ((bounds.height - height) / 2)
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
    show: false
  })
  processWin.loadURL(modalPath)
  processWin.once('ready-to-show', () => {
    planVersionCheck()
  })
}

function planVersionCheck (seconds = 1) {
  setTimeout(checkVersion, seconds * 1000)
}

function checkVersion () {
  processWin.webContents.send('checkVersion', `v${app.getVersion()}`)
  planVersionCheck(3600 * 5)
}

function startMicrobreak () {
  if (!microbreakIdeas) {
    loadIdeas()
  }
  // don't start another break if break running
  if (microbreakWin) {
    console.log('microbreak already running')
    return
  }
  if (!settings.get('microbreakStrictMode')) {
    globalShortcut.register('CommandOrControl+X', () => {
      finishMicrobreak(false)
    })
  }
  const modalPath = `file://${__dirname}/microbreak.html`
  microbreakWin = new BrowserWindow({
    x: displaysX(),
    y: displaysY(),
    frame: false,
    show: false,
    fullscreen: settings.get('fullscreen'),
    backgroundColor: settings.get('mainColor'),
    skipTaskbar: true,
    focusable: false,
    title: 'stretchly'
  })
  microbreakWin.loadURL(modalPath)
  // microbreakWin.webContents.openDevTools()
  microbreakWin.once('ready-to-show', () => {
    microbreakWin.show()
    breakPlanner.emit('microbreakStarted', true)
    microbreakWin.webContents.send('microbreakIdea', microbreakIdeas.randomElement, settings.get('microbreakStrictMode'))
    microbreakWin.webContents.send('progress', Date.now(), settings.get('microbreakDuration'))
    microbreakWin.setAlwaysOnTop(true)
  })
  updateToolTip()
}

function startBreak () {
  if (!breakIdeas) {
    loadIdeas()
  }
  // don't start another break if break running
  if (breakWin) {
    console.log('break already running')
    return
  }
  if (!settings.get('breakStrictMode')) {
    globalShortcut.register('CommandOrControl+X', () => {
      finishBreak(false)
    })
  }
  const modalPath = `file://${__dirname}/break.html`
  breakWin = new BrowserWindow({
    x: displaysX(),
    y: displaysY(),
    frame: false,
    show: false,
    fullscreen: settings.get('fullscreen'),
    backgroundColor: settings.get('mainColor'),
    skipTaskbar: true,
    focusable: false,
    title: 'stretchly'
  })
  breakWin.loadURL(modalPath)
  // breakWin.webContents.openDevTools()
  breakWin.once('ready-to-show', () => {
    breakWin.show()
    breakPlanner.emit('breakStarted', true)
    breakWin.webContents.send('breakIdea', breakIdeas.randomElement, settings.get('breakStrictMode'))
    breakWin.webContents.send('progress', Date.now(), settings.get('breakDuration'))
    breakWin.setAlwaysOnTop(true)
  })
  updateToolTip()
}

function finishMicrobreak (shouldPlaySound = true) {
  globalShortcut.unregister('CommandOrControl+X')
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }
  if (microbreakWin) {
    if (process.platform === 'darwin') {
      // get focus on the last app
      Menu.sendActionToFirstResponder('hide:')
    }
    microbreakWin.close()
    microbreakWin = null
    breakPlanner.nextBreak()
  }
  updateToolTip()
}

function finishBreak (shouldPlaySound = true) {
  globalShortcut.unregister('CommandOrControl+X')
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('audio'))
  }
  if (breakWin) {
    if (process.platform === 'darwin') {
      // get focus on the last app
      Menu.sendActionToFirstResponder('hide:')
    }
    breakWin.close()
    breakWin = null
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
  breakPlanner.on('startMicrobreak', () => { startMicrobreak() })
  breakPlanner.on('finishMicrobreak', (shouldPlaySound) => { finishMicrobreak(shouldPlaySound) })
  breakPlanner.on('startBreak', () => { startBreak() })
  breakPlanner.on('finishBreak', (shouldPlaySound) => { finishBreak(shouldPlaySound) })
  breakPlanner.on('resumeBreaks', () => { resumeBreaks() })
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
  if (microbreakWin) {
    finishMicrobreak(false)
  }
  if (breakWin) {
    finishBreak(false)
  }
  breakPlanner.pause(milliseconds)
  appIcon.setContextMenu(getTrayMenu())
  updateToolTip()
}

function resumeBreaks () {
  breakPlanner.resume()
  appIcon.setContextMenu(getTrayMenu())
  processWin.webContents.send('showNotification', 'Resuming breaks')
  updateToolTip()
}

function showAboutWindow () {
  if (aboutWin) {
    aboutWin.show()
    return
  }
  const modalPath = `file://${__dirname}/about.html`
  aboutWin = new BrowserWindow({
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: `About stretchly v${app.getVersion()}`
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
    x: displaysX(),
    y: displaysY(),
    resizable: false,
    backgroundColor: settings.get('mainColor'),
    title: 'Settings'
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
      label: 'Download latest version',
      click: function () {
        shell.openExternal('https://github.com/hovancik/stretchly/releases')
      }
    })
  }

  trayMenu.push({
    label: 'About',
    click: function () {
      showAboutWindow()
    }
  }, {
    type: 'separator'
  })

  if (!breakPlanner.isPaused) {
    let submenu = []
    if (settings.get('microbreak')) {
      submenu = submenu.concat([{
        label: 'microbreak',
        click: function () {
          breakPlanner.skipToMicrobreak()
          updateToolTip()
        }
      }])
    }
    if (settings.get('break')) {
      submenu = submenu.concat([{
        label: 'break',
        click: function () {
          breakPlanner.skipToBreak()
          updateToolTip()
        }
      }])
    }
    if (settings.get('break') || settings.get('microbreak')) {
      trayMenu.push({
        label: 'Skip to the next',
        submenu: submenu
      })
    }
  }

  if (breakPlanner.isPaused) {
    trayMenu.push({
      label: 'Resume',
      click: function () {
        resumeBreaks()
        updateToolTip()
      }
    })
  } else {
    trayMenu.push({
      label: 'Pause',
      submenu: [
        {
          label: 'for an hour',
          click: function () {
            pauseBreaks(3600 * 1000)
          }
        }, {
          label: 'for 2 hours',
          click: function () {
            pauseBreaks(3600 * 2 * 1000)
          }
        }, {
          label: 'for 5 hours',
          click: function () {
            pauseBreaks(3600 * 5 * 1000)
          }
        }, {
          label: 'indefinitely',
          click: function () {
            pauseBreaks(1)
          }
        }
      ]
    }, {
      label: 'Reset breaks',
      click: function () {
        if (microbreakWin) {
          microbreakWin.close()
          microbreakWin = null
        }
        if (breakWin) {
          breakWin.close()
          breakWin = null
        }
        breakPlanner.reset()
        updateToolTip()
      }
    })
  }

  trayMenu.push({
    label: 'Settings',
    click: function () {
      showSettingsWindow()
    }
  })

  if (process.platform === 'darwin' || process.platform === 'win32') {
    let loginItemSettings = app.getLoginItemSettings()
    let openAtLogin = loginItemSettings.openAtLogin
    trayMenu.push({
      label: 'Start at login',
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
    label: 'Your stretchly',
    click: function () {
      let color = settings.get('mainColor').replace('#', '')
      shell.openExternal(`https://my.stretchly.net/?bg=${color}`)
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit stretchly',
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}

function updateToolTip () {
  if (microbreakWin || breakWin) {
    appIcon.setToolTip(toolTipHeader)
  } else {
    appIcon.setToolTip(toolTipHeader + breakPlanner.status)
  }
}

ipcMain.on('finish-microbreak', function (event, shouldPlaySound) {
  finishMicrobreak(shouldPlaySound)
})

ipcMain.on('finish-break', function (event, shouldPlaySound) {
  finishBreak(shouldPlaySound)
})

ipcMain.on('save-setting', function (event, key, value) {
  settings.set(key, value)
  settingsWin.webContents.send('renderSettings', settings.data)
  appIcon.setContextMenu(getTrayMenu())
})

ipcMain.on('update-tray', function (event) {
  appIcon.setContextMenu(getTrayMenu())
})

ipcMain.on('set-default-settings', function (event, data) {
  const options = {
    type: 'info',
    title: 'Reset to defaults',
    message: 'Are you sure you wanna reset setings on this window to defaults?',
    buttons: ['Yes', 'No']
  }
  dialog.showMessageBox(options, function (index) {
    if (index === 0) {
      saveDefaultsFor(data)
      settingsWin.webContents.send('renderSettings', settings.data)
    }
  })
})

ipcMain.on('send-settings', function (event) {
  settingsWin.webContents.send('renderSettings', settings.data)
})

ipcMain.on('show-debug', function (event) {
  let reference = breakPlanner.scheduler.reference
  let timeleft = Utils.formatRemaining(breakPlanner.scheduler.timeLeft / 1000.0)
  const dir = app.getPath('userData')
  const settingsFile = `${dir}/config.json`
  aboutWin.webContents.send('debugInfo', reference, timeleft, settingsFile)
})
