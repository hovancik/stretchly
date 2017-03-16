const {ipcRenderer} = require('electron')

document.getElementById('close').addEventListener('click', function (e) {
  ipcRenderer.send('finish-break', false)
})

ipcRenderer.on('breakIdea', (event, message, strictMode) => {
  if (!strictMode) {
    document.getElementById('close').style.visibility = 'visible'
    window.addEventListener('keydown', event => {
      if (event.key === 'x' && (event.ctrlKey || event.metaKey)) {
        ipcRenderer.send('finish-break', false)
      }
    })
  }
  let breakIdea = document.getElementsByClassName('break-idea')[0]
  breakIdea.innerHTML = message[0]
  let breakText = document.getElementsByClassName('break-text')[0]
  breakText.innerHTML = message[1]
})
