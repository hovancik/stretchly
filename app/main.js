const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const Tray = electron.Tray
const Menu = electron.Menu
const ipc = electron.ipcMain

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
  const iconPath = path.join(__dirname, 'images/strechly_18x18.png')
  appIcon = new Tray(iconPath)
  appIcon.setToolTip('strechly - break time reminder app')
  appIcon.setContextMenu(getTrayMenu(false))
}

function showStartUpWindow () {
  const modalPath = path.join('file://', __dirname, 'start.html')
  appStartupWin = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    title: 'strechly',
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
    title: 'strechly'
  })
  microbreakWin.on('close', function () { microbreakWin = null })
  microbreakWin.loadURL(modalPath)
  // microbreakWin.webContents.openDevTools()
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

ipc.on('finish-microbreak', function () {
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
    title: 'About strechly'
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
