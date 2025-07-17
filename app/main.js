import {
  app, nativeTheme, BrowserWindow, Menu, ipcMain,
  screen, shell, dialog, globalShortcut, Tray,
  powerMonitor
} from 'electron'
import { EventEmitter } from 'node:events'
import { readFile, writeFile } from 'node:fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import log from 'electron-log/main.js'
import Store from 'electron-store'
import humanizeDuration from 'humanize-duration'
import { DateTime } from 'luxon'

import {
  canPostpone, canSkip, formatTimeRemaining,
  minutesRemaining
} from './utils/utils.js'
import IdeasLoader from './utils/ideasLoader.js'
import BreaksPlanner from './breaksPlanner.js'
import AppIcon from './utils/appIcon.js'
import { UntilMorning } from './utils/untilMorning.js'
import AutostartManager from './utils/autostartManager.js'
import Command from './utils/commands.js'
import { registerBreakShortcuts } from './utils/breakShortcuts.js'
import defaultSettings from './utils/defaultSettings.js'
import StatusMessages from './utils/statusMessages.js'
import DisplayManager from './utils/displayManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.on('uncaughtException', (err, _) => {
  log.error(err)
  const dialogOpts = {
    type: 'error',
    title: 'Stretchly',
    message: 'An error occured while running Stretchly and it will now quit. To report the issue, click Report.',
    buttons: ['Report', 'OK']
  }
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      shell.openExternal('https://github.com/hovancik/stretchly/issues')
    }
    app.quit()
  })
})

nativeTheme.on('updated', function theThemeHasChanged () {
  if (!gotTheLock) {
    return
  }
  updateTray()
})

let microbreakIdeas
let breakIdeas
let breakPlanner
let appIcon = null
let autostartManager = null
let displayManager = null
let processWin = null
let microbreakWins = null
let breakWins = null
let preferencesWin = null
let welcomeWin = null
let contributorPreferencesWin = null
let syncPreferencesWin = null
let myStretchlyWin = null
let settings
let pausedForSuspendOrLock = false
let nextIdea = null
let updateChecker
let currentTrayIconPath = null
let currentTrayMenuTemplate = null
let trayUpdateIntervalObj = null

log.initialize({ preload: true })

// https://stackoverflow.com/questions/65859634/notification-from-electron-shows-electron-app-electron/65863174#65863174
if (process.platform === 'win32') {
  app.setAppUserModelId('Stretchly')
}

const global = {
  isNewVersion: false,
  isContributor: false
}

ipcMain.on('set-global-value', (event, name, value) => {
  global[name] = value
})

ipcMain.handle('get-global-value', (event, name) => {
  return global[name]
})

const commandLineArguments = process.argv
  .slice(app.isPackaged ? 1 : 2)

const gotTheLock = app.requestSingleInstanceLock(commandLineArguments)

if (!gotTheLock) {
  const cmd = new Command(commandLineArguments, app.getVersion(), false)
  cmd.runOrForward()
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory, commandLineArguments) => {
    log.info(`Stretchly: arguments received from second instance: ${commandLineArguments}`)
    const cmd = new Command(commandLineArguments, app.getVersion())

    if (!cmd.hasSupportedCommand) {
      return
    }

    if (!cmd.checkInMain()) {
      log.info(`Stretchly: command '${cmd.command}' executed in second instance, dropped in main instance`)
      return
    }

    switch (cmd.command) {
      case 'reset':
        log.info('Stretchly: resetting breaks (requested by second instance)')
        resetBreaks()
        break

      case 'mini': {
        log.info('Stretchly: skip to Mini Break (requested by second instance)')
        const delay = cmd.waitToMs()
        if (delay === -1) {
          log.error('Stretchly: error parsing wait interval to ms because of invalid value')
          return
        }
        if (cmd.options.title) nextIdea = [cmd.options.title]
        if (!cmd.options.noskip || delay) skipToMicrobreak(delay)
        break
      }

      case 'long': {
        log.info('Stretchly: skip to Long Break (requested by second instance)')
        const delay = cmd.waitToMs()
        if (delay === -1) {
          log.error('Stretchly: error parsing wait interval to ms because of invalid value')
          return
        }
        nextIdea = [cmd.options.title ? cmd.options.title : null, cmd.options.text ? cmd.options.text : null]
        if (!cmd.options.noskip || delay) skipToBreak(delay)
        break
      }

      case 'resume':
        log.info('Stretchly: resume Breaks (requested by second instance)')
        if (breakPlanner.isPaused) resumeBreaks(false)
        break

      case 'toggle':
        log.info('Stretchly: toggle Breaks (requested by second instance)')
        if (breakPlanner.isPaused) resumeBreaks(false)
        else pauseBreaks(1)
        break

      case 'pause': {
        log.info('Stretchly: pause Breaks (requested by second instance)')
        const duration = cmd.durationToMs(settings)
        // -1 indicates an invalid value
        if (duration === -1) {
          log.error('Stretchly: error when parsing duration to ms because of invalid value')
          return
        }
        pauseBreaks(duration)
        break
      }

      case 'preferences':
        log.info('Stretchly: open Preferences window (requested by second instance)')
        createPreferencesWindow()
        break
    }
  })
}

