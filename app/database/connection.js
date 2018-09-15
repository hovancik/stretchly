const sqlite = require('sqlite3').verbose()
const path = require('path')
const dbLocation = path.join(__dirname, 'stretchly.db')

function connect() {
    return new sqlite.Database(dbLocation, (err) => {
        if (err) {
            console.error(err.message)
        }
    })
}

module.exports = {
    connect
}

