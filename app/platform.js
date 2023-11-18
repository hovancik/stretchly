document.body.classList.add(process.platform)
if (process.windowsStore) {
  document.body.classList.add('store')
}
