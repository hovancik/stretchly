export default function applyBreakBackground (imageUrl) {
  if (!imageUrl) return

  const image = document.createElement('img')
  image.onload = () => {
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${JSON.stringify(imageUrl)})`
    document.body.classList.add('has-background-image')
  }
  image.src = imageUrl
}
