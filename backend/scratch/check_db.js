const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.sqlite');

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Tables:', tables);
  
  tables.forEach(table => {
    db.all(`PRAGMA table_info(${table.name});`, (err, columns) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Columns for ${table.name}:`, columns.map(c => c.name));
      }
    });
  });
});
