// Schedule event to occur after delay
class Scheduler {
  constructor (func, delay) {
    this.timer = null
    this.delay = delay
    this.now = Date.now()
    this.func = func
    this.cleared = false
  }

  get timeLeft () {
    if (this.cleared) return false
    return this.now + this.delay - Date.now()
  }

  plan () {
    this.timer = setTimeout(this.func, this.delay)
  }

  cancel () {
    clearTimeout(this.timer)
    this.cleared = true
  }
}

module.exports = Scheduler
