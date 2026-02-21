import createDOMPurify from 'dompurify'
import { isAllowedImageFilename } from './imageResolver.js'

const DOMPurify = createDOMPurify(window)
const allowedTags = ['a', 'b', 'i', 'img', 'br', 'p', 'h1', 'h2', 'h3']
const allowedAttributes = ['href', 'title', 'src', 'alt', 'width', 'height']
const allowedUriPattern = /^(?:https:\/\/.+|mailto:.+|[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)$/i
const allowedAnchorPattern = /^(?:https:\/\/.+|mailto:.+)$/i

const sanitizeIdea = (value) => {
  if (typeof value !== 'string' || value.length === 0) return ''
  const html = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOWED_URI_REGEXP: allowedUriPattern,
    RETURN_TRUSTED_TYPE: false
  })
  const container = document.createElement('div')
  container.innerHTML = html
  const anchors = [...container.querySelectorAll('a')]
  for (const anchor of anchors) {
    const href = anchor.getAttribute('href') || ''
    if (!allowedAnchorPattern.test(href)) anchor.removeAttribute('href')
  }
  const imgs = [...container.querySelectorAll('img')]
  for (const img of imgs) {
    const src = img.getAttribute('src') || ''
    if (!isAllowedImageFilename(src)) img.remove()
  }
  return container.innerHTML
}

export default sanitizeIdea
