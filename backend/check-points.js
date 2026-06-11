const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.sqlite');

db.all("SELECT customerId, COUNT(*) as count FROM appointment GROUP BY customerId ORDER BY count DESC LIMIT 5", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Top users by appointments:", rows);
  }
});
