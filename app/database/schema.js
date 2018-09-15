const { connect } = require('./connection')

function run() {
    const db = connect()

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS breaks(type TEXT, started_at INT, finished_at INT)')
        console.log('created database')

        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
        })
    })
}

module.exports = {
    run,
}