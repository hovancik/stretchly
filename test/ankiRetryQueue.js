import { expect } from 'chai'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'path'
import AnkiRetryQueue from '../app/utils/ankiRetryQueue.js'

function makeTempPath () {
  const dir = mkdtempSync(join(tmpdir(), 'anki-queue-'))
  return { dir, filePath: join(dir, 'q.json') }
}

describe('AnkiRetryQueue', () => {
  describe('enqueue', () => {
    it('persists entries across reloads', () => {
      const { dir, filePath } = makeTempPath()
      try {
        const q1 = new AnkiRetryQueue({ filePath })
        q1.enqueue({ cardId: 1, ease: 3 })
        q1.enqueue({ cardId: 2, ease: 4 })
        expect(q1.size()).to.equal(2)

        const q2 = new AnkiRetryQueue({ filePath })
        expect(q2.size()).to.equal(2)
        expect(q2.entries[0].cardId).to.equal(1)
        expect(q2.entries[1].cardId).to.equal(2)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })

    it('caps at MAX_ENTRIES and drops oldest', () => {
      const { dir, filePath } = makeTempPath()
      try {
        const q = new AnkiRetryQueue({ filePath })
        for (let i = 0; i < 550; i++) q.enqueue({ cardId: i, ease: 3 })
        expect(q.size()).to.equal(500)
        expect(q.entries[0].cardId).to.equal(50)
        expect(q.entries[499].cardId).to.equal(549)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })
  })

  describe('flush', () => {
    it('drains on success and persists empty state', async () => {
      const { dir, filePath } = makeTempPath()
      try {
        const q = new AnkiRetryQueue({ filePath })
        q.enqueue({ cardId: 1, ease: 3 })
        q.enqueue({ cardId: 2, ease: 1 })
        const client = { answerCards: async () => true }
        const result = await q.flush(client)
        expect(result).to.deep.equal({ flushed: 2, remaining: 0 })
        expect(q.size()).to.equal(0)

        const persisted = JSON.parse(readFileSync(filePath, 'utf8'))
        expect(persisted).to.deep.equal([])
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })

    it('leaves entries intact when answerCards throws', async () => {
      const { dir, filePath } = makeTempPath()
      try {
        const q = new AnkiRetryQueue({ filePath })
        q.enqueue({ cardId: 99, ease: 2 })
        const client = { answerCards: async () => { throw new Error('down') } }
        const result = await q.flush(client)
        expect(result.flushed).to.equal(0)
        expect(result.remaining).to.equal(1)
        expect(q.size()).to.equal(1)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })

    it('returns 0 flushed when empty', async () => {
      const { dir, filePath } = makeTempPath()
      try {
        const q = new AnkiRetryQueue({ filePath })
        const client = { answerCards: async () => { throw new Error('should not call') } }
        const result = await q.flush(client)
        expect(result).to.deep.equal({ flushed: 0, remaining: 0 })
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })
  })
})
