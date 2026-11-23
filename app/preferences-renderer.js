import VersionChecker from './utils/versionChecker.js'
import { setSameWidths } from './utils/sameWidths.js'
import HtmlTranslate from './utils/htmlTranslate.js'

import './platform.js'

const versionChecker = new VersionChecker()

window.onload = async (e) => {
  let versionCheckStarted = false
  const bounds = await window.stretchly.getWindowBounds()
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    const imagesWithDarkVersion = document.querySelectorAll('[data-has-dark-version]')
    imagesWithDarkVersion.forEach(image => {
      // replace last occurance https://github.com/electron-userland/electron-builder/issues/5152
      const newSource = image.src.replace(/.([^.]*)$/, '-dark.' + '$1')
      image.src = newSource
    })
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    const imagesWithDarkVersion = document.querySelectorAll('[data-has-dark-version]')
    if (event.matches) {
      imagesWithDarkVersion.forEach(image => {
        const newSource = image.src.replace(/.([^.]*)$/, '-dark.' + '$1')
        image.src = newSource
      })
    } else {
      imagesWithDarkVersion.forEach(image => {
        const newSource = image.src.replace('-dark.', '.')
        image.src = newSource
      })
    }
  })

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  document.onkeydown = async event => {
    if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
      const [
        reference, timeleft, breaknumber,
        postponesnumber, settingsfile, logsfile, doNotDisturb, imagesfolder, audiofolder
      ] = await window.stretchly.showDebug()
      const debugInfo = document.querySelector('.debug > :first-child')
      if (!debugInfo.classList.contains('hidden')) {
        debugInfo.classList.add('hidden')
      } else {
        debugInfo.classList.remove('hidden')
        document.querySelector('#reference').innerHTML = reference
        document.querySelector('#timeleft').innerHTML = timeleft
        document.querySelector('#breakNumber').innerHTML = breaknumber
        document.querySelector('#postponesNumber').innerHTML = postponesnumber
        document.querySelector('#settingsfile').textContent = settingsfile
        document.querySelector('#logsfile').textContent = logsfile
        document.querySelector('#imagesfolder').textContent = imagesfolder
        document.querySelector('#audiofolder').textContent = audiofolder
        document.querySelector('#donotdisturb').innerHTML = doNotDisturb
        document.querySelector('#node').innerHTML = await window.runtime.node()
        document.querySelector('#chrome').innerHTML = await window.runtime.chrome()
        document.querySelector('#electron').innerHTML = await window.runtime.electron()
        document.querySelector('#platform').innerHTML = await window.runtime.platform()
        document.querySelector('#windowsStore').innerHTML = await window.runtime.windowsStore() || false
        document.querySelector('#windowsPortable').innerHTML = await window.runtime.windowsPortable() || false
      }
      setWindowHeight()
    }
  }

  window.stretchly.onTranslate(async () => {
    renderSettings(await window.settings.currentSettings())
  })

  document.querySelector('.debug button').onclick = async (event) => {
    event.preventDefault()
    const toCopy = document.querySelector('#to-copy')
    await navigator.clipboard.writeText(toCopy.textContent)
    const copiedEl = document.createElement('span')
    copiedEl.innerHTML = ' copied!'
    event.target.parentNode.appendChild(copiedEl)
    setTimeout(() => copiedEl.remove(), 1275)
  }

  document.querySelectorAll('.navigation a').forEach(element => {
    element.onclick = event => {
      event.preventDefault()
      event.target.closest('.navigation').childNodes.forEach(link => {
        if (link.classList) {
          link.classList.remove('active')
        }
      })
      event.target.closest('a').classList.add('active')

      const toBeDisplayed = document.querySelector(`.${event.target.closest('[data-section]').getAttribute('data-section')}`)
      document.querySelectorAll('body > div:not(.custom-message)').forEach(section => {
        if (section !== toBeDisplayed) {
          section.classList.add('hidden')
        } else {
          section.classList.remove('hidden')
        }
      })

      setSameWidths()
      setWindowHeight()
    }
  })

  function renderSettings (settings, attachEvents = false) {
    document.querySelector('#checkNewVersion').closest('div').classList.toggle('hidden', settings.disableAppUpdateFeatures)
    if (!settings.disableAppUpdateFeatures && !versionCheckStarted) {
      versionCheckStarted = true
      const label = document.querySelector('.latest-version')
      versionChecker.latest()
        .then(version => { label.textContent = version.replace('v', '') })
        .catch(exception => {
          console.error(exception)
          label.textContent = 'N/A'
        })
    }
    document.querySelectorAll('[data-strict-mode]').forEach(element => {
      element.classList.toggle('hidden', settings.hideStrictModePreferences)
    })
    document.querySelector('#enablePostponeLong').closest('div').style.marginBottom = settings.hideStrictModePreferences ? '56px' : ''
    document.querySelectorAll('[data-preferences-file]').forEach(element => {
      element.classList.toggle('hidden', settings.hidePreferencesFileLocation)
    })
    const message = document.querySelector('.custom-message')
    message.textContent = settings.customPreferencesMessage
    message.classList.toggle('hidden', !settings.customPreferencesMessage)

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      const isNegative = checkbox.classList.contains('negative')
      checkbox.checked = isNegative ? !settings[checkbox.value] : settings[checkbox.value]
      if (attachEvents) {
        checkbox.onchange = (event) =>
          window.settings.saveSetting(checkbox.value,
            isNegative ? !checkbox.checked : checkbox.checked)
      }
    })

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      let value
      switch (radio.value) {
        case 'true':
          value = true
          break
        case 'false':
          value = false
          break
        default:
          value = radio.value
      }
      const savedValue = settings[radio.name]
      radio.checked = radio.name === 'longBreakColor'
        ? savedValue.toUpperCase() === value
        : savedValue === value
      if (attachEvents) {
        radio.onchange = (event) => {
          window.settings.saveSetting(radio.name, value)
        }
      }
    })

    document.querySelector('#language').value = settings.language
    if (attachEvents) {
      document.querySelector('#language').onchange = (event) => {
        window.settings.saveSetting('language', event.target.value)
      }
    }

    document.querySelector('#trayIconStyle').value = settings.trayIconStyle
    if (attachEvents) {
      document.querySelector('#trayIconStyle').onchange = (event) => {
        window.settings.saveSetting('trayIconStyle', event.target.value)
      }
    }

    document.querySelectorAll('input[type="range"]').forEach(async range => {
      const divisor = range.dataset.divisor
      const output = range.closest('div').querySelector('output')
      range.value = settings[range.name] / divisor
      const unit = output.dataset.unit
      output.innerHTML = await window.utils.formatUnitAndValue(unit, range.value)
      document.querySelector('#longBreakEvery').closest('div').querySelector('output')
        .innerHTML = await window.i18next.t('utils.minutes', { count: parseInt(longBreakIntervalMinutes()) })
      if (attachEvents) {
        range.onchange = async event => {
          output.innerHTML = await window.utils.formatUnitAndValue(unit, range.value)
          document.querySelector('#longBreakEvery').closest('div').querySelector('output')
            .innerHTML = await window.i18next.t('utils.minutes', { count: parseInt(longBreakIntervalMinutes()) })
          window.settings.saveSetting(range.name, range.value * divisor)
        }
        range.oninput = async event => {
          output.innerHTML = await window.utils.formatUnitAndValue(unit, range.value)
          document.querySelector('#longBreakEvery').closest('div').querySelector('output')
            .innerHTML = await window.i18next.t('utils.minutes', { count: parseInt(longBreakIntervalMinutes()) })
        }
      }
    })

    new HtmlTranslate(document).translate()
    setWindowHeight()
  }

  document.querySelectorAll('.sounds img').forEach(preview => {
    preview.onclick = () =>
      window.stretchly.playSound(preview.closest('div').querySelector('input').value)
  })

  setWindowHeight()

  document.querySelectorAll('.enabletype').forEach((element) => {
    element.onclick = async (event) => {
      const enabletypeChecked = document.querySelectorAll('.enabletype:checked')
      if (enabletypeChecked.length === 0) {
        element.checked = true
        window.settings.saveSetting(element.value, element.checked)
        window.alert(await window.i18next.t('preferences.schedule.cantDisableBoth'))
      }
    }
  })

  document.querySelector('.settings > div > button').onclick = (event) => {
    window.stretchly.restoreDefaults()
  }

  document.querySelectorAll('.about a').forEach((item) => {
    item.onclick = (event) => {
      event.preventDefault()
      if (event.target.classList.contains('file')) {
        window.electronApi.openPath(event.target.textContent)
      } else {
        window.electronApi.openExternal(event.target.href)
      }
    }
  })

  document.querySelector('[name="supportStretchly"]').onclick = () => {
    window.electronApi.openExternal('https://hovancik.net/stretchly/sponsor')
  }

  const initialSettings = await window.settings.currentSettings()
  renderSettings(initialSettings, true)
  window.settings.onRenderSettings(renderSettings)

  document.querySelector('.version').innerHTML = await window.stretchly.getVersion()

  function setWindowHeight () {
    const classes = document.querySelector('body').classList
    const scrollHeight = document.querySelector('body').scrollHeight
    const availHeight = window.screen.availHeight
    let height = null
    if (classes.contains('win32')) {
      if (scrollHeight + 40 > availHeight) {
        height = availHeight
      } else {
        height = scrollHeight + 40
      }
    } else {
      if (scrollHeight + 32 > availHeight) {
        height = availHeight
      } else {
        height = scrollHeight + 32
      }
    }
    if (height) {
      window.stretchly.setWindowSize(bounds.width, height)
    }
  }

  function longBreakIntervalMinutes () {
    const miniBreakInterval = document.querySelector('#miniBreakEvery').value * 1
    const longBreakInterval = document.querySelector('#longBreakEvery').value * 1
    return miniBreakInterval * (longBreakInterval + 1)
  }
}
