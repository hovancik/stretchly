// process.on('uncaughtException', (...args) => console.error(...args))
const {app, BrowserWindow, Tray, Menu, ipcMain} = require('electron')
const path = require('path')
const AppSettings = require('./utils/settings')
let microbreakIdeas = require('./microbreakIdeas')

let appIcon = null
let processWin = null
let microbreakWin = null
let appStartupWin = null
let aboutWin = null
let settingsWin = null
let finishMicrobreakTimer
let startMicrobreakTimer
let planMicrobreakTimer
let resumeMicrobreaksTimer
let settings

function createTrayIcon () {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  const iconPath = path.join(__dirname, 'images/stretchly_18x18.png')
  appIcon = new Tray(iconPath)
  appIcon.setToolTip('stretchly - break time reminder app')
  appIcon.setContextMenu(getTrayMenu(false))
}

function startProcessWin () {
  const modalPath = path.join('file://', __dirname, 'process.html')
  processWin = new BrowserWindow({
    show: false
  })
  processWin.loadURL(modalPath)
}

function showStartUpWindow () {
  const modalPath = path.join('file://', __dirname, 'start.html')
  appStartupWin = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    title: 'stretchly',
    backgroundColor: settings.get('mainColor'),
    width: 600,
    height: 170
  })
  appStartupWin.loadURL(modalPath)
  setTimeout(function () {
    appStartupWin.close()
  }, 5000)
}

function startMicrobreak () {
  const modalPath = path.join('file://', __dirname, 'microbreak.html')
  microbreakWin = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    backgroundColor: settings.get('mainColor'),
    title: 'stretchly'
  })
  microbreakWin.on('close', function () { microbreakWin = null })
  microbreakWin.loadURL(modalPath)
  // microbreakWin.webContents.openDevTools()
  microbreakWin.webContents.on('did-finish-load', () => {
    microbreakWin.webContents.send('breakIdea', microbreakIdeas.randomElement)
  })
  finishMicrobreakTimer = setTimeout(finishMicrobreak, settings.get('microbreakDuration'))
}

function finishMicrobreak (shouldPlaySound = true) {
  if (shouldPlaySound) {
    processWin.webContents.send('playSound', settings.get('microbreakAudio'))
  }
  microbreakWin.close()
  microbreakWin = null
  planMicrobreakTimer = setTimeout(planMicrobreak, 100)
}

function planMicrobreak () {
  startMicrobreakTimer = setTimeout(startMicrobreak, settings.get('microbreakInterval'))
}

ipcMain.on('finish-microbreak', function (event, shouldPlaySound) {
  clearTimeout(finishMicrobreakTimer)
  finishMicrobreak(shouldPlaySound)
})

ipcMain.on('save-setting', function (event, key, value) {
  settings.set(key, value)
  settingsWin.webContents.send('renderSettings', settings.data)
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

app.on('ready', startProcessWin)
app.on('ready', loadSettings)
app.on('ready', createTrayIcon)
app.on('ready', planMicrobreak)
app.on('ready', showStartUpWindow)

app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})

function loadSettings () {
  const dir = app.getPath('userData')
  const settingsFile = `${dir}/config.json`
  settings = new AppSettings(settingsFile)
}

function pauseMicrobreaks (seconds) {
  if (microbreakWin) {
    clearTimeout(finishMicrobreakTimer)
    finishMicrobreak()
  }
  clearTimeout(planMicrobreakTimer)
  clearTimeout(startMicrobreakTimer)
  if (seconds !== 1) {
    resumeMicrobreaksTimer = setTimeout(resumeMicrobreaks, seconds)
  }
  appIcon.setContextMenu(getTrayMenu(true))
}

function resumeMicrobreaks () {
  clearTimeout(resumeMicrobreaksTimer)
  appIcon.setContextMenu(getTrayMenu(false))
  planMicrobreak()
}

function showAboutWindow () {
  const modalPath = path.join('file://', __dirname, 'about.html')
  aboutWin = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: settings.get('mainColor'),
    title: 'About stretchly'
  })
  aboutWin.loadURL(modalPath)
}

function showSettingsWindow () {
  const modalPath = path.join('file://', __dirname, 'settings.html')
  settingsWin = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: settings.get('mainColor'),
    title: 'Settings'
  })
  settingsWin.loadURL(modalPath)
  settingsWin.webContents.on('did-finish-load', () => {
    settingsWin.webContents.send('renderSettings', settings.data)
  })
}

function getTrayMenu (MicrobreaksPaused) {
  let trayMenu = []

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
  })

  if (MicrobreaksPaused) {
    trayMenu.push({
      label: 'Resume',
      click: function () {
        resumeMicrobreaks()
      }
    })
  } else {
    trayMenu.push({
      label: 'Pause',
      submenu: [
        {
          label: 'for an hour',
          click: function () {
            pauseMicrobreaks(3600 * 1000)
          }
        }, {
          label: 'for 2 hours',
          click: function () {
            pauseMicrobreaks(3600 * 2 * 1000)
          }
        }, {
          label: 'for 5 hours',
          click: function () {
            pauseMicrobreaks(3600 * 5 * 1000)
          }
        }, {
          label: 'indefinitely',
          click: function () {
            pauseMicrobreaks(1)
          }
        }
      ]
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: 'About',
    click: function () {
      showAboutWindow()
    }
  }, {
    label: 'Settings',
    click: function () {
      showSettingsWindow()
    }
  }, {
    label: 'Quit',
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}
