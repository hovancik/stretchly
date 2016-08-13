const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const Tray = electron.Tray
const Menu = electron.Menu
const ipc = electron.ipcMain

let appIcon = null
let smallBreakWin = null
let appStartupWin = null
let aboutWin = null
let finishSmallBreakTimer
let startSmallBreakTimer
let planSmallBreakTimer

function createTrayIcon () {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  const iconPath = path.join(__dirname, 'icon.png')
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
    transparent: true,
    width: 600,
    height: 200
  })
  appStartupWin.loadURL(modalPath)
  setTimeout(function () {
    appStartupWin.close()
  }, 5000)
}

function startSmallBreak () {
  const modalPath = path.join('file://', __dirname, 'small_break.html')
  smallBreakWin = new BrowserWindow({
    frame: false,
    alwaysOnTop: true,
    backgroundColor: '#8aba87',
    title: 'strechly'
  })
  smallBreakWin.on('close', function () { smallBreakWin = null })
  smallBreakWin.loadURL(modalPath)
  // smallBreakWin.webContents.openDevTools()
  finishSmallBreakTimer = setTimeout(finishSmallBreak, 10000)
}

function finishSmallBreak () {
  smallBreakWin.close()
  smallBreakWin = null
  planSmallBreakTimer = setTimeout(planSmallBreak, 100)
}

function planSmallBreak () {
  startSmallBreakTimer = setTimeout(startSmallBreak, 600000)
}

ipc.on('finish-small-break', function () {
  clearTimeout(finishSmallBreakTimer)
  finishSmallBreak()
})

app.on('ready', createTrayIcon)
app.on('ready', planSmallBreak)
app.on('ready', showStartUpWindow)

app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})

function pauseSmallBreaks () {
  if (smallBreakWin) {
    clearTimeout(finishSmallBreakTimer)
    finishSmallBreak()
  }
  clearTimeout(planSmallBreakTimer)
  clearTimeout(startSmallBreakTimer)
  appIcon.setContextMenu(getTrayMenu(true))
}

function resumeSmallBreaks () {
  appIcon.setContextMenu(getTrayMenu(false))
  planSmallBreak()
}

function showAboutWindow () {
  const modalPath = path.join('file://', __dirname, 'about.html')
  aboutWin = new BrowserWindow({
    alwaysOnTop: true,
    backgroundColor: '#8aba87',
    title: 'About strechly'
  })
  aboutWin.loadURL(modalPath)
}

function getTrayMenu (smallBreaksPaused) {
  let trayMenu = []

  trayMenu.push({
    label: 'About',
    click: function () {
      showAboutWindow()
    }
  }, {
    type: 'separator'
  })

  if (smallBreaksPaused) {
    trayMenu.push({
      label: 'Resume',
      click: function () {
        resumeSmallBreaks()
      }
    })
  } else {
    trayMenu.push({
      label: 'Pause',
      click: function () {
        pauseSmallBreaks()
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
