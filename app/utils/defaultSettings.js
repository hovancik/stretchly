const defaultBreakIdeas = require('./defaultBreakIdeas')
const defaultMicrobreakIdeas = require('./defaultMicrobreakIdeas')

// Don't check for new versions by default when running inside the Flatpak.
const fs = require('fs')
const flatpakInfoPath = '/.flatpak-info'
defaultCheckNewVersion = true
defaultNotifyNewVersion = true
if (fs.existsSync(flatpakInfoPath)) {
    defaultCheckNewVersion = false
    defaultNotifyNewVersion = false
}

module.exports = {
  microbreakDuration: 20000,
  microbreakInterval: 600000,
  breakDuration: 300000,
  breakInterval: 2,
  breakNotification: true,
  microbreakNotification: true,
  breakNotificationInterval: 30000,
  microbreakNotificationInterval: 10000,
  microbreak: true,
  break: true,
  microbreakStrictMode: false,
  breakStrictMode: false,
  morningHour: 6,
  microbreakPostpone: true,
  breakPostpone: true,
  microbreakPostponeTime: 120000,
  breakPostponeTime: 300000,
  microbreakPostponesLimit: 1,
  microbreakPostponableDurationPercent: 30,
  breakPostponesLimit: 1,
  breakPostponableDurationPercent: 30,
  mainColor: '#478484',
  transparentMode: false,
  opacity: 0.9,
  audio: 'crystal-glass',
  volume: 1,
  fullscreen: false,
  ideas: true,
  naturalBreaks: true,
  naturalBreaksInactivityResetTime: 300000,
  allScreens: true,
  useIdeasFromSettings: false,
  language: 'en',
  notifyNewVersion: defaultNotifyNewVersion,
  isFirstRun: true,
  posLatitude: 0.0,
  posLongitude: 0.0,
  useMonochromeTrayIcon: false,
  useMonochromeInvertedTrayIcon: false,
  silentNotifications: false,
  monitorDnd: true,
  microbreakStartSoundPlaying: false,
  breakStartSoundPlaying: false,
  themeSource: 'system',
  endBreakShortcut: 'CmdOrCtrl+X',
  breakWindowWidth: 0.85,
  breakWindowHeight: 0.85,
  checkNewVersion: defaultCheckNewVersion,
  breakIdeas: defaultBreakIdeas,
  microbreakIdeas: defaultMicrobreakIdeas,
  showBreaksAsRegularWindows: false,
  appExclusions: [],
  appExclusionsCheckInterval: 1000,
  pauseForSuspendOrLock: true,
  pauseBreaksShortcut: '',
  resumeBreaksShortcut: '',
  screen: 'primary',
  timeToBreakInTray: false,
  currentTimeInBreaks: false
}
