// TODO if I am not wrong, formating function are mathemticaly the same
// Would be nice to not have the same code
const formatTimeRemaining = function (milliseconds, i18next = require('i18next')) {
  const seconds = Math.ceil(milliseconds / 1000.0)
  const minutes = Math.ceil(seconds / 60.0)
  const hours = Math.ceil(minutes / 60.0)

  if (seconds < 60) {
    return i18next.t('utils.secondsRemaining', { seconds: seconds })
  }

  if (seconds >= 60 && minutes < 60) {
    if (seconds === 60) {
      return i18next.t('utils.aboutMinutesRemaining', { minutes: 2 })
    }
    return i18next.t('utils.aboutMinutesRemaining', { minutes: minutes })
  }

  if (minutes >= 60) {
    if (minutes % 60 === 0) {
      return i18next.t('utils.aboutHoursRemaining', { hours: hours })
    }
    return i18next.t('utils.aboutHoursMinutesRemaining',
      { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
  }
  return 'Uknown time remainig'
}

const formatTimeIn = function (milliseconds, i18next = require('i18next')) {
  const seconds = Math.ceil(milliseconds / 1000.0)
  const minutes = Math.ceil(seconds / 60.0)
  const hours = Math.ceil(minutes / 60.0)

  if (seconds < 60) {
    return i18next.t('utils.inSeconds', { seconds: seconds })
  }

  if (seconds >= 60 && minutes < 60) {
    if (seconds === 60) {
      return i18next.t('utils.inAboutMinutes', { minutes: 2 })
    }
    return i18next.t('utils.inAboutMinutes', { minutes: minutes })
  }

  if (minutes >= 60) {
    if (minutes % 60 === 0) {
      return i18next.t('utils.inAboutHours', { hours: hours })
    } else {
      return i18next.t('utils.inAboutHoursMinutes',
        { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
    }
  }
  return 'in unknown time'
}

// does not consider `postponesLimit`
function canPostpone (postpone, passedPercent, postponePercent) {
  return postpone && passedPercent <= postponePercent
}

// does not consider `postponesLimit`
function canSkip (strictMode, postpone, passedPercent, postponePercent) {
  return !((postpone && passedPercent <= postponePercent) || strictMode)
}

function isValidKeyboardShortcut (modifier, key) {
  const validModifiers = ['CommandOrControl', 'Alt', 'Shift', 'commandorcontrol', 'alt', 'shift']
  const validKeys = new RegExp(/[a-zA-Z0-9]/g)
  if ((modifier && validModifiers.includes(modifier)) && (key && key.length === 1 && key.match(validKeys))) {
    return true
  }

  // The keyboard shortcut you set in the config.json is not valid. It must be set back to the default "CommandOrControl+X".
  return false
}

function formatKeyboardShortcut (keyboardShortcut) {
  let modifier = keyboardShortcut.split('+')[0]
  let key = keyboardShortcut.split('+')[1]

  if (modifier === 'CommandOrControl') {
    modifier = 'Ctrl/Cmd'
  } else {
    // Capitalize Modifier
    const modifierFirstChar = modifier.charAt(0).toUpperCase()
    const modifierOtherChars = modifier.substr(1)
    modifier = modifierFirstChar.concat(modifierOtherChars)
  }

  // Capitalize Key
  key = key.toUpperCase()

  return modifier + ' + ' + key
}

module.exports = {
  formatTimeRemaining,
  formatTimeIn,
  canPostpone,
  canSkip,
  isValidKeyboardShortcut,
  formatKeyboardShortcut
}
