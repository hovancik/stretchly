const ipc = require('electron').ipcRenderer
const microbreakIdeas = [
  'Go grab a glass of water.',
  'Slowly look all the way left, then right.',
  'Slowly look all the way up, then down.',
  'Close your eyes and take few deep breaths.',
  'Close your eyes and relax.',
  'Strech your legs.',
  'Strech your arms.',
  'Is your sitting pose correct?',
  'Slowly turn head to side and hold for 10 seconds.',
  'Slowly tilt head to side and hold for 5-10 seconds.',
  'Stand from chair and strech.',
  'Refocus eyes on an object at least 20 meters away.'
]

document.getElementById('close').addEventListener('click', function (e) {
  ipc.send('finish-microbreak')
})

let microbreakIdea = document.getElementsByClassName('microbreak-idea')[0]
let randomIdeaIndex = Math.floor(Math.random() * microbreakIdeas.length)
microbreakIdea.innerHTML = microbreakIdeas[randomIdeaIndex]
