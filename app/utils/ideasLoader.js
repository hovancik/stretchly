let Shuffled = require('./shuffled')

class IdeasLoader {
  constructor (data) {
    this.data = data
  }

  ideas () {
    return new Shuffled(
      this.data.filter(item => item.enabled).map(item => item.data)
    )
  }
}
module.exports = IdeasLoader
