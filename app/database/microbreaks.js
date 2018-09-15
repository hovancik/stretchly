const { connect } = require('./connection')
var Promise = require('es6-promise').Promise;

function insertBeginning(startDate) {
    console.log('Inserting beginning!')

    const db = connect()
    db.run('INSERT INTO breaks(type, started_at) VALUES (?, ?)', ['microbreak', startDate.toString() ], function(err) {
        if (err) {
            console.log('Insertion error:', err.message);
            return
        }
        
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    })
}

//add cleanup function to add incomplete break if app quits unexpectedly -- use in main on startup

function insertEnd(endDate) {
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
                    console.log('Insertion error:', err.message);
                    return
                }

                console.log(dataRow)
            })


        })
    })


}

function find() {
    return new Promise((resolve, reject) => {
        const db = connect()
        // find only type=microbreaks
        db.all('SELECT * FROM breaks WHERE type IS NOT NULL', [], (err, rows) => {
            if (err) {
                reject(err);
                return
            }

            console.log('find rows', rows)

            resolve(rows)
        });
    })
}

  

// function insertEnd(endDate) {
//     const db = connect()

//     db.run('INSERT INTO breaks(ended_at) VALUES $values', {
//         $values: endDate
//     })
// }

// function count() {
   
// }

module.exports = {
    // read,
    insertBeginning,
    find,
    insertEnd
    // insertEnd,
    // count,
}