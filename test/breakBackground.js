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
  document.body.style.backgroundColor = '#ffffff'
  const style = document.createElement('style')
  style.textContent = breakStyles
  document.head.append(style)
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
  it('keeps the existing background when no image is selected', () => {
    applyBreakBackground(null)

    expect(pendingImage).toBe(null)
    expect(document.body.style.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(document.body.style.backgroundImage).toBe('')
    expect(document.body.classList.contains('has-background-image')).toBe(false)
  })

  it('shows the image and dark overlay only after the image loads', () => {
    applyBreakBackground(imageUrl)

    expect(document.body.style.backgroundImage).toBe('')
    expect(document.body.classList.contains('has-background-image')).toBe(false)
    pendingImage.dispatchEvent(new window.Event('load'))

    expect(document.body.style.backgroundImage).toContain('linear-gradient(')
    expect(document.body.style.backgroundImage).toContain(imageUrl)
    expect(document.body.classList.contains('has-background-image')).toBe(true)
    expect(window.getComputedStyle(document.body).backgroundSize).toBe('cover')
    expect(window.getComputedStyle(document.body).backgroundPosition).toBe('50% 50%, 50% 50%')
    expect(window.getComputedStyle(document.body).backgroundRepeat).toBe('no-repeat')
  })

  it('leaves the original background and white theme intact on load failure', () => {
    applyBreakBackground(imageUrl)
    pendingImage.dispatchEvent(new window.Event('error'))

    expect(document.body.style.backgroundImage).toBe('')
    expect(document.body.style.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(document.body.classList.contains('has-background-image')).toBe(false)
    expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(0, 0, 0)')
  })

  it('loads special characters through the URL without adding accessible content', () => {
    applyBreakBackground(imageUrl)

    expect(pendingImage.src).toBe(imageUrl)
    pendingImage.dispatchEvent(new window.Event('load'))

    expect(document.body.style.backgroundImage).toContain(imageUrl)
    expect(document.querySelectorAll('img')).toHaveLength(0)
    expect(document.querySelector('.breaks').textContent).toBe('Take a break')
  })

  it('uses white foreground for photos in the white theme and preserves the health effect', () => {
    document.body.classList.add('break-health-mode')
    document.body.style.setProperty('--break-health-shadow', 'inset 0 0 80px 12px red')
    expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(0, 0, 0)')

    applyBreakBackground(imageUrl)
    pendingImage.dispatchEvent(new window.Event('load'))

    expect(window.getComputedStyle(document.querySelector('.breaks')).color).toBe('rgb(255, 255, 255)')
    expect(document.body.classList.contains('break-health-mode')).toBe(true)
    expect(document.body.style.getPropertyValue('--break-health-shadow')).toBe('inset 0 0 80px 12px red')
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
        expect(pendingImage).not.toBe(null)
        expect(document.body.style.backgroundImage).toBe('')
        expect(document.querySelector('.breaks').style.display).toBe(blank ? 'none' : '')
        pendingImage.dispatchEvent(new window.Event('load'))
        expect(document.body.style.backgroundImage).toContain(imageUrl)
        expect(document.querySelector('.breaks').style.display).toBe(blank ? 'none' : '')
      })
    }
  })
}
