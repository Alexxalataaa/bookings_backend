const sqlite3 = require('sqlite3').verbose();
const { fakerES: faker } = require('@faker-js/faker');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function seed() {
  console.log('Starting massive seed...');

  const all = (query, params) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // 1. Fetch businesses and services
  const businesses = await all('SELECT id FROM business');
  const services = await all('SELECT id, name, price, duration, businessId FROM service');

  if (businesses.length === 0 || services.length === 0) {
    console.error('Error: No businesses or services found to attach bookings to.');
    db.close();
    return;
  }

  // 2. Insert 1000 Clients
  console.log('Inserting 1000 clients...');
  const userStmt = db.prepare(`
    INSERT INTO user (fullName, email, username, isConfirmed, role, phone, customerBusiness, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const clientIds = [];
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    for (let i = 0; i < 1000; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName });
      const phone = faker.phone.number({ style: 'national' });
      const business = faker.datatype.boolean({ probability: 0.3 }) ? faker.company.name() : null;
      const createdAt = faker.date.past({ years: 1 }).toISOString();

      userStmt.run([fullName, email, email, 1, 'client', phone, business, createdAt], function(err) {
        if (!err) clientIds.push(this.lastID);
      });
    }
    db.run('COMMIT', () => {
      console.log(`Inserted 1000 clients successfully.`);
      
      // 3. Insert 300 Bookings
      insertBookings();
    });
  });

  function insertBookings() {
    console.log('Inserting 300 bookings...');
    const apptStmt = db.prepare(`
      INSERT INTO appointment (date, time, status, customerId, businessId, serviceName, userId, serviceId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const statuses = ['pending', 'confirmed', 'paid', 'cancelled'];

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      for (let i = 0; i < 300; i++) {
        // Fallback sequentially if async lastID didn't populate in time (though serialize guarantees order)
        const clientId = clientIds.length > 0 ? faker.helpers.arrayElement(clientIds) : faker.number.int({ min: 10, max: 1000 });
        const service = faker.helpers.arrayElement(services);
        const status = faker.helpers.arrayElement(statuses);
        
        const isFuture = faker.datatype.boolean();
        const refDate = isFuture ? faker.date.soon({ days: 30 }) : faker.date.recent({ days: 30 });
        const dateStr = refDate.toISOString().split('T')[0];
        
        const hour = faker.number.int({ min: 9, max: 18 });
        const minute = faker.helpers.arrayElement(['00', '30']);
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;

        apptStmt.run([
          dateStr,
          timeStr,
          status,
          clientId,
          service.businessId,
          service.name,
          clientId,
          service.id
        ]);
      }
      db.run('COMMIT', () => {
        console.log('Inserted 300 bookings successfully.');
        db.close();
      });
    });
  }
}

seed().catch(err => {
  console.error(err);
  db.close();
});
