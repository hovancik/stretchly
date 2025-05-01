import { ipcRenderer, shell } from 'electron'
import remote from '@electron/remote'
import HtmlTranslate from './utils/htmlTranslate.js'
import { setSameWidths } from './utils/sameWidths.js'
const htmlTranslate = new HtmlTranslate(document)

window.onload = (e) => {
  import('./platform')
  htmlTranslate.translate()
  ipcRenderer.send('send-settings')
  setSameWidths()
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

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  ipcRenderer.on('translate', (event) => {
    htmlTranslate.translate()
    setSameWidths()
  })

  ipcRenderer.on('renderSettings', (event, settings) => {
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
          ipcRenderer.send('save-setting', radio.name, value)
          setSameWidths()
        }
      }
    })

    document.querySelector('#language').value = settings.language
    document.querySelector('#language').focus()
    if (!eventsAttached) {
      document.querySelector('#language').onchange = (event) => {
        ipcRenderer.send('save-setting', 'language', event.target.value)
      }
    }
    setSameWidths()
  })

  document.querySelectorAll('button').forEach(button => {
    if (!eventsAttached) {
      button.onclick = () => {
        ipcRenderer.send('save-setting', 'isFirstRun', false)
        switch (button.getAttribute('data-location')) {
          case 'tutorial':
            shell.openExternal('https://hovancik.net/stretchly/about')
            break
          case 'preferences':
            ipcRenderer.send('open-preferences')
            break
          default:
            break
        }
        remote.getCurrentWindow().close()
      }
    }
  })
}
