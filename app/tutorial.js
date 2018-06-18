const {remote} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')
const i18next = remote.require('i18next')

document.addEventListener('DOMContentLoaded', event => {
  new HtmlTranslate(document).translate()
  renderTutorialStep(current)
})

let current = 0
const images = [
  './images/tutorial/stretchly_128x128.png',
  './images/tutorial/microbreak.png',
  './images/tutorial/break.png',
  './images/tutorial/notification.png',
  './images/tutorial/tooltip.png',
  './images/tutorial/tray-menu.png',
  './images/tutorial/settings-1.png',
  './images/tutorial/settings-2.png',
  './images/tutorial/settings-3.png',
  './images/tutorial/stretchly_128x128.png'
]

const infos = [
  'welcome',
  'defaults',
  'breaks',
  'notifications',
  'tray1',
  'tray2',
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
