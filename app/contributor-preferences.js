const { ipcRenderer } = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')
const { setSameWidths } = require('./utils/sameWidths')
const remote = require('@electron/remote')
const i18next = remote.require('i18next')

const htmlTranslate = new HtmlTranslate(document)
let eventsAttached = false

window.onload = (event) => {
  require('./platform')
  ipcRenderer.send('send-settings')
  htmlTranslate.translate()
  setTimeout(() => { eventsAttached = true }, 500)

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  ipcRenderer.on('renderSettings', (event, settings) => {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      const isNegative = checkbox.classList.contains('negative')
      checkbox.checked = isNegative ? !settings[checkbox.value] : settings[checkbox.value]
      if (!eventsAttached) {
        checkbox.onchange = (event) =>
          ipcRenderer.send('save-setting', checkbox.value,
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
      radio.checked = settings[radio.name] === value
      if (!eventsAttached) {
        radio.onchange = (event) => {
          ipcRenderer.send('save-setting', radio.name, value)
        }
      }
    })

    document.querySelectorAll('select').forEach(select => {
      select.value = settings[select.name]
      if (!eventsAttached) {
        select.onchange = (event) => {
          ipcRenderer.send('save-setting', select.name, select.value)
        }
      }
    })

    document.querySelectorAll('input[type="range"]').forEach(range => {
      const divisor = range.dataset.divisor
      const output = range.closest('div').querySelector('output')
      range.value = settings[range.name] / divisor
      const unit = output.dataset.unit
      output.innerHTML = i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
      if (!eventsAttached) {
        range.onchange = event => {
          output.innerHTML = i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
          ipcRenderer.send('save-setting', range.name, range.value * divisor)
        }
        range.oninput = event => {
          output.innerHTML = i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
        }
      }
    })

    htmlTranslate.translate()
    setSameWidths()
  })
}
