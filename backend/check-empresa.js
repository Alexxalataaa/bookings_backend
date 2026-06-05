const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

db.get("SELECT id FROM user WHERE username = 'empresa'", (err, user) => {
  if (err || !user) {
    console.log("No empresa user found", err);
    return;
  }
  db.all("SELECT id FROM business WHERE ownerId = ?", [user.id], (err, rows) => {
    if (err || rows.length === 0) {
      console.log("Empresa has no businesses", err);
      return;
    }
    const ids = rows.map(r => r.id);
    console.log("Empresa business IDs:", ids);
    db.get("SELECT COUNT(*) as count FROM appointment WHERE businessId IN (" + ids.join(',') + ")", (err, row) => {
      console.log("Bookings for empresa businesses:", row ? row.count : 0, err);
    });
  });
});
