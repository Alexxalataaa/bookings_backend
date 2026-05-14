const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const serviceNames = ['Fisioterapia', 'Odontología', 'Psicología', 'Nutrición', 'Entrenamiento'];
const clientNames = ['Juan Pérez', 'María García', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Sánchez', 'Elena Gómez'];
const businessNames = ['Clínica Central', 'Salud Alicante', 'Centro Vital'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().split('T')[0];
}

db.serialize(() => {
  console.log('Seeding data...');

  // Clear existing data for a clean demonstration
  db.run('DELETE FROM appointment');
  db.run('DELETE FROM payment');

  // Insert Appointments
  const stmtApp = db.prepare('INSERT INTO appointment (date, time, status, customerId, businessId, serviceName) VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < 60; i++) {
    stmtApp.run(
      getRandomDate(30),
      `${Math.floor(Math.random() * 12) + 8}:00`,
      getRandomElement(['pending', 'confirmed', 'paid']),
      Math.floor(Math.random() * 10) + 1,
      Math.floor(Math.random() * 3) + 1,
      getRandomElement(serviceNames)
    );
  }
  stmtApp.finalize();

  // Insert Payments
  const stmtPay = db.prepare('INSERT INTO payment (clientName, businessName, amount, method, date, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < 50; i++) {
    const date = getRandomDate(35); // Some in previous month
    stmtPay.run(
      getRandomElement(clientNames),
      getRandomElement(businessNames),
      (Math.random() * 100 + 20).toFixed(2),
      getRandomElement(['card', 'cash', 'transfer']),
      date,
      getRandomElement(['paid', 'paid', 'paid', 'pending']), // Mostly paid
      new Date(date).toISOString()
    );
  }
  stmtPay.finalize();

  console.log('Data seeded successfully!');
});

db.close();
