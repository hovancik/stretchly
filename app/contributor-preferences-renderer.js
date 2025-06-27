import HtmlTranslate from './utils/htmlTranslate.js'
import { setSameWidths } from './utils/sameWidths.js'
import './platform.js'

let eventsAttached = false

window.onload = async (event) => {
  const settings = await window.settings.currentSettings()
  setTimeout(() => { eventsAttached = true }, 500)

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const isNegative = checkbox.classList.contains('negative')
    checkbox.checked = isNegative ? !settings[checkbox.value] : settings[checkbox.value]
    if (!eventsAttached) {
      checkbox.onchange = (event) =>
        window.settings.saveSettings(checkbox.value,
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
        window.settings.saveSettings(radio.name, value)
      }
    }
  })

  document.querySelectorAll('select').forEach(select => {
    select.value = settings[select.name]
    if (!eventsAttached) {
      select.onchange = (event) => {
        window.settings.saveSettings(select.name, select.value)
      }
    }
  })

  document.querySelectorAll('input[type="range"]').forEach(async range => {
    const divisor = range.dataset.divisor
    const output = range.closest('div').querySelector('output')
    range.value = settings[range.name] / divisor
    const unit = output.dataset.unit
    output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
    if (!eventsAttached) {
      range.onchange = async event => {
        output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
        window.settings.saveSettings(range.name, range.value * divisor)
      }
      range.oninput = async event => {
        output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
      }
    }
  })

  new HtmlTranslate(document).translate()
  setSameWidths()
}
