const { connect } = require('./connection')
let Promise = require('es6-promise').Promise

function insertBeginningMicrobreak (startDate) {
  console.log('Inserting beginning!')

  const db = connect()
  db.run('INSERT INTO breaks(type, started_at) VALUES (?, ?)', ['microbreak', startDate.toString()], function (err) {
    if (err) {
      console.log('Insertion error:', err.message)
      return
    }

    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`)
  })
}

function insertEndMicrobreak (endDate) {
  console.log('Inserting ending!')

  const db = connect()

  db.get('SELECT * FROM breaks WHERE finished_at is NULL', (err, row) => {
    if (err) {
      console.log(err)
      return
    }

    db.run(`UPDATE breaks SET finished_at=${endDate.toString()} WHERE started_at=${row.started_at}`, function (err) {
      if (err) {
        console.log(err)
        return
      }

      db.each('SELECT * FROM breaks', [], (err, dataRow) => {
        if (err) {
          console.log('Insertion error:', err.message)
          return
        }

        console.log(dataRow)
      })
    })
  })
}

function calculateMicrobreaksTime () {
  return new Promise((resolve, reject) => {
    const db = connect()

    db.all('SELECT * FROM breaks WHERE type=(?)', ['microbreak'], (err, rows) => {
      let totalDuration = 0
      let duration = 0

      if (err) {
        reject(err)
        return
      }

      rows.forEach((row) => {
        duration = row.finished_at - row.started_at
        totalDuration += duration
      })

      resolve(Math.round(totalDuration / 1000 / 60 * 100) / 100)
    })
  })
}

function findMicrobreaks () {
  return new Promise((resolve, reject) => {
    const db = connect()
    // find only type=microbreaks
    db.all('SELECT * FROM breaks WHERE type=(?)', ['microbreak'], (err, rows) => {
      if (err) {
        reject(err)
        return
      }

      resolve(rows)
    })
  })
}

module.exports = {
  insertBeginningMicrobreak,
  findMicrobreaks,
  insertEndMicrobreak,
  calculateMicrobreaksTime
}
