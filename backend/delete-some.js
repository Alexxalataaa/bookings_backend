const sqlite3 = require('sqlite3');
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

db.get("SELECT id FROM user WHERE username = 'empresa'", (err, user) => {
  db.all("SELECT id FROM business WHERE ownerId = ?", [user.id], (err, rows) => {
    const ids = rows.map(r=>r.id);
    db.run("DELETE FROM appointment WHERE id IN (SELECT id FROM appointment WHERE businessId IN ("+ids.join(',')+") ORDER BY RANDOM() LIMIT 25)", () => {
      console.log("Deleted 25 bookings from empresa");
    });
  });
});
