const { connect } = require('./connection')
const breaks = require('./breaks')
const microbreaks = require('./microbreaks')
let Promise = require('es6-promise').Promise;

//add cleanup function to add incomplete break if app quits unexpectedly -- use in main on startup
function cleanupDatabase() {
    const db = connect()

    db.each('SELECT rowid,* FROM breaks WHERE finished_at is NULL', ((err, dataRow) => {
        if (err) {
            console.log(err)
            return
        }

        console.log('App quit unexpectedly, cleaning database')
        console.log(`Deleting row with rowid ${dataRow.rowid}`)

        db.run(`DELETE FROM breaks WHERE rowid=${dataRow.rowid}`, (err) => {
            
            if (err) {
                console.log(err)
                return
            }
        })
        console.log('Successfully cleaned database')
    }))

}

module.exports = {
    breaks,
    microbreaks,
    cleanupDatabase
}

