const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const Tray = electron.Tray
const Menu = electron.Menu
const ipc = electron.ipcMain

let appIcon = null
let smallBreakWin = null
let finishSmallBreakTimer

function creatTrayIcon () {
  app.dock.hide()
  const iconPath = path.join(__dirname, 'icon.png')
  appIcon = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Quit',
    click: function () {
      app.quit()
    }
  }])
  appIcon.setToolTip('strechly - break time reminder app')
  appIcon.setContextMenu(contextMenu)
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
  //smallBreakWin.webContents.openDevTools();
  finishSmallBreakTimer = setTimeout(finishSmallBreak, 10000)
}

function finishSmallBreak () {
  smallBreakWin.close()
  smallBreakWin = null
  setTimeout (planSmallBreak, 100)
}

function planSmallBreak () {
  setTimeout (startSmallBreak, 600000)
}

ipc.on('finish-small-break', function () {
  clearTimeout(finishSmallBreakTimer)
  finishSmallBreak()
})

app.on('ready', creatTrayIcon)
app.on('ready', planSmallBreak)

app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})
