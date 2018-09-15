const { connect } = require('./connection')

function insert() {
    const db = connect()

    db.run()

    console.log('thing inserted')
}

function read() {

}

function count() {

}

module.exports = {
    read,
    insert,
    count,
}