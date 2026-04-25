export class AnkiUnavailableError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AnkiUnavailableError'
  }
}

export class AnkiRpcError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AnkiRpcError'
  }
}

const SOUND_TAG_RE = /\[sound:([^\]]+)\]/g
const ANKI_PLAY_RE = /\[anki:play:([qa]):(\d+)\]/g
const ANKI_TTS_RE = /\[anki:tts[^\]]*\]/g
const IMG_SRC_RE = /<img\b[^>]*\bsrc\s*=\s*(['"])([^'"]+)\1[^>]*>/gi

function extractSoundsFromFields (fields) {
  if (!fields) return []
  const entries = Object.entries(fields).sort((a, b) => {
    const ao = a[1] && typeof a[1].order === 'number' ? a[1].order : 0
    const bo = b[1] && typeof b[1].order === 'number' ? b[1].order : 0
    return ao - bo
  })
  const sounds = []
  for (const [, field] of entries) {
    const value = (field && field.value) || ''
    for (const match of value.matchAll(SOUND_TAG_RE)) {
      sounds.push(match[1])
    }
  }
  return sounds
}

function audioElement (src) {
  return `<span class="anki-audio" data-anki-audio><audio preload="auto" src="${src}"></audio></span>`
}

function mimeForExtension (filename) {
  const dot = filename.lastIndexOf('.')
  const ext = dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
  switch (ext) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'gif': return 'image/gif'
    case 'webp': return 'image/webp'
    case 'svg': return 'image/svg+xml'
    case 'bmp': return 'image/bmp'
    case 'mp3': return 'audio/mpeg'
    case 'ogg': return 'audio/ogg'
    case 'oga': return 'audio/ogg'
    case 'opus': return 'audio/ogg'
    case 'wav': return 'audio/wav'
    case 'm4a': return 'audio/mp4'
    case 'aac': return 'audio/aac'
    case 'flac': return 'audio/flac'
    case 'webm': return 'audio/webm'
    default: return 'application/octet-stream'
  }
}

export default class AnkiClient {
  constructor ({ endpoint = 'http://localhost:8765', timeoutMs = 3000 } = {}) {
    this.endpoint = endpoint
    this.timeoutMs = timeoutMs
  }

  async _invoke (action, params = {}) {
    let response
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify({ action, version: 6, params }),
        signal: AbortSignal.timeout(this.timeoutMs)
      })
    } catch (err) {
      throw new AnkiUnavailableError(`AnkiConnect request failed: ${err.message}`)
    }
    if (!response.ok) {
      throw new AnkiUnavailableError(`AnkiConnect HTTP ${response.status}`)
    }
    const body = await response.json()
    if (body.error) throw new AnkiRpcError(body.error)
    return body.result
  }

  async isAvailable () {
    try {
      const version = await this._invoke('version')
      return typeof version === 'number' && version >= 6
    } catch {
      return false
    }
  }

  async getDecks () {
    const decks = await this._invoke('deckNames')
    return Array.isArray(decks) ? decks : []
  }

  async findDueCards (deckName, limit) {
    const query = `deck:"${deckName}" is:due`
    const ids = await this._invoke('findCards', { query })
    if (!Array.isArray(ids) || ids.length === 0) return []
    const shuffled = ids.slice()
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, limit)
  }

  async findLearningAheadCards (deckName, limit) {
    const query = `deck:"${deckName}" prop:due<=0.25`
    const ids = await this._invoke('findCards', { query })
    return Array.isArray(ids) ? ids.slice(0, limit) : []
  }

  async findNewCards (deckName, limit) {
    const query = `deck:"${deckName}" is:new`
    const ids = await this._invoke('findCards', { query })
    return Array.isArray(ids) ? ids.slice(0, limit) : []
  }

  async prepareCards (cardIds) {
    if (!cardIds || cardIds.length === 0) return []
    const infos = await this._invoke('cardsInfo', { cards: cardIds })
    const prepared = []
    for (const info of infos || []) {
      const audioMap = {}
      let question = info.question || ''
      let answer = info.answer || ''

      question = await this._inlineImages(question)
      answer = await this._inlineImages(answer)

      const fieldSounds = extractSoundsFromFields(info.fields)
      const inlineSounds = []
      for (const m of (question + ' ' + answer).matchAll(SOUND_TAG_RE)) inlineSounds.push(m[1])
      const allSounds = [...new Set([...fieldSounds, ...inlineSounds])]

      for (const name of allSounds) {
        try {
          const base64 = await this._invoke('retrieveMediaFile', { filename: name })
          if (typeof base64 === 'string' && base64.length > 0) {
            audioMap[name] = `data:${mimeForExtension(name)};base64,${base64}`
          }
        } catch {
          // best-effort — missing media is stripped below
        }
      }

      question = this._substituteAudio(question, 'question', fieldSounds, audioMap)
      answer = this._substituteAudio(answer, 'answer', fieldSounds, audioMap)

      // Drop unsupported TTS placeholders rather than leave raw text in the render.
      question = question.replace(ANKI_TTS_RE, '')
      answer = answer.replace(ANKI_TTS_RE, '')

      prepared.push({
        cardId: info.cardId,
        question,
        answer,
        css: info.css || '',
        audioMap
      })
    }
    return prepared
  }

  _substituteAudio (html, _side, fieldSounds, audioMap) {
    // `[anki:play:q:N]` and `[anki:play:a:N]` are placeholders that Anki 2.1.50+
    // inserts when rendering a card. N counts audio occurrences within the side.
    // Typical card templates put question-side sounds first in field order, then
    // answer-side sounds, so we map q:N → fieldSounds[N], a:N → fieldSounds[questionCount + N].
    const questionPlayCount = (html.match(/\[anki:play:q:\d+\]/g) || []).length
    html = html.replace(ANKI_PLAY_RE, (_, playSide, idxStr) => {
      const idx = parseInt(idxStr, 10)
      const offset = playSide === 'a' ? questionPlayCount : 0
      const name = fieldSounds[offset + idx]
      const src = name && audioMap[name]
      if (!src) return ''
      return audioElement(src)
    })
    // Fall back to legacy `[sound:*]` pattern for older Anki builds.
    html = html.replace(SOUND_TAG_RE, (_, name) => {
      const src = audioMap[name]
      if (!src) return ''
      return audioElement(src)
    })
    return html
  }

  async _inlineImages (html) {
    const matches = []
    html.replace(IMG_SRC_RE, (full, quote, src) => {
      matches.push({ full, src })
      return full
    })
    for (const match of matches) {
      if (match.src.startsWith('data:') || match.src.startsWith('http')) continue
      try {
        const base64 = await this._invoke('retrieveMediaFile', { filename: match.src })
        if (typeof base64 === 'string' && base64.length > 0) {
          const dataUri = `data:${mimeForExtension(match.src)};base64,${base64}`
          html = html.split(match.full).join(match.full.replace(match.src, dataUri))
        } else {
          html = html.split(match.full).join('')
        }
      } catch {
        html = html.split(match.full).join('')
      }
    }
    return html
  }

  async answerCards (entries) {
    if (!entries || entries.length === 0) return true
    const result = await this._invoke('answerCards', { answers: entries })
    return Array.isArray(result) ? result.every(Boolean) : !!result
  }

  async guiDeckBrowser () {
    try {
      await this._invoke('guiDeckBrowser')
      return true
    } catch {
      return false
    }
  }
}
