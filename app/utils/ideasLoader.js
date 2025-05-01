import Shuffled from './shuffled.js'

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

export default IdeasLoader
