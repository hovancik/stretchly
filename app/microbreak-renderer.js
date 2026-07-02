import HtmlTranslate from './utils/htmlTranslate.js'
import applyBreakHealthEffect from './utils/breakHealthEffect.js'
import createRunOnce from './utils/runOnce.js'
import './platform.js'

window.onload = async (event) => {
  const [idea, started, duration, strictMode, postpone,
    postponePercent, backgroundColor, danger, breakHealthMode] = await window.breaks.sendBreakData()

  document.ondragover = event =>
    event.preventDefault()

  document.ondrop = event =>
    event.preventDefault()

  if (new URLSearchParams(window.location.search).get('blank') === '1') {
    document.body.style.backgroundColor = backgroundColor
    document.querySelector('.breaks').style.display = 'none'
    await window.breaks.signalLoaded()
    return
  }

  const mainColor = await window.settings.get('mainColor')

  new HtmlTranslate(document).translate()
  applyBreakHealthEffect(danger, breakHealthMode, mainColor)

  const runOnce = createRunOnce()

  document.querySelector('#close').onclick = runOnce(() => window.breaks.finishBreak(manualAwaiting))

  document.querySelector('#postpone').onclick = runOnce(() => window.breaks.postponeBreak())

  document.querySelector('.microbreak-idea').innerHTML = window.breaks.sanitizeIdea(idea)

  document.querySelectorAll('.microbreak-idea a').forEach(a => {
    a.onclick = (event) => {
      event.preventDefault()
      window.electronApi.openExternal(a.href)
    }
  })

  document.querySelectorAll('.microbreak-idea img').forEach(async img => {
    const src = img.getAttribute('src') || ''
    const resolved = await window.electronApi.resolveLocalImage(src)
    if (resolved) {
      img.src = resolved
    } else {
      img.remove()
    }
  })

  const progress = document.querySelector('#progress')
  const progressTime = document.querySelector('#progress-time')
  const postponeElement = document.querySelector('#postpone')
  const closeElement = document.querySelector('#close')
  const manualFinishElement = document.querySelector('#finish')
  document.body.classList.add(mainColor.substring(1))
  document.body.style.backgroundColor = backgroundColor

  document.querySelectorAll('.tiptext').forEach(async tt => {
    const keyboardShortcut = await window.settings.get('endBreakShortcut')
    tt.innerHTML = window.utils.formatKeyboardShortcut(keyboardShortcut)
  })

  let manualAwaiting = false

  const locale = await window.settings.get('language')
  const showCurrentTime = await window.settings.get('currentTimeInBreaks')
  const currentTimeElement = showCurrentTime ? document.querySelector('.breaks > :last-child') : null

  manualFinishElement.onclick = runOnce(() => window.breaks.finishBreak(manualAwaiting))

  let lastShownSecond = null

  setInterval(async () => {
    if (showCurrentTime) {
      currentTimeElement.innerHTML = (new Date()).toLocaleTimeString()
    }
    const now = Date.now()
    const passed = now - started
    const currentSecond = Math.floor(passed / 1000)
    const secondChanged = currentSecond !== lastShownSecond
    lastShownSecond = currentSecond
    if (!manualAwaiting) {
      if (passed < duration) {
        const passedPercent = passed / duration * 100
        if (window.utils.canPostpone(postpone, passedPercent, postponePercent)) {
          postponeElement.classList.remove('hidden')
        } else {
          postponeElement.classList.add('hidden')
        }
        if (window.utils.canSkip(strictMode, postpone, passedPercent, postponePercent)) {
          closeElement.classList.remove('hidden')
        } else {
          closeElement.classList.add('hidden')
        }
        progress.value = (100 - passedPercent) * progress.max / 100
        if (secondChanged) {
          progressTime.innerHTML = await window.utils.formatTimeRemaining(duration - passed, locale)
        }
      }
    } else {
      if (secondChanged) {
        progressTime.innerHTML = await window.utils.formatElapsedDuration(passed, locale)
      }
    }
  }, 100)

  window.breaks.onEnterManualAwait(async (which) => {
    if (which !== 'microbreak' || manualAwaiting) return
    manualAwaiting = true
    progress.value = 0
    progressTime.classList.remove('hidden')
    postponeElement.classList.add('hidden')
    closeElement.classList.add('hidden')
    manualFinishElement.classList.remove('hidden')
    progressTime.innerHTML = await window.utils.formatElapsedDuration(Date.now() - started, locale)
  })

  await window.breaks.signalLoaded()
}
