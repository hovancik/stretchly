import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'path'

const MAX_ENTRIES = 500

export default class AnkiRetryQueue {
  constructor ({ filePath }) {
    this.filePath = filePath
    this.entries = this._load()
  }

  _load () {
    if (!existsSync(this.filePath)) return []
    try {
      const raw = readFileSync(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  _persist () {
    const dir = dirname(this.filePath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(this.filePath, JSON.stringify(this.entries), 'utf8')
  }

  size () {
    return this.entries.length
  }

  enqueue ({ cardId, ease }) {
    this.entries.push({ cardId, ease, reviewedAt: Date.now() })
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - MAX_ENTRIES)
    }
    this._persist()
  }

  async flush (client) {
    if (this.entries.length === 0) return { flushed: 0, remaining: 0 }
    const batch = this.entries.map(e => ({ cardId: e.cardId, ease: e.ease }))
    try {
      await client.answerCards(batch)
      const flushed = this.entries.length
      this.entries = []
      this._persist()
      return { flushed, remaining: 0 }
    } catch {
      return { flushed: 0, remaining: this.entries.length }
    }
  }
}
