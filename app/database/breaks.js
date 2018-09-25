const { connect } = require('./connection')
let Promise = require('es6-promise').Promise;


function insertBeginningBreak(startDate) {
    console.log('Inserting beginning!')

    const db = connect()
    db.run('INSERT INTO breaks(type, started_at) VALUES (?, ?)', ['break', startDate.toString() ], function(err) {
        if (err) {
            console.log('Insertion error:', err.message);
            return
        }
        
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    })
}

function insertEndBreak(endDate) {
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

function calculateBreakTime() {
    return new Promise((resolve, reject) => {
        console.log('calculating total break time!')
        const db = connect()

        db.all('SELECT * FROM breaks WHERE type=(?)', ['break'], (err, rows) => {
            console.log('HERE ARE THE ROWS', rows)
            let totalDuration = 0
            let duration = 0

            console.log('getting all breaks with type break')
            if (err) {
                reject(err)
                return
            }


            rows.forEach((row) => {
                duration = row.finished_at - row.started_at
                totalDuration += duration
            })

            console.log('result of calculateBreakTime()', totalDuration)
            resolve(totalDuration) 
        })
    })
}

function findBreaks() {
    return new Promise((resolve, reject) => {
        const db = connect()
        db.all('SELECT * FROM breaks WHERE type=(?)', ['break'], (err, rows) => {
            if (err) {
                reject(err)
                return
            }
            console.log('Result of findBreaks()', rows)

            resolve(rows)
        });
    })
}



module.exports = {
    insertBeginningBreak,
    insertEndBreak,
    calculateBreakTime,
    findBreaks
}