document.body.classList.add(window.process.platform())
if (window.process.windowsStore()) {
  document.body.classList.add('store')
}
export default {}
