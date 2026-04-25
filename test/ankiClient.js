import { vi } from 'vitest'
import { expect } from 'chai'
import AnkiClient, { AnkiUnavailableError, AnkiRpcError } from '../app/utils/ankiClient.js'

function mockResponse (body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) }
}

describe('AnkiClient', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  describe('isAvailable', () => {
    it('returns true when version is 6+', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: 6, error: null }))
      const client = new AnkiClient({})
      expect(await client.isAvailable()).to.equal(true)
    })

    it('returns false on network failure', async () => {
      globalThis.fetch.mockRejectedValue(new Error('ECONNREFUSED'))
      const client = new AnkiClient({})
      expect(await client.isAvailable()).to.equal(false)
    })

    it('returns false on RPC error', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: null, error: 'nope' }))
      const client = new AnkiClient({})
      expect(await client.isAvailable()).to.equal(false)
    })
  })

  describe('getDecks', () => {
    it('returns deck names', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: ['A', 'B'], error: null }))
      const client = new AnkiClient({})
      expect(await client.getDecks()).to.deep.equal(['A', 'B'])
    })

    it('throws AnkiUnavailableError when network fails', async () => {
      globalThis.fetch.mockRejectedValue(new Error('boom'))
      const client = new AnkiClient({})
      try {
        await client.getDecks()
        throw new Error('should have thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(AnkiUnavailableError)
      }
    })
  })

  describe('findDueCards', () => {
    it('queries with is:due and limits results', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: [1, 2, 3, 4, 5], error: null }))
      const client = new AnkiClient({})
      const ids = await client.findDueCards('MyDeck', 2)
      expect(ids).to.have.lengthOf(2)
      expect(ids.every(n => [1, 2, 3, 4, 5].includes(n))).to.equal(true)

      const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
      expect(body.action).to.equal('findCards')
      expect(body.params.query).to.equal('deck:"MyDeck" is:due')
    })

    it('returns empty on no results', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: [], error: null }))
      const client = new AnkiClient({})
      expect(await client.findDueCards('Empty', 3)).to.deep.equal([])
    })
  })

  describe('prepareCards', () => {
    it('rewrites [sound:…] and <img src=…> to data URIs', async () => {
      const infos = [{
        cardId: 42,
        question: '<p>Q</p><img src="pic.png"> [sound:a.mp3]',
        answer: '<p>A</p>',
        css: '.card { color: red; }',
        fields: {}
      }]
      globalThis.fetch.mockImplementation((_url, opts) => {
        const body = JSON.parse(opts.body)
        if (body.action === 'cardsInfo') return Promise.resolve(mockResponse({ result: infos, error: null }))
        if (body.action === 'retrieveMediaFile') {
          return Promise.resolve(mockResponse({ result: 'BASE64DATA', error: null }))
        }
        return Promise.resolve(mockResponse({ result: null, error: null }))
      })
      const client = new AnkiClient({})
      const [card] = await client.prepareCards([42])
      expect(card.cardId).to.equal(42)
      expect(card.question).to.include('data:image/png;base64,BASE64DATA')
      expect(card.question).to.include('<audio')
      expect(card.question).to.include('data:audio/mpeg;base64,BASE64DATA')
      expect(card.question).to.include('class="anki-audio"')
      expect(card.css).to.equal('.card { color: red; }')
    })

    it('resolves [anki:play:q:N] and [anki:play:a:N] via field-sourced sounds', async () => {
      const infos = [{
        cardId: 7,
        question: 'Hello [anki:play:q:0]',
        answer: 'Hello [anki:play:q:0]<hr>Hola [anki:play:a:0]',
        css: '',
        fields: {
          Front: { value: 'Hello [sound:hello.mp3]', order: 0 },
          Back: { value: 'Hola [sound:hola.mp3]', order: 1 }
        }
      }]
      const responses = {
        'hello.mp3': 'AAAA',
        'hola.mp3': 'BBBB'
      }
      globalThis.fetch.mockImplementation((_url, opts) => {
        const body = JSON.parse(opts.body)
        if (body.action === 'cardsInfo') return Promise.resolve(mockResponse({ result: infos, error: null }))
        if (body.action === 'retrieveMediaFile') {
          return Promise.resolve(mockResponse({ result: responses[body.params.filename] || '', error: null }))
        }
        return Promise.resolve(mockResponse({ result: null, error: null }))
      })
      const client = new AnkiClient({})
      const [card] = await client.prepareCards([7])
      expect(card.question).to.include('data:audio/mpeg;base64,AAAA')
      expect(card.question).to.not.include('[anki:play')
      expect(card.answer).to.include('data:audio/mpeg;base64,AAAA')
      expect(card.answer).to.include('data:audio/mpeg;base64,BBBB')
      expect(card.answer).to.not.include('[anki:play')
    })

    it('strips [anki:tts ...] placeholders', async () => {
      const infos = [{
        cardId: 8,
        question: '[anki:tts en_US voices=Apple_Alex:Hello]text',
        answer: '',
        css: '',
        fields: {}
      }]
      globalThis.fetch.mockImplementation((_url, opts) => {
        const body = JSON.parse(opts.body)
        if (body.action === 'cardsInfo') return Promise.resolve(mockResponse({ result: infos, error: null }))
        return Promise.resolve(mockResponse({ result: null, error: null }))
      })
      const client = new AnkiClient({})
      const [card] = await client.prepareCards([8])
      expect(card.question).to.equal('text')
    })

    it('strips missing media rather than failing the card', async () => {
      const infos = [{ cardId: 7, question: '<img src="gone.png"> text', answer: '', css: '' }]
      globalThis.fetch.mockImplementation((_url, opts) => {
        const body = JSON.parse(opts.body)
        if (body.action === 'cardsInfo') return Promise.resolve(mockResponse({ result: infos, error: null }))
        if (body.action === 'retrieveMediaFile') return Promise.resolve(mockResponse({ result: null, error: 'missing' }))
        return Promise.resolve(mockResponse({ result: null, error: null }))
      })
      const client = new AnkiClient({})
      const [card] = await client.prepareCards([7])
      expect(card.question).to.equal(' text')
    })
  })

  describe('answerCards', () => {
    it('posts batch and resolves to true on success', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: [true, true], error: null }))
      const client = new AnkiClient({})
      const ok = await client.answerCards([{ cardId: 1, ease: 3 }, { cardId: 2, ease: 4 }])
      expect(ok).to.equal(true)
      const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
      expect(body.action).to.equal('answerCards')
      expect(body.params.answers).to.deep.equal([{ cardId: 1, ease: 3 }, { cardId: 2, ease: 4 }])
    })

    it('throws AnkiRpcError when Anki returns error', async () => {
      globalThis.fetch.mockResolvedValue(mockResponse({ result: null, error: 'bad card' }))
      const client = new AnkiClient({})
      try {
        await client.answerCards([{ cardId: 1, ease: 1 }])
        throw new Error('should have thrown')
      } catch (err) {
        expect(err).to.be.instanceOf(AnkiRpcError)
      }
    })
  })
})
