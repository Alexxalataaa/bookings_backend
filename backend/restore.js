const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

db.serialize(() => {
  db.run("UPDATE user SET username='empresa', fullName='Empresa Demo', email='empresa@bookflow.com' WHERE username='owner1'", function(err) {
    if (err) console.error(err);
    console.log("Renamed owner1 to empresa. Changes:", this.changes);
  });
  
  db.get("SELECT id FROM user WHERE username='empresa'", (err, row) => {
    if (row) {
      db.all("SELECT id, name FROM business WHERE ownerId = ?", [row.id], (err, businesses) => {
        console.log("Empresa now owns businesses:", businesses);
        if (businesses.length > 0) {
          db.get("SELECT COUNT(*) as c FROM appointment WHERE businessId IN (" + businesses.map(b=>b.id).join(',') + ")", (err, counts) => {
            console.log("Appointments for these businesses:", counts.c);
          });
        }
      });
    }
  });
});
