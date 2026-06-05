const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

const hash1234 = hashPassword('1234');
const hashAdmin = hashPassword('admin');

db.serialize(() => {
  db.run("UPDATE user SET passwordHash = ? WHERE username IN ('empresa', 'cliente')", [hash1234], function(err) {
    if (err) console.error(err);
    console.log("Updated empresa and cliente passwords to 1234. Changes:", this.changes);
  });
  
  db.run("UPDATE user SET passwordHash = ? WHERE username = 'admin'", [hashAdmin], function(err) {
    if (err) console.error(err);
    console.log("Updated admin password to admin. Changes:", this.changes);
  });
});
