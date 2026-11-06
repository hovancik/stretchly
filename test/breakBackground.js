import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { readFileSync } from 'node:fs'
import applyBreakBackground from '../app/utils/breakBackground.js'

const breakStyles = readFileSync(new URL('../app/css/break.css', import.meta.url), 'utf8')
const imageUrl = "file:///C:/Pictures/John's%20%E5%B1%B1%E6%9E%97%23%25.png"
let dom
let pendingImage

beforeEach(async () => {
  dom = new JSDOM('<body class="ffffff"><div class="breaks">Take a break</div></body>', {
    url: 'file:///app/miniBreak.html'
  })
  await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }))
  vi.stubGlobal('window', dom.window)
  vi.stubGlobal('document', dom.window.document)
  vi.stubGlobal('__electronLog', { error: vi.fn() })
  document.body.style.backgroundColor = '#ffffff'
  pendingImage = null
  const createElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = createElement(tag, options)
    if (tag === 'img') pendingImage = element
    return element
  })
})

afterEach(() => {
  dom.window.close()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('break background', () => {
  it('logs load failure and leaves the original background and white theme intact', () => {
    const style = document.createElement('style')
    style.textContent = breakStyles
    document.head.append(style)
    applyBreakBackground(imageUrl)
    pendingImage.dispatchEvent(new window.Event('error'))

    expect(__electronLog.error).toHaveBeenCalledWith('Stretchly: could not load break background image', imageUrl)
    expect(document.body.style.backgroundImage).toBe('')
    expect(document.body.style.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(0, 0, 0)')
  })
})

for (const [type, loadRenderer] of [
  ['miniBreak', () => import('../app/miniBreak-renderer.js')],
  ['longBreak', () => import('../app/longBreak-renderer.js')]
]) {
  describe(`${type} background integration`, () => {
    for (const blank of [false, true]) {
      it(`does not delay the ${blank ? 'blank' : 'normal'} break while the image loads`, async () => {
        vi.useFakeTimers()
        vi.resetModules()
        document.documentElement.innerHTML = readFileSync(new URL(`../app/${type}.html`, import.meta.url), 'utf8')
        const style = document.createElement('style')
        style.textContent = breakStyles
        document.head.append(style)
        dom.reconfigure({ url: `file:///app/${type}.html${blank ? '?blank=1' : ''}` })
        window.runtime = { platform: () => 'win32', windowsStore: () => false, windowsPortable: () => false }
        window.breaks = {
          sendBreakData: async () => [type === 'miniBreak' ? 'Stretch' : ['Stretch', 'Look away'], Date.now(), 20000, false, false, 0, '#ffffff', 0, false, imageUrl],
          signalLoaded: vi.fn(async () => {}),
          sanitizeIdea: idea => idea,
          onEnterManualAwait: vi.fn(),
          onPostponeRequest: vi.fn(),
          onSkipRequest: vi.fn(),
          onFinishRequest: vi.fn()
        }
        window.settings = { get: async key => ({ miniBreakColor: '#ffffff', longBreakColor: '#ffffff', language: 'en' })[key] }
        window.i18next = { t: async key => key, dir: async () => 'ltr' }
        window.utils = { formatKeyboardShortcut: () => '' }

        await loadRenderer()
        await window.onload()

        expect(window.breaks.signalLoaded).toHaveBeenCalledOnce()
        expect(pendingImage.src).toBe(imageUrl)
        expect(document.body.style.backgroundImage).toBe('')
        expect(document.querySelector('.breaks').style.display).toBe(blank ? 'none' : '')
        if (!blank) {
          expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(0, 0, 0)')
        }
        pendingImage.dispatchEvent(new window.Event('load'))
        expect(document.body.style.backgroundImage).toContain(imageUrl)
        expect(document.querySelector('.breaks').style.display).toBe(blank ? 'none' : '')
        if (!blank) {
          expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(255, 255, 255)')
        }
      })
    }
  })
}
