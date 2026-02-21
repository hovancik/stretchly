class Shuffled {
  constructor (array) {
    this.array = array.slice(0)
    this.temp = array.slice(0)
  }

  get randomElement () {
    if (this.temp.length === 0) {
      this.temp = this.array.slice(0)
    }
    const randomIndex = Math.floor(Math.random() * this.temp.length)
    const element = this.temp[randomIndex]
    this.temp.splice(randomIndex, 1)
    return element
  }
}

export default Shuffled
