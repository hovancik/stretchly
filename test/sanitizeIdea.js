import 'chai/register-should'
import { beforeAll, describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'

let sanitizeIdea
let documentRef

describe('sanitizeIdea', () => {
  beforeAll(async () => {
    const { window } = new JSDOM('', { url: 'https://example.com' })
    global.window = window
    global.document = window.document
    global.Node = window.Node
    documentRef = window.document
    sanitizeIdea = (await import('../app/utils/sanitizeIdea.js')).default
  })

  it('keeps allowed markup intact', () => {
    const input = '<p>Take a <a href="https://stretchly.net" title="link">break</a></p>'
    const result = sanitizeIdea(input)
    const wrapper = documentRef.createElement('div')
    wrapper.innerHTML = result
    const anchor = wrapper.querySelector('a')
    anchor.should.not.equal(null)
    anchor.getAttribute('href').should.equal('https://stretchly.net')
    anchor.getAttribute('title').should.equal('link')
    wrapper.textContent.should.equal('Take a break')
  })

  it('strips disallowed elements and protocols', () => {
    const input = '<p>Stretch</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
    const result = sanitizeIdea(input)
    const wrapper = documentRef.createElement('div')
    wrapper.innerHTML = result
    expect(wrapper.querySelector('script')).toBe(null)
    const anchor = wrapper.querySelector('a')
    expect(anchor).not.toBe(null)
    expect(anchor?.getAttribute('href')).toBe(null)
    anchor.textContent.should.equal('bad')
  })

  it('keeps images with allowed filenames and strips disallowed ones', () => {
    const input = '<p><img src="photo.png" width="200"><img src="unsupported.svg"></p>'
    const result = sanitizeIdea(input)
    const wrapper = documentRef.createElement('div')
    wrapper.innerHTML = result
    const imgs = [...wrapper.querySelectorAll('img')]
    expect(imgs).toHaveLength(1)
    imgs[0].getAttribute('src').should.equal('photo.png')
    imgs[0].getAttribute('width').should.equal('200')
  })

  it('removes images that point to remote locations', () => {
    const input = '<p><img src="https://example.com/photo.png"></p>'
    const result = sanitizeIdea(input)
    const wrapper = documentRef.createElement('div')
    wrapper.innerHTML = result
    const imgs = [...wrapper.querySelectorAll('img')]
    expect(imgs).toHaveLength(0)
  })

  it('normalizes non-string or empty values to empty string', () => {
    expect(sanitizeIdea(null)).toBe('')
    expect(sanitizeIdea('')).toBe('')
  })

  it('keeps allowed mailto links and drops disallowed protocols', () => {
    const allowedInput = '<a href="mailto:user@example.com">email</a>'
    const allowedResult = sanitizeIdea(allowedInput)
    const allowedWrapper = documentRef.createElement('div')
    allowedWrapper.innerHTML = allowedResult
    const allowedAnchor = allowedWrapper.querySelector('a')
    expect(allowedAnchor).not.toBe(null)
    allowedAnchor?.getAttribute('href').should.equal('mailto:user@example.com')

    const blockedInput = '<a href="ftp://example.com">file</a>'
    const blockedResult = sanitizeIdea(blockedInput)
    const blockedWrapper = documentRef.createElement('div')
    blockedWrapper.innerHTML = blockedResult
    const blockedAnchor = blockedWrapper.querySelector('a')
    expect(blockedAnchor).not.toBe(null)
    expect(blockedAnchor?.getAttribute('href')).toBe(null)
    blockedAnchor?.textContent.should.equal('file')
  })

  it('strips unsupported attributes from allowed elements', () => {
    const input = '<p><a href="https://stretch.ly" style="color:red" onclick="alert(1)">link</a></p>'
    const result = sanitizeIdea(input)
    const wrapper = documentRef.createElement('div')
    wrapper.innerHTML = result
    const anchor = wrapper.querySelector('a')
    anchor.should.not.equal(null)
    anchor.getAttribute('href').should.equal('https://stretch.ly')
    expect(anchor?.getAttribute('style')).toBe(null)
    expect(anchor?.getAttribute('onclick')).toBe(null)
    anchor.textContent.should.equal('link')
  })
})
