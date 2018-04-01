const { ipcRenderer } = require('electron')
const HtmlTranslate = require('./utils/htmlTranslate')

document.addEventListener('DOMContentLoaded', event => {
    new HtmlTranslate(document).translate()
})

let currIndex=0
let imgArray= [
    "./images/stretchly-microbreak.png",
    "./images/stretchly-break.png",
    "./images/stretchly-notification.png",
    "./images/stretchly-tray-1.png",
    "./images/stretchly-tray-2.png",
    "./images/stretchly-tray-3.png",
    "./images/stretchly-settings-website-1.png",
    "./images/stretchly-settings-website-2.png",
    "./images/stretchly-settings-website-3.png"
]

let infoArray= [
    "microbreak",
    "break",
    "notif",
    "tray1",
    "tray2",
    "tray3",
    "setting1",
    "setting2",
    "setting3"
]

let prev = document.querySelector('a[id=prevImg]')
let next = document.querySelector('a[id=nextImg]')

prev.addEventListener('click', function(){
    showImgInfo(-1)
})
next.addEventListener('click', function(){
    showImgInfo(1)
})

function showImgInfo(n) {
    currIndex += n
    if(n==-1){
        prevIndex = currIndex + 1
    }
    else{
        prevIndex = currIndex - 1
    }
    
    if(currIndex == -1){
        currIndex = 8
        prevIndex = 0
    }
    if(currIndex == 9){
        currIndex = 0
        prevIndex = 8
    }
    document.querySelector('img[id=image]').src = imgArray[currIndex]
    let infoDiv = document.querySelector('div[id=infoDisplay]')
    document.getElementById(infoArray[currIndex]).style.display = 'block'
    document.getElementById(infoArray[prevIndex]).style.display = 'none'
}
