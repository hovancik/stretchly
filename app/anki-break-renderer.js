import HtmlTranslate from './utils/htmlTranslate.js'
import applyBreakHealthEffect from './utils/breakHealthEffect.js'
import './platform.js'

const AUDIO_CONTROLLER_SCRIPT = `
(function () {
  const wrappers = Array.from(document.querySelectorAll('.anki-audio'));
  if (wrappers.length === 0) return;
  const items = [];
  wrappers.forEach(wrap => {
    const audio = wrap.querySelector('audio');
    if (!audio) return;
    audio.removeAttribute('controls');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'anki-audio-btn';
    btn.setAttribute('aria-label', 'Play audio');
    btn.innerHTML = '<span class="anki-audio-icon" aria-hidden="true"></span>';
    wrap.insertBefore(btn, audio);
    const item = { audio, btn };
    items.push(item);

    const stopOthers = () => {
      items.forEach(o => {
        if (o !== item && !o.audio.paused) {
          o.audio.pause();
          o.audio.currentTime = 0;
        }
      });
    };
    btn.addEventListener('click', e => {
      e.preventDefault();
      chainActive = false;
      if (audio.paused) {
        stopOthers();
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
    audio.addEventListener('play', () => {
      stopOthers();
      btn.classList.add('playing');
    });
    audio.addEventListener('pause', () => btn.classList.remove('playing'));
    audio.addEventListener('ended', () => btn.classList.remove('playing'));
  });

  let chainActive = true;
  const chain = idx => {
    if (!chainActive || idx >= items.length) return;
    const { audio } = items[idx];
    const onEnded = () => {
      audio.removeEventListener('ended', onEnded);
      chain(idx + 1);
    };
    audio.addEventListener('ended', onEnded);
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        audio.removeEventListener('ended', onEnded);
        chain(idx + 1);
      });
    }
  };
  chain(0);
})();
`

