import HtmlTranslate from './utils/htmlTranslate.js'
import { setSameWidths } from './utils/sameWidths.js'
import './platform.js'

window.onload = async (event) => {
  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  const initialSettings = await window.settings.currentSettings()
  renderSettings(initialSettings, true)
  window.settings.onRenderSettings(renderSettings)

  function renderSettings (settings, attachEvents = false) {
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
      radio.checked = settings[radio.name] === value
      if (attachEvents) {
        radio.onchange = (event) => {
          window.settings.saveSetting(radio.name, value)
        }
      }
    })

    document.querySelectorAll('select').forEach(select => {
      select.value = settings[select.name]
      if (attachEvents) {
        select.onchange = (event) => {
          window.settings.saveSetting(select.name, select.value)
        }
      }
    })

    document.querySelectorAll('input[type="range"]').forEach(async range => {
      const divisor = range.dataset.divisor
      const output = range.closest('div').querySelector('output')
      range.value = settings[range.name] / divisor
      const unit = output.dataset.unit
      output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
      if (attachEvents) {
        range.onchange = async event => {
          output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
          window.settings.saveSetting(range.name, range.value * divisor)
        }
        range.oninput = async event => {
          output.innerHTML = await window.i18next.t(`utils.${unit}`, { count: parseInt(range.value) })
        }
      }
    })

    new HtmlTranslate(document).translate()
    setSameWidths()
  }
}
