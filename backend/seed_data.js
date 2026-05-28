const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { faker } = require('@faker-js/faker/locale/es');

const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const categories = ['Salud', 'Belleza', 'Deporte', 'Nutrición', 'Psicología'];
const servicesByCategory = {
  'Salud': ['Fisioterapia', 'Odontología', 'Medicina General'],
  'Belleza': ['Corte de pelo', 'Manicura', 'Masaje relajante'],
  'Deporte': ['Entrenamiento personal', 'Yoga', 'Pilates'],
  'Nutrición': ['Consulta nutricional', 'Dieta personalizada'],
  'Psicología': ['Terapia individual', 'Terapia de pareja'],
};

// Hashes SHA256
const HASH_ADMIN    = '5c06eb3d5a05a19f49476d694ca81a36344660e9d5b98e3d6a6630f31c2422e7'; // admin123!
const HASH_CLIENT   = '361480e377527669c8e4a4dcebb08788e1277a482f8809ec639a3ed68af68c5c'; // client123!
const HASH_OWNER1   = '2307aa011bc2e3a938a845d2c0972baf143d6c419f60c2eb4f543f0dad51b124'; // owner123!
const HASH_GENERIC  = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // password123

db.serialize(() => {
  console.log('Seeding data...');

  // Limpiar tablas
  db.run('DELETE FROM appointment');
  db.run('DELETE FROM payment');
  db.run('DELETE FROM service');
  db.run('DELETE FROM customer');
  db.run('DELETE FROM business');
  db.run('DELETE FROM user');
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('appointment','payment','service','customer','business','user')");

  // 1. USUARIOS
  const stmtUser = db.prepare(`
    INSERT INTO user (fullName, email, username, passwordHash, isConfirmed, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Admin fijo
  stmtUser.run('Admin Principal', 'admin@bookflow.com', 'admin', HASH_ADMIN, 1, 'superadmin');

  // Usuario demo cliente
  stmtUser.run('Cliente Demo', 'client1@bookflow.com', 'client1', HASH_CLIENT, 1, 'client');

  // 30 owners (owner1 con hash especial, el resto genérico)
  for (let i = 1; i <= 30; i++) {
    stmtUser.run(
      faker.person.fullName(),
      `owner${i}@bookings.com`,
      `owner${i}`,
      i === 1 ? HASH_OWNER1 : HASH_GENERIC,
      1,
      'business'
    );
  }
  stmtUser.finalize();

  // 2. NEGOCIOS (50) — owners con entre 1 y 4 negocios
  const stmtBusiness = db.prepare(`
    INSERT INTO business (name, slug, category, description, street, city, zipCode, phone, email, image, logo, hours, socialLinks, gallery, rating, reviewsCount, isSuspended, createdAt, ownerId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let businessCount = 0;
  let ownerId = 3; // 1=admin, 2=client1, 3=owner1...

  while (businessCount < 50 && ownerId <= 32) {
    const numNegocios = faker.number.int({ min: 1, max: 4 });
    for (let j = 0; j < numNegocios && businessCount < 50; j++) {
      const category = faker.helpers.arrayElement(categories);
      const name = `${category} ${faker.company.buzzNoun()} ${faker.number.int({ min: 1, max: 99 })}`;
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      stmtBusiness.run(
        name, slug, category,
        faker.company.catchPhrase(),
        faker.location.streetAddress(),
        faker.helpers.arrayElement(['Alicante', 'Valencia', 'Madrid', 'Barcelona', 'Sevilla']),
        faker.location.zipCode('0####'),
        faker.phone.number(),
        faker.internet.email(),
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
        '',
        JSON.stringify({ monFri: '09:00 - 20:00', sat: '09:00 - 14:00', sun: 'Cerrado' }),
        JSON.stringify({ instagram: '', facebook: '' }),
        JSON.stringify([]),
        parseFloat(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
        faker.number.int({ min: 5, max: 300 }),
        0,
        faker.date.past({ years: 2 }).toISOString(),
        ownerId
      );
      businessCount++;
    }
    ownerId++;
  }
  stmtBusiness.finalize();

  // 3. SERVICIOS
  const stmtService = db.prepare(`
    INSERT INTO service (name, description, price, duration, businessId)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let businessId = 1; businessId <= 50; businessId++) {
    const category = faker.helpers.arrayElement(categories);
    const services = servicesByCategory[category];
    services.forEach(serviceName => {
      stmtService.run(
        serviceName,
        faker.lorem.sentence(),
        parseFloat(faker.finance.amount({ min: 20, max: 150, dec: 2 })),
        faker.helpers.arrayElement([30, 45, 60, 90]),
        businessId
      );
    });
  }
  stmtService.finalize();

  // 4. CLIENTES
  const stmtCustomer = db.prepare(`
    INSERT INTO customer (name, email, phone, business, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 200; i++) {
    stmtCustomer.run(
      faker.person.fullName(),
      faker.internet.email(),
      faker.phone.number(),
      faker.number.int({ min: 1, max: 50 }).toString(),
      faker.date.past({ years: 1 }).toISOString()
    );
  }
  stmtCustomer.finalize();

  // 5. CITAS
  const stmtApp = db.prepare(`
    INSERT INTO appointment (date, time, status, customerId, businessId, serviceName, userId, serviceId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 500; i++) {
    const businessId = faker.number.int({ min: 1, max: 50 });
    const category = faker.helpers.arrayElement(categories);
    const services = servicesByCategory[category];
    stmtApp.run(
      faker.date.recent({ days: 60 }).toISOString().split('T')[0],
      `${faker.number.int({ min: 8, max: 19 })}:00`,
      faker.helpers.arrayElement(['pending', 'confirmed', 'paid']),
      faker.number.int({ min: 1, max: 200 }),
      businessId,
      faker.helpers.arrayElement(services),
      faker.number.int({ min: 3, max: 32 }),
      faker.number.int({ min: 1, max: 3 })
    );
  }
  stmtApp.finalize();

  // 6. PAGOS
  const stmtPay = db.prepare(`
    INSERT INTO payment (clientName, businessName, amount, method, date, status, createdAt, businessId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 400; i++) {
    const date = faker.date.recent({ days: 60 }).toISOString().split('T')[0];
    const businessId = faker.number.int({ min: 1, max: 50 });
    stmtPay.run(
      faker.person.fullName(),
      `Negocio ${businessId}`,
      parseFloat(faker.finance.amount({ min: 20, max: 150, dec: 2 })),
      faker.helpers.arrayElement(['card', 'cash', 'transfer']),
      date,
      faker.helpers.arrayElement(['paid', 'paid', 'paid', 'pending']),
      new Date(date).toISOString(),
      businessId
    );
  }
  stmtPay.finalize();

  console.log('✅ Data seeded successfully!');
  console.log('   - 32 usuarios (1 admin + 1 client demo + 30 owners)');
  console.log('   - 50 negocios (owners con 1-4 negocios cada uno)');
  console.log('   - ~150 servicios');
  console.log('   - 200 clientes');
  console.log('   - 500 citas');
  console.log('   - 400 pagos');
  console.log('');
  console.log('🔑 admin@bookflow.com / admin123!  →  superadmin');
  console.log('🔑 client1@bookflow.com / client123!  →  cliente');
  console.log('🔑 owner1@bookings.com / owner123!  →  owner');
});

db.close();
