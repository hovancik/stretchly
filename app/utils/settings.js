const fs = require('fs')
const defaultSettings = require('./defaultSettings')

class Settings {
  constructor (configLocation) {
    this.settingsFile = configLocation
    this.data = null
    this.lastSync = 0

    if (fs.existsSync(this.settingsFile)) {
      this._load()
      if (Object.keys(this.data).length !== Object.keys(defaultSettings).length) {
        this._loadMissing()
      }
    } else {
      this.data = defaultSettings
      this._save(true)
    }
  }

  get (key) {
    if (typeof this.data[key] === 'undefined' || this.data[key] === null) {
      this.set(key, defaultSettings[key])
    }
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = value
    this._save()
  }

  _load (retryCount = 5) {
    try {
      this.data = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'))
    } catch (e) {
      if (retryCount > 0) {
        setTimeout(this._load.bind(this, retryCount - 1), 10)
        console.log('Failed to load settings JSON file, retrying in 10 milliseconds')
        return
      }
      this.data = defaultSettings
      console.log('Failed to load settings JSON file, giving up and resetting')
    }
  }

  _loadMissing () {
    for (let prop in defaultSettings) {
      this.get(prop)
    }
  }

  _save (force) {
    const now = (new Date()).getTime()
    // don't blast the disk
    if ((now - this.lastSync > 250 || force)) {
      if (this.data) {
        try {
          fs.writeFileSync(this.settingsFile, JSON.stringify(this.data, null, 4))
        } catch (e) {
          if (this.saving) clearTimeout(this.saving)
          this.saving = setTimeout(this._save.bind(this), 275)
        }
      }
      if (this.saving) clearTimeout(this.saving)
    } else {
      if (this.saving) clearTimeout(this.saving)
      this.saving = setTimeout(this._save.bind(this), 275)
    }
    this.lastSync = now
  }

  destroy () {
    this.data = null
    fs.unlinkSync(this.settingsFile)
  }
}

module.exports = Settings
