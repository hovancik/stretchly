const { ipcRenderer, ipcMain, shell, remote } = require('electron')
let VersionChecker = require('./utils/versionChecker')

let currentVersion = window.location.hash.substring(1);
document.getElementById('currentVersion').innerHTML = `Current Version: ${currentVersion}`;
checkLatestRelease();

function checkLatestRelease() {
    new VersionChecker()
    .latest()
    .then(version => {
        const semantic = /^v([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/
        if (version.match(semantic) && currentVersion !== version) {
            newVersionAvailable(version)
        }
    })
    .catch(exception => console.error(exception))
}
function newVersionAvailable(newVersion) {
    document.getElementById('newVersion').innerHTML = `New Version: ${newVersion}`;
}

ipcRenderer.on('message', (event, text) => {
    const messageContainer = document.getElementById('messages');
    const message = document.createElement('div');
    message.innerHTML = text;
    messageContainer.appendChild(message);
})