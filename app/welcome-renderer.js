import HtmlTranslate from './utils/htmlTranslate.js'
import { setSameWidths } from './utils/sameWidths.js'
import './platform.js'

window.onload = async (event) => {
  new HtmlTranslate(document).translate()
  const settings = await window.settings.currentSettings()

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  setTimeout(() => { eventsAttached = true }, 500)
  let eventsAttached = false

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    const imagesWithDarkVersion = document.querySelectorAll('[data-has-dark-version]')
    imagesWithDarkVersion.forEach(image => {
      // replace last occurance https://github.com/electron-userland/electron-builder/issues/5152
      const newSource = image.src.replace(/.([^.]*)$/, '-dark.' + '$1')
      image.src = newSource
    })
  }

  window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
    const imagesWithDarkVersion = document.querySelectorAll('[data-has-dark-version]')
    if (e.matches) {
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

  window.electronAPI.onTranslate(() => {
    new HtmlTranslate(document).translate()
    setSameWidths()
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
    radio.checked = settings[radio.name] === value
    if (!eventsAttached) {
      radio.onchange = (event) => {
        window.settings.saveSettings(radio.name, value)
        setSameWidths()
      }
    }
  })

  document.querySelector('#language').value = settings.language
  document.querySelector('#language').focus()
  if (!eventsAttached) {
    document.querySelector('#language').onchange = (event) => {
      window.settings.saveSettings('language', event.target.value)
    }
  }
  setSameWidths()

  document.querySelectorAll('button').forEach(button => {
    if (!eventsAttached) {
      button.onclick = () => {
        window.settings.saveSettings('isFirstRun', false)
        switch (button.getAttribute('data-location')) {
          case 'tutorial':
            window.electronAPI.openExternal('https://hovancik.net/stretchly/about')
            break
          case 'preferences':
            window.electronAPI.openPreferences()
            break
          default:
            break
        }
        window.electronAPI.closeWindow()
      }
    }
  })
}
