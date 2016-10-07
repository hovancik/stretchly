const {ipcRenderer} = require('electron')

document.getElementById('close').addEventListener('click', function (e) {
  ipcRenderer.send('finish-microbreak', false)
})

ipcRenderer.on('breakIdea', (event, message) => {
  let microbreakIdea = document.getElementsByClassName('microbreak-idea')[0]
  microbreakIdea.innerHTML = message
})
