document.body.classList.add(window.runtime.platform())
if (window.runtime.windowsStore()) {
  document.body.classList.add('store')
}
if (window.runtime.windowsPortable()) {
  document.body.classList.add('portable')
}
export default {}
