const {remote} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')
const i18next = remote.require('i18next')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
  renderTutorialStep(current)
})

let current = 0
const images = [
  './images/stretchly.png',
  './images/stretchly-microbreak.png',
  './images/stretchly-break.png',
  './images/stretchly-notification.png',
  './images/stretchly-tray-1.png',
  './images/stretchly-tray-2.png',
  './images/stretchly-tray-3.png',
  './images/stretchly-settings-website-1.png',
  './images/stretchly-settings-website-2.png',
  './images/stretchly-settings-website-3.png',
  './images/stretchly.png'
]

const infos = [
  'welcome',
  'microbreaks',
  'breaks',
  'notifications',
  'tray1',
  'tray2',
  'tray3',
  'settings1',
  'settings2',
  'settings3',
  'thanks'
]

let previous = document.querySelector('.previous')
let next = document.querySelector('.next')

previous.addEventListener('click', function (event) {
  event.preventDefault()
  renderTutorialStep(-1)
})

next.addEventListener('click', function (event) {
  event.preventDefault()
  renderTutorialStep(1)
})

function renderTutorialStep (n) {
  current += n
  if (current === images.length - 1) {
    next.style.visibility = 'hidden'
  } else if (current === 0) {
    previous.style.visibility = 'hidden'
  } else {
    next.style.visibility = 'visible'
    previous.style.visibility = 'visible'
  }
  document.querySelector('.tutorial-image img').src = images[current]
  document.querySelector('.tutorial-title').innerHTML = i18next.t(`tutorial.${infos[current]}Title`)
  document.querySelector('.tutorial p').innerHTML = i18next.t(`tutorial.${infos[current]}Text`)
}
