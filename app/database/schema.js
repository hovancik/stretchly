let sqlite = require('sqlite3').verbose()
let db = new sqlite.Database('stretchly.sqlite')

db.serialize(() => {
    db.run("CREATE TABLE breaks(id INT, name TEXT)")

    let test = db.prepare("INSERT INTO breaks VALUES (1, 'hi')")
    test.run()
    test.finalize()

    db.each("SELECT id, name FROM breaks", (err, row) => {
        console.log(row.id, row.name)
    })

    db.close()
})