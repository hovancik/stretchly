function setSameWidths () {
  const labels = document.querySelectorAll('[data-same-width-label]')
  const max = maxWidth(labels)
  if (labels && max > 0) {
    labels.forEach((label) => {
      if (label.offsetWidth !== max) {
        label.style.display = 'inline-block'
        label.style.width = `${max}px`
        label.style.textAlign = 'end'
      }
    })
  }

  const buttons = document.querySelectorAll('[data-same-width-button]')
  const maxB = maxWidth(buttons)
  if (buttons && maxB > 0) {
    buttons.forEach((button) => {
      if (button.offsetWidth !== maxB) {
        button.style.width = `${maxB}px`
      }
    })
  }
}

function maxWidth (elements) {
  return Math.max(...Array.from(elements).map((element) => {
    return element.offsetWidth
  }))
}

export {
  setSameWidths
}
