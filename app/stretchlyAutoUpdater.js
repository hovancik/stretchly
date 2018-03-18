const { ipcRenderer } = require('electron')
setInterval(() => {
  let progress = ipcRenderer.sendSync('download-progress-request')
  const progressElement = document.getElementById('progressElement')
  progressElement.value = progress
}, 1000)