function buildCardHtml (card, phase, textColor) {
  const body = phase === 'answer' ? card.answer : card.question
  const escapedCss = card.css || ''
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; media-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'unsafe-eval'">
    <base target="_blank">
    <style>
      html, body { margin: 0; padding: 24px; box-sizing: border-box; height: 100%; overflow: auto; color: ${textColor}; }
      body.card { font-family: -apple-system, system-ui, 'Segoe UI', sans-serif; line-height: 1.4; text-align: center; }
      img, video { max-width: 100%; height: auto; }
      hr { border: none; border-top: 1px solid rgba(0,0,0,0.15); margin: 16px 0; }
      .anki-audio {
        display: inline-flex;
        vertical-align: middle;
        margin: 4px 6px;
      }
      .anki-audio audio { display: none; }
      .anki-audio-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(60, 60, 60, 0.35);
        background: rgba(255, 255, 255, 0.95);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        color: #1f1f1f;
        transition: transform 80ms ease, background 120ms ease, box-shadow 120ms ease;
      }
      .anki-audio-btn:hover {
        background: #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      }
      .anki-audio-btn:active { transform: scale(0.94); }
      .anki-audio-btn:focus-visible { outline: 2px solid #4b7bc8; outline-offset: 2px; }
      .anki-audio-icon {
        display: inline-block;
        width: 0;
        height: 0;
        border-top: 7px solid transparent;
        border-bottom: 7px solid transparent;
        border-left: 11px solid currentColor;
        margin-left: 3px;
      }
      .anki-audio-btn.playing .anki-audio-icon {
        width: 10px;
        height: 12px;
        border: none;
        margin-left: 0;
        background:
          linear-gradient(currentColor, currentColor) left / 3px 100% no-repeat,
          linear-gradient(currentColor, currentColor) right / 3px 100% no-repeat;
      }
      ${escapedCss}
    </style>
  </head>
  <body class="card" data-phase="${phase}">${body}<script>${AUDIO_CONTROLLER_SCRIPT}</script></body>
</html>`
}

function encodeDataUri (html) {
  return 'data:text/html;charset=utf-8;base64,' + btoa(unescape(encodeURIComponent(html)))
}

window.onload = async () => {
  new HtmlTranslate(document).translate()

  const bundle = await window.anki.fetchBundle()
  const [startTime, duration, strictMode, postpone, postponePercent, backgroundColor, danger] =
    await window.breaks.sendAnkiBreakData()
  const mainColor = await window.settings.get('mainColor')
  const locale = await window.settings.get('language')
  const breakHealthMode = await window.settings.get('breakHealthMode')

  applyBreakHealthEffect(danger, breakHealthMode, mainColor)
  document.body.classList.add(mainColor.substring(1))
  document.body.style.backgroundColor = backgroundColor

  document.ondragover = e => e.preventDefault()
  document.ondrop = e => e.preventDefault()

  const cards = (bundle && bundle.cards) || []
  const total = cards.length

  const webview = document.querySelector('#card')
  const showAnswerBtn = document.querySelector('#show-answer')
  const rateButtons = document.querySelector('#rate-buttons')
  const progress = document.querySelector('#progress')
  const progressTime = document.querySelector('#progress-time')
  const postponeElement = document.querySelector('#postpone')
  const closeElement = document.querySelector('#close')
  const doneOverlay = document.querySelector('#anki-done')
  const doneCount = doneOverlay.querySelector('.done-count')

  let index = 0
  let phase = 'question'
  let finished = false

  document.querySelector('#close').onclick = () => window.breaks.finishBreak(false)
  document.querySelector('#postpone').onclick = () => window.breaks.postponeBreak()

  document.querySelectorAll('.tiptext').forEach(async tt => {
    const keyboardShortcut = await window.settings.get('endBreakShortcut')
    tt.innerHTML = window.utils.formatKeyboardShortcut(keyboardShortcut)
  })

  function updateProgress () {
    if (total === 0) {
      progress.value = 0
      return
    }
    const phasePartial = phase === 'answer' ? 0.5 : 0
    const done = Math.min(index + phasePartial, total)
    progress.value = progress.max * (done / total)
  }

  function renderCurrent () {
    if (finished) return
    if (!cards[index]) return
    const textColor = window.getComputedStyle(document.body).color || '#222'
    webview.src = encodeDataUri(buildCardHtml(cards[index], phase, textColor))
    if (phase === 'answer') {
      showAnswerBtn.classList.add('hidden')
      rateButtons.classList.remove('hidden')
    } else {
      showAnswerBtn.classList.remove('hidden')
      rateButtons.classList.add('hidden')
    }
    updateProgress()
  }

  function showDone () {
    finished = true
    doneCount.textContent = total === 1
      ? '1 card reviewed'
      : `${total} cards reviewed`
    doneOverlay.classList.remove('hidden')
    showAnswerBtn.classList.add('hidden')
    rateButtons.classList.add('hidden')
    progress.value = progress.max
    setTimeout(() => window.breaks.finishBreak(false), 2500)
  }

  function advance (ease) {
    if (finished) return
    const current = cards[index]
    if (!current) return
    window.anki.rateCard(current.cardId, ease)
    index++
    phase = 'question'
    if (index >= total) {
      showDone()
      return
    }
    renderCurrent()
  }

  showAnswerBtn.onclick = () => {
    if (phase === 'question') {
      phase = 'answer'
      renderCurrent()
    }
  }
  document.querySelector('#rate-again').onclick = () => advance(1)
  document.querySelector('#rate-hard').onclick = () => advance(2)
  document.querySelector('#rate-good').onclick = () => advance(3)
  document.querySelector('#rate-easy').onclick = () => advance(4)

  document.addEventListener('keydown', (event) => {
    if (finished) return
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault()
      if (phase === 'question') {
        phase = 'answer'
        renderCurrent()
      }
      return
    }
    if (phase !== 'answer') return
    if (event.key === '1') advance(1)
    else if (event.key === '2') advance(2)
    else if (event.key === '3') advance(3)
    else if (event.key === '4') advance(4)
  })

  if (total === 0) {
    showDone()
  } else {
    renderCurrent()
  }

  setInterval(async () => {
    const passed = Date.now() - startTime
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
      progressTime.innerHTML = await window.utils.formatTimeRemaining(duration - passed, locale)
    } else {
      progressTime.innerHTML = ''
    }
  }, 100)

  await window.breaks.signalLoaded()
}

export { buildCardHtml, encodeDataUri }
