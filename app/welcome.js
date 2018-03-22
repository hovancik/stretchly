const {ipcRenderer} = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.getElementById('icon').src = "./images/stretchly_128x128.png"
document.getElementById('version').innerText = require('electron').remote.app.getVersion();

document.addEventListener('DOMContentLoaded', event => {
    new HtmlTranslate(document).translate()
    })

let element = document.querySelector('input[id=dontShow]')
element.checked=false
element.addEventListener('change', function (e) {
    console.log('clicked '+element.checked)
    if(element.checked){
            ipcRenderer.send('save-setting', 'showWelcomeWindow', false)
        }
        else{
            ipcRenderer.send('save-setting', 'showWelcomeWindow', true)
        }
  })