app.on('ready', initialize)
app.on('window-all-closed', () => {
  // do nothing, so app wont get closed
})
app.on('before-quit', (event) => {
  if ((breakPlanner.scheduler.reference === 'finishMicrobreak' && settings.get('microbreakStrictMode')) ||
      (breakPlanner.scheduler.reference === 'finishBreak' && settings.get('breakStrictMode'))
  ) {
    log.info('Stretchly: preventing app closure (in break with strict mode)')
    event.preventDefault()
  } else {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

async function initialize (isAppStart = true) {
  if (!gotTheLock) {
    return
  }
  // TODO maybe we should not reinitialize but handle everything when we save new values for preferences
  log.info(`Stretchly: ${isAppStart ? '' : 're'}initializing...`)

  EventEmitter.setMaxListeners(200) // for watching Store changes
  if (!settings) {
    settings = new Store({
      defaults: defaultSettings,
      beforeEachMigration: (store, context) => {
        log.info(`Stretchly: migrating preferences from Stretchly v${context.fromVersion} to v${context.toVersion}`)
      },
      migrations: {
        '1.13.0': store => {
          if (store.has('pauseBreaksShortcut')) {
            store.set('pauseBreaksToggleShortcut', store.get('pauseBreaksShortcut'))
            log.info(`Stretchly: settings pauseBreaksToggleShortcut to "${store.get('pauseBreaksShortcut')}"`)
            store.delete('pauseBreaksShortcut')
            log.info('Stretchly: removing pauseBreaksShortcut')
          } else {
            log.info('Stretchly: not migrating pauseBreaksShortcut')
          }
          if (store.has('pauseBreaksShortcut')) {
            store.delete('resumeBreaksShortcut')
            log.info('Stretchly: removing resumeBreaksShortcut')
          }
        },
        '1.17.0': store => {
          if (store.has('showBreakActionsInStrictMode')) {
            store.set('showTrayMenuInStrictMode', store.get('showBreakActionsInStrictMode'))
            log.info(`Stretchly: settings showTrayMenuInStrictMode to "${store.get('showBreakActionsInStrictMode')}"`)
            store.delete('showBreakActionsInStrictMode')
            log.info('Stretchly: removing showBreakActionsInStrictMode')
          } else {
            log.info('Stretchly: not migrating showBreakActionsInStrictMode')
          }
        }
      },
      watch: true
    })
    log.info('Stretchly: loading preferences')
    Store.initRenderer()
    Object.entries(settings.store).forEach(([key, _]) => {
      settings.onDidChange(key, (newValue, oldValue) => {
        log.info(`Stretchly: setting '${key}' to '${JSON.stringify(newValue)}' (was '${JSON.stringify(oldValue)}')`)
      })
    })
  }
  if (!breakPlanner) {
    breakPlanner = new BreaksPlanner(settings)
    breakPlanner.nextBreak()
    breakPlanner.on('startMicrobreakNotification', () => { startMicrobreakNotification() })
    breakPlanner.on('startBreakNotification', () => { startBreakNotification() })
    breakPlanner.on('startMicrobreak', () => { startMicrobreak() })
    breakPlanner.on('finishMicrobreak', (shouldPlaySound, shouldPlanNext) => { finishMicrobreak(shouldPlaySound, shouldPlanNext) })
    breakPlanner.on('startBreak', () => { startBreak() })
    breakPlanner.on('finishBreak', (shouldPlaySound, shouldPlanNext) => { finishBreak(shouldPlaySound, shouldPlanNext) })
    breakPlanner.on('resumeBreaks', () => { resumeBreaks() })
    breakPlanner.on('updateToolTip', function () {
      updateTray()
    })
  } else {
    breakPlanner.clear()
    breakPlanner.appExclusionsManager.reinitialize(settings)
    breakPlanner.doNotDisturb(settings.get('monitorDnd'))
    breakPlanner.naturalBreaks(settings.get('naturalBreaks'))
    breakPlanner.nextBreak()
  }

  autostartManager = new AutostartManager({
    platform: process.platform,
    windowsStore: process.windowsStore,
    app
  })

  displayManager = new DisplayManager(settings, log)

  startI18next()
  startProcessWin()
  createWelcomeWindow()
  nativeTheme.themeSource = settings.get('themeSource')

  readFile(join(app.getPath('userData'), 'stamp'), 'utf8', (err, data) => {
    if (err) {
      return
    }
    if (DateTime.fromISO(data).month === DateTime.now().month) {
      global.isContributor = true
      log.info('Stretchly: Thanks for your contributions!')
      if (preferencesWin) {
        preferencesWin.webContents.send('enable-contributor-preferences')
      }
      updateTray()
    }
  })
  startPowerMonitoring()
  if (preferencesWin) {
    preferencesWin.webContents.send('renderSettings', await settingsToSend())
  }
  if (welcomeWin) {
    welcomeWin.webContents.send('renderSettings', await settingsToSend())
  }
  if (contributorPreferencesWin) {
    contributorPreferencesWin.webContents.send('renderSettings', await settingsToSend())
  }
  globalShortcut.unregisterAll()

  registerBreakShortcuts({
    settings,
    log,
    globalShortcut,
    breakPlanner,
    functions: { pauseBreaks, resumeBreaks, skipToBreak, skipToMicrobreak, resetBreaks }
  })

  updateTray()
}

function startI18next () {
  i18next
    .use(Backend)
    .init({
      lng: settings.get('language'),
      fallbackLng: 'en',
      debug: !app.isPackaged,
      backend: {
        loadPath: join(__dirname, '/locales/{{lng}}.json'),
        jsonIndent: 2
      }
    }, function (err, t) {
      if (err) {
        log.error(err.stack)
      }
    })
}

i18next.on('languageChanged', () => {
  if (welcomeWin) {
    welcomeWin.webContents.send('translate')
  }
  if (preferencesWin) {
    preferencesWin.webContents.send('translate')
  }
  updateTray()
  loadIdeas()
})

function onSuspendOrLock () {
  log.info('System: suspend or lock')
  if (settings.get('pauseForSuspendOrLock')) {
    if (breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd ||
      breakPlanner.naturalBreaksManager.isSchedulerCleared ||
      breakPlanner.appExclusionsManager.isSchedulerCleared) {
      log.info('Stretchly: not pausing for suspendOrLock because paused already')
    } else {
      pausedForSuspendOrLock = true
      pauseBreaks(1)
      updateTray()
    }
  } else {
    log.info('Stretchly: not pausing for suspendOrLock because setting is disabled')
  }
}

function onResumeOrUnlock () {
  log.info('System: resume or unlock')
  if (pausedForSuspendOrLock) {
    pausedForSuspendOrLock = false
    resumeBreaks(false)
  } else {
    // corrrect the planner for the time spent in suspend
    breakPlanner.correctScheduler()
  }
  updateTray()
}

function startPowerMonitoring () {
  powerMonitor.on('suspend', onSuspendOrLock)
  powerMonitor.on('lock-screen', onSuspendOrLock)
  powerMonitor.on('resume', onResumeOrUnlock)
  powerMonitor.on('unlock-screen', onResumeOrUnlock)
}

function closeWindows (windowArray) {
  for (const window of windowArray) {
    window.hide()
    if (windowArray[0] === window) {
      ipcMain.removeHandler('send-long-break-data')
      ipcMain.removeHandler('send-mini-break-data')
    }
    window.close()
  }
  return null
}

function trayIconPath () {
  const params = {
    paused:
      breakPlanner.isPaused ||
      breakPlanner.dndManager.isOnDnd ||
      breakPlanner.naturalBreaksManager.isSchedulerCleared ||
      breakPlanner.appExclusionsManager.isSchedulerCleared,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: process.platform,
    timeToBreakInTray: settings.get('timeToBreakInTray'),
    timeToBreak: minutesRemaining(breakPlanner.timeToNextBreak),
    reference: breakPlanner.scheduler.reference
  }
  const trayIconFileName = new AppIcon(params).trayIconFileName
  const pathToTrayIcon = join(__dirname, '/images/app-icons/', trayIconFileName)
  return pathToTrayIcon
}

function windowIconPath () {
  const unusedParams = null
  const params = {
    paused: false,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: unusedParams,
    timeToBreakInTrayString: unusedParams,
    reference: unusedParams
  }
  const windowIconFileName = new AppIcon(params).windowIconFileName
  return join(__dirname, '/images/app-icons', windowIconFileName)
}

function startProcessWin () {
  if (processWin) {
    planVersionCheck()
    return
  }
  const modalPath = 'file://' + join(__dirname, '/process.html')

  processWin = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    backgroundThrottling: false,
    webPreferences: {
      preload: join(__dirname, './process-preload.mjs'),
      sandbox: false
    }
  })
  processWin.webContents.loadURL(modalPath)
  processWin.webContents.once('ready-to-show', () => {
    planVersionCheck()
  })
}

function createWelcomeWindow (isAppStart = true) {
  if (settings.get('isFirstRun') && isAppStart) {
    const modalPath = 'file://' + join(__dirname, '/welcome.html')
    welcomeWin = new BrowserWindow({
      x: displayManager.getDisplayX(-1, 1000),
      y: displayManager.getDisplayY(-1, 750),
      width: 1000,
      height: 750,
      show: false,
      autoHideMenuBar: true,
      icon: windowIconPath(),
      backgroundColor: 'EDEDED',
      webPreferences: {
        preload: join(__dirname, './welcome-preload.mjs'),
        sandbox: false
      }
    })
    welcomeWin.webContents.loadURL(modalPath)
    welcomeWin.once('ready-to-show', () => {
      welcomeWin.center()
      welcomeWin.show()
    })
    welcomeWin.once('closed', () => {
      welcomeWin = null
    })
  }
}

function createContributorSettingsWindow () {
  if (contributorPreferencesWin) {
    contributorPreferencesWin.show()
    return
  }
  const modalPath = 'file://' + join(__dirname, '/contributor-preferences.html')
  contributorPreferencesWin = new BrowserWindow({
    x: displayManager.getDisplayX(-1, 735),
    y: displayManager.getDisplayY(),
    width: 735,
    show: false,
    autoHideMenuBar: true,
    icon: windowIconPath(),
    backgroundColor: 'EDEDED',
    webPreferences: {
      preload: join(__dirname, './contributor-preferences-preload.mjs'),
      sandbox: false
    }
  })
  contributorPreferencesWin.webContents.loadURL(modalPath)
  contributorPreferencesWin.once('ready-to-show', () => {
    contributorPreferencesWin.center()
    contributorPreferencesWin.show()
  })
  contributorPreferencesWin.once('closed', () => {
    contributorPreferencesWin = null
  })
}

function createSyncPreferencesWindow () {
  if (syncPreferencesWin) {
    syncPreferencesWin.show()
    return
  }

  const syncPreferencesUrl = 'https://my.stretchly.net/app/v1/sync'
  syncPreferencesWin = new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    width: 1000,
    height: 700,
    icon: windowIconPath(),
    x: displayManager.getDisplayX(),
    y: displayManager.getDisplayY(),
    backgroundColor: 'whitesmoke',
    webPreferences: {
      preload: join(__dirname, './electron-bridge.mjs'),
      sandbox: false
    }
  })
  syncPreferencesWin.webContents.loadURL(syncPreferencesUrl)

  syncPreferencesWin.once('closed', () => {
    syncPreferencesWin = null
  })

  syncPreferencesWin.once('ready-to-show', () => {
    syncPreferencesWin.center()
    syncPreferencesWin.show()
  })
}

