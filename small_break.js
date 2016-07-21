const remote = require('electron').remote
const ipc = require('electron').ipcRenderer

document.getElementById('close').addEventListener('click', function (e) {
  ipc.send('finish-small-break')
})
