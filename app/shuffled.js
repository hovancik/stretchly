'use strict'

// Returns random elements from array without repetition
function Shuffled (array) {
  this.array = array.slice(0)
  this.temp = array.slice(0)
}

Shuffled.prototype.randomElement = function () {
  if (this.temp.length === 0) {
    this.temp = this.array.slice(0)
  }
  let randomIndex = Math.floor(Math.random() * this.temp.length)
  let element = this.temp[randomIndex]
  this.temp.splice(randomIndex, 1)
  return element
}

module.exports = Shuffled
