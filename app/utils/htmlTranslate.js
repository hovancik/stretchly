class HtmlTranslate {
  constructor (document) {
    this.document = document
  }

  async translate () {
    this.document.querySelectorAll('[data-i18next]').forEach(async function (element) {
      if (element.dataset.i18nextOptions) {
        JSON.parse(element.dataset.i18nextOptions)
        element.innerHTML = await window.i18next.t(element.dataset.i18next, JSON.parse(element.dataset.i18nextOptions))
      } else {
        element.innerHTML = await window.i18next.t(element.dataset.i18next)
      }
    })
    this.document.body.dir = await window.i18next.dir()
  }
}

export default HtmlTranslate
