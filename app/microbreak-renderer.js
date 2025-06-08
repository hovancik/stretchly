import HtmlTranslate from './utils/htmlTranslate.js'
import './platform.js'

window.onload = async (event) => {
  const [idea, started, duration, strictMode, postpone,
    postponePercent, backgroundColor] = await window.breaks.sendBreakData()

  new HtmlTranslate(document).translate()

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  document.querySelector('#close').onclick = async event =>
    await window.breaks.finishBreak()

  document.querySelector('#postpone').onclick = async event =>
    await window.breaks.postponeBreak()

  document.querySelector('.microbreak-idea').textContent = idea

  const progress = document.querySelector('#progress')
  const progressTime = document.querySelector('#progress-time')
  const postponeElement = document.querySelector('#postpone')
  const closeElement = document.querySelector('#close')
  const mainColor = await window.settings.get('mainColor')
  document.body.classList.add(mainColor.substring(1))
  document.body.style.backgroundColor = backgroundColor

  document.querySelectorAll('.tiptext').forEach(async tt => {
    const keyboardShortcut = await window.settings.get('endBreakShortcut')
    tt.innerHTML = await window.utils.formatKeyboardShortcut(keyboardShortcut)
  })

  window.setInterval(async () => {
    if (await window.settings.get('currentTimeInBreaks')) {
      document.querySelector('.breaks > :last-child').innerHTML =
      (new Date()).toLocaleTimeString()
    }
    if (Date.now() - started < duration) {
      const passedPercent = (Date.now() - started) / duration * 100
      postponeElement.style.display =
        await window.utils.canPostpone(postpone, passedPercent, postponePercent) ? 'flex' : 'none'
      closeElement.style.display =
        await window.utils.canSkip(strictMode, postpone, passedPercent, postponePercent) ? 'flex' : 'none'
      progress.value = (100 - passedPercent) * progress.max / 100
      progressTime.innerHTML = await window.utils.formatTimeRemaining(Math.trunc(duration - Date.now() + started),
        await window.settings.get('language'))
    }
  }, 100)
  await window.breaks.signalLoaded()
}
