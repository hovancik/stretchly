const sqlite = require('sqlite3').verbose()
const db = new sqlite.Database('stretchly.sqlite', (err) => {
    if(err) {
        console.error(err.message)
    }
})

db.serialize(() => {
    db.run('CREATE TABLE breaks(total_count INT, total_time INT)')
        .run('INSERT INTO breaks()')

    const test = db.prepare("INSERT INTO breaks VALUES (1, 'hi')")
    test.run()
    test.finalize()

    db.each("SELECT id, name FROM breaks", (err, row) => {
        console.log(row.id, row.name)
    })

    db.close()
})

// db.serialize(() => {
//     // Queries scheduled here will be serialized.
//     db.run('CREATE TABLE greetings(message text)')
//       .run(`INSERT INTO greetings(message)
//             VALUES('Hi'),
//                   ('Hello'),
//                   ('Welcome')`)
//       .each(`SELECT message FROM greetings`, (err, row) => {
//         if (err){
//           throw err;
//         }
//         console.log(row.message);
//       });
//   });
   
//   // close the database connection
//   db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//   });