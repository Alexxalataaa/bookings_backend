const sqlite3 = require('sqlite3').verbose();
const { fakerES: faker } = require('@faker-js/faker');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'data', 'database.sqlite'));

db.serialize(() => {
  db.get("SELECT id FROM user WHERE username = 'empresa'", (err, user) => {
    if (err || !user) {
      console.log("Error: User 'empresa' not found.");
      return;
    }
    const empresaId = user.id;
    console.log("Empresa user ID:", empresaId);

    // Assign first two businesses to empresa
    db.run("UPDATE business SET ownerId = ? WHERE id IN (1, 2)", [empresaId], (err) => {
      if (err) console.error("Failed to assign business", err);
      else console.log("Assigned businesses 1 and 2 to empresa.");

      // Fetch services for these businesses
      db.all("SELECT id, name, businessId FROM service WHERE businessId IN (1, 2)", (err, services) => {
        if (err || services.length === 0) {
          console.log("No services found for businesses 1 and 2.");
          return;
        }

        console.log(`Found ${services.length} services. Generating 50 bookings...`);
        const stmt = db.prepare(`
          INSERT INTO appointment (date, time, status, customerId, businessId, serviceName, userId, serviceId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        db.run('BEGIN TRANSACTION');
        for(let i=0; i < 50; i++) {
          const service = faker.helpers.arrayElement(services);
          const status = faker.helpers.arrayElement(['pending', 'confirmed', 'paid', 'cancelled']);
          const isFuture = faker.datatype.boolean();
          const refDate = isFuture ? faker.date.soon({ days: 30 }) : faker.date.recent({ days: 30 });
          const dateStr = refDate.toISOString().split('T')[0];
          const hour = faker.number.int({ min: 9, max: 18 });
          const minute = faker.helpers.arrayElement(['00', '30']);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
          const clientId = faker.number.int({ min: 10, max: 1000 }); // random seeded client

          stmt.run([dateStr, timeStr, status, clientId, service.businessId, service.name, clientId, service.id]);
        }
        db.run('COMMIT', () => {
          console.log("Inserted 50 bookings for empresa.");
          db.close();
        });
      });
    });
  });
});
