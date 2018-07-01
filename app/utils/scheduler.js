// Schedule event to occur after delay
class Scheduler {
  constructor (func, delay, reference = null) {
    this.timer = null
    this.delay = delay
    this.func = func
    this.reference = reference
    this._correction = 0
  }

  get timeLeft () {
    if (this.timer === null) return false
    return this.now + this.delay - Date.now() - this._correction
  }

  plan () {
    this._correction = 0
    this.now = Date.now()
    this.timer = setTimeout(this.func, this.delay)
  }

  reload (correctionMillis) {
    if (this.timer === null) return
    clearTimeout(this.timer)

    this._correction += correctionMillis
    const timeLeft = this.timeLeft
    if (timeLeft <= 0) this.func()
    else this.timer = setTimeout(this.func, timeLeft)
  }

  cancel () {
    clearTimeout(this.timer)
    this.timer = null
    this.reference = null
    this.func = null
  }
}

module.exports = Scheduler
