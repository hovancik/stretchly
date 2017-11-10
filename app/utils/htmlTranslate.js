const {remote} = require('electron')
const i18next = remote.require('i18next')
class HtmlTranslate {
  constructor (document) {
    this.document = document
  }

  translate () {
    this.document.querySelectorAll('[data-i18next]').forEach(function (element) {
      if (element.dataset.i18nextOptions) {
        JSON.parse(element.dataset.i18nextOptions)
        element.innerHTML = i18next.t(element.dataset.i18next, JSON.parse(element.dataset.i18nextOptions))
      } else {
        element.innerHTML = i18next.t(element.dataset.i18next)
      }
    })
  }
}

module.exports = HtmlTranslate
