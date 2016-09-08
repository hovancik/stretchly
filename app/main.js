// process.on('uncaughtException', (...args) => console.error(...args))
const {app, BrowserWindow, Tray, Menu, ipcMain} = require('electron')
const path = require('path')

const Shuffled = require('./shuffled')
let microbreakIdeas = new Shuffled([
  'Go grab a glass of water.',
  'Slowly look all the way left, then right.',
  'Slowly look all the way up, then down.',
  'Close your eyes and take few deep breaths.',
  'Close your eyes and relax.',
  'Stretch your legs.',
  'Stretch your arms.',
  'Is your sitting pose correct?',
  'Slowly turn head to side and hold for 10 seconds.',
  'Slowly tilt head to side and hold for 5-10 seconds.',
  'Stand from chair and stretch.',
  'Refocus eyes on an object at least 20 meters away.',
  'Take a moment to think about something you appreciate.'
])

let appIcon = null
let microbreakWin = null
let appStartupWin = null
let aboutWin = null
let finishMicrobreakTimer
let startMicrobreakTimer
let planMicrobreakTimer

function createTrayIcon () {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  const iconPath = path.join(__dirname, 'images/stretchly_18x18.png')
  appIcon = new Tray(iconPath)
  appIcon.setToolTip('stretchly - break time reminder app')
  appIcon.setContextMenu(getTrayMenu(false))
}

function showStartUpWindow () {
  const modalPath = path.join('file://', __dirname, 'start.html')
  appStartupWin = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    title: 'stretchly',
    backgroundColor: '#478484',
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
    backgroundColor: '#478484',
    title: 'stretchly'
  })
  microbreakWin.on('close', function () { microbreakWin = null })
  microbreakWin.loadURL(modalPath)
  // microbreakWin.webContents.openDevTools()
  microbreakWin.webContents.on('did-finish-load', () => {
    microbreakWin.webContents.send('breakIdea', microbreakIdeas.randomElement())
  })
  finishMicrobreakTimer = setTimeout(finishMicrobreak, 20000)
}

function finishMicrobreak () {
  microbreakWin.close()
  microbreakWin = null
  planMicrobreakTimer = setTimeout(planMicrobreak, 100)
}

function planMicrobreak () {
  startMicrobreakTimer = setTimeout(startMicrobreak, 600000)
}

ipcMain.on('finish-microbreak', function () {
  clearTimeout(finishMicrobreakTimer)
  finishMicrobreak()
})

app.on('ready', createTrayIcon)
app.on('ready', planMicrobreak)
app.on('ready', showStartUpWindow)

app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})

function pauseMicrobreaks () {
  if (microbreakWin) {
    clearTimeout(finishMicrobreakTimer)
    finishMicrobreak()
  }
  clearTimeout(planMicrobreakTimer)
  clearTimeout(startMicrobreakTimer)
  appIcon.setContextMenu(getTrayMenu(true))
}

function resumeMicrobreaks () {
  appIcon.setContextMenu(getTrayMenu(false))
  planMicrobreak()
}

function showAboutWindow () {
  const modalPath = path.join('file://', __dirname, 'about.html')
  aboutWin = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: '#478484',
    title: 'About stretchly'
  })
  aboutWin.loadURL(modalPath)
}

function getTrayMenu (MicrobreaksPaused) {
  let trayMenu = []

  trayMenu.push({
    label: 'About',
    click: function () {
      showAboutWindow()
    }
  }, {
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
      click: function () {
        pauseMicrobreaks()
      }
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: 'Quit',
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}