function planVersionCheck (seconds = 1) {
  if (updateChecker) {
    clearInterval(updateChecker)
    updateChecker = null
  }
  updateChecker = setTimeout(checkVersion, seconds * 1000)
}

function checkVersion () {
  if (settings.get('checkNewVersion')) {
    processWin.webContents.send('check-version',
      `v${app.getVersion()}`,
      settings.get('notifyNewVersion'),
      settings.get('silentNotifications')
    )
    planVersionCheck(3600 * 48)
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

function getBlurredBackgroundWindowOptions () {
  if (!settings.get('blurredBackground')) {
    return {}
  }

  switch (process.platform) {
    case 'darwin':
      return {
        vibrancy: 'hud',
        visualEffectState: 'active'
      }
    default:
      return {}
  }
}

function startMicrobreak () {
  // don't start another break if break running
  if (microbreakWins) {
    log.warn('Stretchly: Mini Break already running, not starting Mini Break')
    return
  }

  const breakDuration = settings.get('microbreakDuration')
  const strictMode = settings.get('microbreakStrictMode')
  const postponesLimit = settings.get('microbreakPostponesLimit')
  const postponableDurationPercent = settings.get('microbreakPostponableDurationPercent')
  const postponable = settings.get('microbreakPostpone') &&
    breakPlanner.postponesNumber < postponesLimit && postponesLimit > 0
  const showBreaksAsRegularWindows = settings.get('showBreaksAsRegularWindows')

  const modalPath = 'file://' + join(__dirname, '/microbreak.html')
  microbreakWins = []

  const idea = nextIdea || (settings.get('ideas') ? microbreakIdeas.randomElement : [''])
  nextIdea = null

  if (settings.get('microbreakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('play-sound', settings.get('miniBreakAudio'), settings.get('volume'))
  }

  ipcMain.handle('send-mini-break-data', (event) => {
    const startTime = Date.now()
    if (!strictMode || postponable) {
      if (settings.get('endBreakShortcut') !== '') {
        globalShortcut.register(settings.get('endBreakShortcut'), () => {
          const passedPercent = (Date.now() - startTime) / breakDuration * 100
          if (canPostpone(postponable, passedPercent, postponableDurationPercent)) {
            postponeMicrobreak()
          } else if (canSkip(strictMode, postponable, passedPercent, postponableDurationPercent)) {
            finishMicrobreak(false)
          }
        })
      }
    }
    return [idea, startTime, breakDuration, strictMode,
      postponable, postponableDurationPercent,
      calculateBackgroundColor(settings.get('miniBreakColor'))]
  })

  for (let localDisplayId = 0; localDisplayId < displayManager.getDisplayCount(); localDisplayId++) {
    const windowOptions = {
      width: Math.floor(displayManager.getDisplayWidth(localDisplayId) * settings.get('breakWindowWidth')),
      height: Math.floor(displayManager.getDisplayHeight(localDisplayId) * settings.get('breakWindowHeight')),
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: showBreaksAsRegularWindows,
      show: false,
      backgroundThrottling: false,
      transparent: true,
      ...getBlurredBackgroundWindowOptions(),
      backgroundColor: calculateBackgroundColor(settings.get('miniBreakColor')),
      skipTaskbar: !showBreaksAsRegularWindows,
      focusable: showBreaksAsRegularWindows,
      alwaysOnTop: !showBreaksAsRegularWindows,
      hasShadow: false,
      title: 'Stretchly',
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      webPreferences: {
        preload: join(__dirname, './microbreak-preload.mjs'),
        sandbox: false
      }
    }

    if (settings.get('fullscreen') && process.platform !== 'darwin') {
      windowOptions.width = displayManager.getDisplayWidth(localDisplayId)
      windowOptions.height = displayManager.getDisplayHeight(localDisplayId)
      windowOptions.x = displayManager.getDisplayX(localDisplayId, 0, true)
      windowOptions.y = displayManager.getDisplayY(localDisplayId, 0, true)
    } else if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displayManager.getDisplayX(localDisplayId, windowOptions.width, false)
      windowOptions.y = displayManager.getDisplayY(localDisplayId, windowOptions.height, false)
    }

    let microbreakWinLocal = new BrowserWindow(windowOptions)
    // seems to help with multiple-displays problems
    microbreakWinLocal.setSize(windowOptions.width, windowOptions.height)

    microbreakWinLocal.once('ready-to-show', () => {
      log.info('Stretchly: ready-to-show fired')
    })

    ipcMain.once('mini-break-loaded', () => {
      log.info('Stretchly: Mini Break window loaded')
      if (showBreaksAsRegularWindows) {
        microbreakWinLocal.show()
      } else {
        microbreakWinLocal.showInactive()
      }

      log.info(`Stretchly: showing window ${localDisplayId + 1} of ${displayManager.getDisplayCount()}`)
      if (process.platform === 'darwin') {
        if (showBreaksAsRegularWindows) {
          microbreakWinLocal.setFullScreen(settings.get('fullscreen'))
        } else {
          microbreakWinLocal.setMinimizable(false)
          microbreakWinLocal.setClosable(false)
          microbreakWinLocal.setKiosk(settings.get('fullscreen'))
        }
      }
      if (localDisplayId === 0) {
        breakPlanner.emit('microbreakStarted', true)
        log.info('Stretchly: starting Mini Break')
      }
      if (!settings.get('fullscreen') && process.platform !== 'darwin') {
        setTimeout(() => {
          microbreakWinLocal.center()
        }, 0)
      }
      updateTray()
    })

    microbreakWinLocal.loadURL(modalPath)
    microbreakWinLocal.setVisibleOnAllWorkspaces(true)
    microbreakWinLocal.setAlwaysOnTop(!showBreaksAsRegularWindows, 'pop-up-menu')
    if (microbreakWinLocal) {
      microbreakWinLocal.on('close', (e) => {
        if (breakPlanner.scheduler.timeLeft > 0 && settings.get('microbreakStrictMode')) {
          // FIXME this will still log when postponing break
          log.info('Stretchly: preventing closing break window as in strict mode')
          e.preventDefault()
        }
      })
      microbreakWinLocal.once('closed', () => {
        microbreakWinLocal = null
      })
    }
    microbreakWins.push(microbreakWinLocal)

    if (!settings.get('allScreens')) {
      if (displayManager.getDisplayCount() > 1) {
        log.info('Stretchly: not showing on more Monitors as it is disabled.')
      }
      break
    }
  }
  if (process.platform === 'darwin') {
    if (app.dock.isVisible) {
      app.dock.hide()
    }
  }
}

function startBreak () {
  if (breakWins) {
    log.warn('Stretchly: Long Break already running, not starting Long Break')
    return
  }

  const breakDuration = settings.get('breakDuration')
  const strictMode = settings.get('breakStrictMode')
  const postponesLimit = settings.get('breakPostponesLimit')
  const postponableDurationPercent = settings.get('breakPostponableDurationPercent')
  const postponable = settings.get('breakPostpone') &&
    breakPlanner.postponesNumber < postponesLimit && postponesLimit > 0
  const showBreaksAsRegularWindows = settings.get('showBreaksAsRegularWindows')

  const modalPath = 'file://' + join(__dirname, '/break.html')
  breakWins = []

  const defaultNextIdea = settings.get('ideas') ? breakIdeas.randomElement : ['', '']
  const idea = nextIdea ? (nextIdea.map((val, index) => val || defaultNextIdea[index])) : defaultNextIdea
  nextIdea = null

  if (settings.get('breakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('play-sound', settings.get('audio'), settings.get('volume'))
  }

  ipcMain.handle('send-long-break-data', (event) => {
    const startTime = Date.now()
    if (!strictMode || postponable) {
      if (settings.get('endBreakShortcut') !== '') {
        globalShortcut.register(settings.get('endBreakShortcut'), () => {
          const passedPercent = (Date.now() - startTime) / breakDuration * 100
          if (canPostpone(postponable, passedPercent, postponableDurationPercent)) {
            postponeBreak()
          } else if (canSkip(strictMode, postponable, passedPercent, postponableDurationPercent)) {
            finishBreak(false)
          }
        })
      }
    }
    return [idea, startTime, breakDuration, strictMode,
      postponable, postponableDurationPercent,
      calculateBackgroundColor(settings.get('mainColor'))]
  })

  for (let localDisplayId = 0; localDisplayId < displayManager.getDisplayCount(); localDisplayId++) {
    const windowOptions = {
      width: Math.floor(displayManager.getDisplayWidth(localDisplayId) * settings.get('breakWindowWidth')),
      height: Math.floor(displayManager.getDisplayHeight(localDisplayId) * settings.get('breakWindowHeight')),
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: showBreaksAsRegularWindows,
      show: false,
      backgroundThrottling: false,
      transparent: true,
      ...getBlurredBackgroundWindowOptions(),
      backgroundColor: calculateBackgroundColor(settings.get('mainColor')),
      skipTaskbar: !showBreaksAsRegularWindows,
      focusable: showBreaksAsRegularWindows,
      alwaysOnTop: !showBreaksAsRegularWindows,
      hasShadow: false,
      title: 'Stretchly',
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      webPreferences: {
        preload: join(__dirname, './break-preload.mjs'),
        sandbox: false
      }
    }

    if (settings.get('fullscreen') && process.platform !== 'darwin') {
      windowOptions.width = displayManager.getDisplayWidth(localDisplayId)
      windowOptions.height = displayManager.getDisplayHeight(localDisplayId)
      windowOptions.x = displayManager.getDisplayX(localDisplayId, 0, true)
      windowOptions.y = displayManager.getDisplayY(localDisplayId, 0, true)
    } else if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = displayManager.getDisplayX(localDisplayId, windowOptions.width, false)
      windowOptions.y = displayManager.getDisplayY(localDisplayId, windowOptions.height, false)
    }

    let breakWinLocal = new BrowserWindow(windowOptions)
    // seems to help with multiple-displays problems
    breakWinLocal.setSize(windowOptions.width, windowOptions.height)

    breakWinLocal.once('ready-to-show', () => {
      log.info('Stretchly: ready-to-show fired')
    })

    ipcMain.once('long-break-loaded', () => {
      log.info('Stretchly: Long Break window loaded')
      if (showBreaksAsRegularWindows) {
        breakWinLocal.show()
      } else {
        breakWinLocal.showInactive()
      }

      log.info(`Stretchly: showing window ${localDisplayId + 1} of ${displayManager.getDisplayCount()}`)
      if (process.platform === 'darwin') {
        if (showBreaksAsRegularWindows) {
          breakWinLocal.setFullScreen(settings.get('fullscreen'))
        } else {
          breakWinLocal.setMinimizable(false)
          breakWinLocal.setClosable(false)
          breakWinLocal.setKiosk(settings.get('fullscreen'))
        }
      }
      if (localDisplayId === 0) {
        breakPlanner.emit('breakStarted', true)
        log.info('Stretchly: starting Long Break')
      }

      if (!settings.get('fullscreen') && process.platform !== 'darwin') {
        setTimeout(() => {
          breakWinLocal.center()
        }, 0)
      }
      updateTray()
    })

    breakWinLocal.loadURL(modalPath)
    breakWinLocal.setVisibleOnAllWorkspaces(true)
    breakWinLocal.setAlwaysOnTop(!showBreaksAsRegularWindows, 'pop-up-menu')
    if (breakWinLocal) {
      breakWinLocal.on('close', (e) => {
        if (breakPlanner.scheduler.timeLeft > 0 && settings.get('breakStrictMode')) {
          // FIXME this will still log when postponing break
          log.info('Stretchly: preventing closing break window as in strict mode')
          e.preventDefault()
        }
      })
      breakWinLocal.once('closed', () => {
        breakWinLocal = null
      })
    }
    breakWins.push(breakWinLocal)

    if (!settings.get('allScreens')) {
      if (displayManager.getDisplayCount() > 1) {
        log.info('Stretchly: not showing on more Monitors as it is disabled.')
      }
      break
    }
  }
  if (process.platform === 'darwin') {
    if (app.dock.isVisible) {
      app.dock.hide()
    }
  }
}

function breakComplete (shouldPlaySound, windows, breakType) {
  if (settings.get('endBreakShortcut') && globalShortcut.isRegistered(settings.get('endBreakShortcut'))) {
    globalShortcut.unregister(settings.get('endBreakShortcut'))
  }
  if (shouldPlaySound && !settings.get('silentNotifications')) {
    const audio = breakType === 'mini' ? 'miniBreakAudio' : 'audio'
    processWin.webContents.send('play-sound', settings.get(audio), settings.get('volume'))
  }
  if (process.platform === 'darwin') {
    // get focus on the last app
    Menu.sendActionToFirstResponder('hide:')
  }
  return closeWindows(windows)
}

function finishMicrobreak (shouldPlaySound = true, shouldPlanNext = true) {
  microbreakWins = breakComplete(shouldPlaySound, microbreakWins, 'mini')
  log.info(`Stretchly: finishing Mini Break (shouldPlanNext: ${shouldPlanNext})`)
  if (shouldPlanNext) {
    breakPlanner.nextBreak()
  } else {
    breakPlanner.clear()
  }
  updateTray()
}

function finishBreak (shouldPlaySound = true, shouldPlanNext = true) {
  breakWins = breakComplete(shouldPlaySound, breakWins, 'long')
  log.info(`Stretchly: finishing Long Break (shouldPlanNext: ${shouldPlanNext})`)
  if (shouldPlanNext) {
    breakPlanner.nextBreak()
  } else {
    breakPlanner.clear()
  }
  updateTray()
}

function postponeMicrobreak () {
  microbreakWins = breakComplete(false, microbreakWins, 'mini')
  breakPlanner.postponeCurrentBreak()
  log.info('Stretchly: postponing Mini Break')
  updateTray()
}

function postponeBreak () {
  breakWins = breakComplete(false, breakWins, 'long')
  breakPlanner.postponeCurrentBreak()
  log.info('Stretchly: postponing Long Break')
  updateTray()
}

function skipToMicrobreak (delay) {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  if (delay) {
    breakPlanner.skipToMicrobreak(delay)
    log.info(`Stretchly: skipping to Mini Break in ${delay}ms`)
  } else {
    breakPlanner.skipToMicrobreak()
    log.info('Stretchly: skipping to Mini Break')
  }
  updateTray()
}

function skipToBreak (delay) {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  if (delay) {
    breakPlanner.skipToBreak(delay)
    log.info(`Stretchly: skipping to Long Break in ${delay}ms`)
  } else {
    breakPlanner.skipToBreak()
    log.info('Stretchly: skipping to Long Break')
  }
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
  log.info('Stretchly: resetting breaks')
  updateTray()
}

function calculateBackgroundColor (color) {
  let opacityMultiplier = 1
  if (settings.get('transparentMode')) {
    opacityMultiplier = settings.get('opacity')
  }
  return color + Math.round(opacityMultiplier * 255).toString(16).padStart(2, '0')
}

function loadIdeas () {
  let longBreakIdeasData
  let miniBreakIdeasData
  if (settings.get('useIdeasFromSettings')) {
    longBreakIdeasData = settings.get('breakIdeas')
    miniBreakIdeasData = settings.get('microbreakIdeas')
    log.info('Stretchly: loading custom break ideas from preferences file')
  } else {
    const t = i18next.getFixedT('en')
    miniBreakIdeasData = Object.keys(t('miniBreakIdeas',
      { returnObjects: true }))
      .map((item) => {
        return { data: i18next.t(`miniBreakIdeas.${item}.text`), enabled: true }
      })

    longBreakIdeasData = Object.keys(t('longBreakIdeas',
      { returnObjects: true }))
      .map((item) => {
        return { data: [i18next.t(`longBreakIdeas.${item}.title`), i18next.t(`longBreakIdeas.${item}.text`)], enabled: true }
      })
    log.info('Stretchly: loading default break ideas')
  }

  breakIdeas = new IdeasLoader(longBreakIdeasData).ideas()
  microbreakIdeas = new IdeasLoader(miniBreakIdeasData).ideas()
}

function pauseBreaks (milliseconds) {
  if (microbreakWins) {
    finishMicrobreak(false)
  }
  if (breakWins) {
    finishBreak(false)
  }
  breakPlanner.pause(milliseconds)
  log.info(`Stretchly: pausing breaks for ${milliseconds}ms`)
  updateTray()
}

function resumeBreaks (notify = true) {
  if (breakPlanner.dndManager.isOnDnd) {
    log.info('Stretchly: not resuming breaks because in Do Not Disturb')
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
  if (preferencesWin) {
    preferencesWin.show()
    return
  }
  const modalPath = 'file://' + join(__dirname, '/preferences.html')
  const maxHeight = screen
    .getDisplayNearestPoint(screen.getCursorScreenPoint())
    .workAreaSize.height * 0.9
  preferencesWin = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    backgroundThrottling: false,
    icon: windowIconPath(),
    width: 600,
    height: 530,
    maxHeight: Math.round(maxHeight),
    x: displayManager.getDisplayX(-1, 600),
    y: displayManager.getDisplayY(-1, 530),
    backgroundColor: '#EDEDED',
    webPreferences: {
      preload: join(__dirname, './preferences-preload.mjs'),
      sandbox: false
    }
  })
  preferencesWin.webContents.loadURL(modalPath)
  preferencesWin.once('ready-to-show', () => {
    preferencesWin.center()
    preferencesWin.show()
  })
  preferencesWin.once('closed', () => {
    preferencesWin = null
  })
}

function updateTray () {
  if (process.platform === 'darwin') {
    if (app.dock.isVisible) {
      app.dock.hide()
    }
  }

  if (!appIcon && !settings.get('showTrayIcon')) {
    return
  }

  if (settings.get('showTrayIcon')) {
    if (!appIcon) {
      appIcon = new Tray(trayIconPath())
      appIcon.on('double-click', () => {
        createPreferencesWindow()
      })
      appIcon.on('click', () => {
        appIcon.popUpContextMenu(Menu.buildFromTemplate(currentTrayMenuTemplate))
      })
    }
    if (!trayUpdateIntervalObj) {
      trayUpdateIntervalObj = setInterval(updateTray, 10000)
    }

    updateToolTip()

    const newTrayIconPath = trayIconPath()
    if (newTrayIconPath !== currentTrayIconPath) {
      appIcon.setImage(newTrayIconPath)
      currentTrayIconPath = newTrayIconPath
    }

    const newTrayMenuTemplate = getTrayMenuTemplate()
    if (JSON.stringify(newTrayMenuTemplate) !== JSON.stringify(currentTrayMenuTemplate)) {
      const trayMenu = Menu.buildFromTemplate(newTrayMenuTemplate)
      appIcon.setContextMenu(trayMenu)
      currentTrayMenuTemplate = newTrayMenuTemplate
    }
  }
}

function getTrayMenuTemplate () {
  const trayMenu = []

  if (global.isNewVersion) {
    trayMenu.push({
      label: i18next.t('main.downloadLatestVersion'),
      click: function () {
        shell.openExternal('https://hovancik.net/stretchly/downloads')
      }
    }, {
      type: 'separator'
    })
  }

  const statusMessage = new StatusMessages({
    breakPlanner,
    settings,
    i18next,
    humanizeDuration
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

  if ((breakPlanner.scheduler.reference === 'finishMicrobreak' && settings.get('microbreakStrictMode') &&
        !settings.get('showTrayMenuInStrictMode')) ||
      (breakPlanner.scheduler.reference === 'finishBreak' && settings.get('breakStrictMode') &&
      !settings.get('showTrayMenuInStrictMode'))
  ) {
    // empty menu, we are in strict mode
    return trayMenu
  }

  if (!(breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd || breakPlanner.appExclusionsManager.isSchedulerCleared)) {
    let submenu = []
    if (settings.get('microbreak')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toMicrobreak'),
        click: () => skipToMicrobreak()
      }])
    }
    if (settings.get('break')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toBreak'),
        click: () => skipToBreak()
      }])
    }
    if (settings.get('break') || settings.get('microbreak')) {
      trayMenu.push({
        label: i18next.t('main.skipToTheNext'),
        submenu
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
  } else if (!(breakPlanner.dndManager.isOnDnd || breakPlanner.appExclusionsManager.isSchedulerCleared)) {
    trayMenu.push({
      label: i18next.t('main.pause'),
      submenu: [
        {
          label: i18next.t('utils.minutes', { count: 30 }),
          accelerator: settings.get('pauseBreaksFor30MinutesShortcut') || null,
          click: function () {
            pauseBreaks(1800 * 1000)
          }
        }, {
          label: i18next.t('main.forHour'),
          accelerator: settings.get('pauseBreaksFor1HourShortcut') || null,
          click: function () {
            pauseBreaks(3600 * 1000)
          }
        }, {
          label: i18next.t('main.for2Hours'),
          accelerator: settings.get('pauseBreaksFor2HoursShortcut') || null,
          click: function () {
            pauseBreaks(3600 * 2 * 1000)
          }
        }, {
          label: i18next.t('main.for5Hours'),
          accelerator: settings.get('pauseBreaksFor5HoursShortcut') || null,
          click: function () {
            pauseBreaks(3600 * 5 * 1000)
          }
        }, {
          label: i18next.t('main.untilMorning'),
          accelerator: settings.get('pauseBreaksUntilMorningShortcut') || null,
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
  })

  if (global.isContributor) {
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

  return trayMenu
}

function updateToolTip () {
  let trayMessage = i18next.t('main.toolTipHeader')
  const message = new StatusMessages({
    breakPlanner,
    settings,
    i18next,
    humanizeDuration
  }).trayMessage
  if (message !== '') {
    trayMessage += '\n\n' + message
  }
  if (appIcon) {
    appIcon.setToolTip(trayMessage)
  }
}

function showNotification (text) {
  processWin.webContents.send('show-notification',
    text,
    settings.get('silentNotifications')
  )
}

ipcMain.on('postpone-mini-break', function (event) {
  postponeMicrobreak()
})

ipcMain.on('postpone-long-break', function (event) {
  postponeBreak()
})

ipcMain.on('finish-mini-break', function (event, shouldPlaySound, shouldPlanNext) {
  finishMicrobreak(shouldPlaySound, shouldPlanNext)
})

ipcMain.on('finish-long-break', function (event, shouldPlaySound, shouldPlanNext) {
  finishBreak(shouldPlaySound, shouldPlanNext)
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

  if (key === 'audio') {
    settings.set('miniBreakAudio', value)
  }

  if (key === 'mainColor') {
    settings.set('miniBreakColor', value)
  }

  if (key === 'showTrayIcon') {
    settings.set('showTrayIcon', value)
    if (value) {
      updateTray()
    } else {
      clearInterval(trayUpdateIntervalObj)
      trayUpdateIntervalObj = null
      appIcon.destroy()
      appIcon = null
    }
  }

  if (key === 'openAtLogin') {
    autostartManager.setAutostartEnabled(value)
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
  dialog.showMessageBox(dialogOpts).then(async (returnValue) => {
    if (returnValue.response === 0) {
      log.info('Stretchly: restoring default settings')
      settings.store = Object.assign(defaultSettings, { isFirstRun: false, __internal__: settings.get('__internal__') })
      initialize(false)
      event.sender.reload()
    }
  })
})

ipcMain.on('play-sound', (event, sound) => {
  processWin.webContents.send('play-sound', sound, settings.get('volume'))
})

ipcMain.handle('show-debug', (event) => {
  const reference = breakPlanner.scheduler.reference
  const timeleft = formatTimeRemaining(
    breakPlanner.scheduler.timeLeft, settings.get('language'),
    i18next, humanizeDuration
  )
  const breaknumber = breakPlanner.breakNumber
  const postponesnumber = breakPlanner.postponesNumber
  const doNotDisturb = breakPlanner.dndManager.isOnDnd
  let settingsFile = settings.path
  let logsFile = log.transports.file.getFile().path
  if (process.windowsStore) {
    settingsFile = settingsFile.replace('Roaming', 'Local\\Packages\\33881JanHovancik.stretchly_24fg4m0zq65je\\LocalCache\\Roaming')
    logsFile = logsFile.replace('Roaming', 'Local\\Packages\\33881JanHovancik.stretchly_24fg4m0zq65je\\LocalCache\\Roaming')
  }
  return [
    reference,
    timeleft,
    breaknumber,
    postponesnumber,
    settingsFile,
    logsFile,
    doNotDisturb
  ]
})

ipcMain.on('open-preferences', function (event) {
  createPreferencesWindow()
})

ipcMain.on('set-contributor', function (event) {
  const dir = app.getPath('userData')
  const contributorStampFile = `${dir}/stamp`
  writeFile(contributorStampFile, DateTime.now().toString(), () => { })
  global.isContributor = true
  log.info('Stretchly: Logged in. Thanks for your contributions!')
  if (preferencesWin) {
    preferencesWin.webContents.send('enable-contributor-preferences')
  }
  updateTray()
})

ipcMain.on('open-contributor-preferences', function () {
  createContributorSettingsWindow()
})

ipcMain.on('open-contributor-auth', function (event, provider) {
  if (myStretchlyWin) {
    myStretchlyWin.show()
    return
  }
  const myStretchlyUrl = `https://my.stretchly.net/app/v1?provider=${provider}`
  myStretchlyWin = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    width: 1000,
    height: 700,
    icon: windowIconPath(),
    x: displayManager.getDisplayX(),
    y: displayManager.getDisplayY(),
    backgroundColor: 'whitesmoke',
    webPreferences: {
      preload: join(__dirname, './electron-bridge.mjs'),
      sandbox: false
    }
  })
  myStretchlyWin.webContents.loadURL(myStretchlyUrl)

  myStretchlyWin.once('closed', () => {
    myStretchlyWin = null
  })

  myStretchlyWin.once('ready-to-show', () => {
    myStretchlyWin.center()
    myStretchlyWin.show()
  })
})

ipcMain.on('open-sync-preferences', () => {
  createSyncPreferencesWindow()
})

ipcMain.handle('current-settings', async (event) => {
  return await settingsToSend()
})

async function settingsToSend () {
  return Object.assign({}, settings.store, { openAtLogin: await autostartManager.autoLaunchStatus() })
}

ipcMain.handle('restore-remote-settings', (event, remoteSettings) => {
  log.info('Stretchly: restoring remote settings')
  settings.store = remoteSettings
  initialize(false)
})

ipcMain.handle('i18next-translate', (event, key, options) => {
  return i18next.t(key, options)
})

ipcMain.handle('i18next-dir', (event) => {
  return i18next.dir()
})

ipcMain.handle('settings-get', (event, key) => {
  return settings.get(key)
})

ipcMain.on('close-current-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.close()
  }
})

ipcMain.handle('get-window-bounds', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  return win.getBounds()
})

ipcMain.on('set-window-size', (event, width, height) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.setSize(width, height)
})

ipcMain.handle('get-version', (event) => {
  return app.getVersion()
})
