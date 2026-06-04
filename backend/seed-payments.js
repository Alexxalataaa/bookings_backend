const sqlite3 = require('sqlite3').verbose();
const { fakerES: faker } = require('@faker-js/faker');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

db.serialize(() => {
  db.get("SELECT id FROM user WHERE username = 'empresa'", (err, user) => {
    if (err || !user) {
      console.log("No empresa user found", err);
      return;
    }
    db.all("SELECT id, name FROM business WHERE ownerId = ?", [user.id], (err, rows) => {
      if (err || rows.length === 0) {
        console.log("Empresa has no businesses", err);
        return;
      }
      
      const stmt = db.prepare(`
        INSERT INTO payment (clientName, businessName, amount, method, date, status, businessId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      db.run('BEGIN TRANSACTION');
      
      // Generate 60 payments over the last 30 days
      for (let i = 0; i < 60; i++) {
        const business = faker.helpers.arrayElement(rows);
        const amount = faker.number.float({ min: 15, max: 120, fractionDigits: 2 });
        const date = faker.date.recent({ days: 30 });
        const dateStr = date.toISOString().split('T')[0];
        
        // Add random times to createdAt
        const createdAt = date.toISOString().replace('T', ' ').split('.')[0];

        stmt.run([
          faker.person.fullName(),
          business.name,
          amount,
          faker.helpers.arrayElement(['Tarjeta', 'Efectivo', 'Bizum']),
          dateStr,
          'paid', // Make them paid
          business.id,
          createdAt
        ]);
      }
      
      db.run('COMMIT', () => {
        console.log("Inserted 60 payments for empresa businesses.");
        db.close();
      });
    });
  });
});
