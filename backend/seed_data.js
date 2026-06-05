const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { fakerES: faker } = require('@faker-js/faker');

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

const categoryMapping = {
  'Salud': 'health',
  'Belleza': 'beauty',
  'Deporte': 'sports',
  'Nutrición': 'food',
  'Psicología': 'people'
};

// Hashes SHA256
const HASH_ADMIN    = '5c06eb3d5a05a19f49476d694ca81a36344660e9d5b98e3d6a6630f31c2422e7'; // admin123!
const HASH_CLIENT   = '361480e377527669c8e4a4dcebb08788e1277a482f8809ec639a3ed68af68c5c'; // client123!
const HASH_OWNER1   = '2307aa011bc2e3a938a845d2c0972baf143d6c419f60c2eb4f543f0dad51b124'; // owner123!
const HASH_GENERIC  = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'; // password123

db.serialize(() => {
  console.log('Re-seeding database with realistic and consistent data...');

  // Limpiar tablas
  db.run('PRAGMA foreign_keys = OFF');
  db.run('DELETE FROM appointment');
  db.run('DELETE FROM payment');
  db.run('DELETE FROM service');
  db.run('DELETE FROM business');
  db.run('DELETE FROM user');
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('appointment','payment','service','business','user')");
  db.run('PRAGMA foreign_keys = ON');

  // 1. USUARIOS (Superadmin, Client Demo, Owners, Clients)
  const stmtUser = db.prepare(`
    INSERT INTO user (id, fullName, email, username, passwordHash, isConfirmed, role)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let currentUserId = 1;

  // Admin fijo (ID 1)
  stmtUser.run(currentUserId++, 'Admin Principal', 'admin@bookflow.com', 'admin', HASH_ADMIN, 1, 'superadmin');

  // Usuario demo cliente (ID 2)
  stmtUser.run(currentUserId++, 'Cliente Demo', 'client1@bookflow.com', 'client1', HASH_CLIENT, 1, 'client');

  // 30 owners (IDs 3 al 32)
  const ownerIds = [];
  for (let i = 1; i <= 30; i++) {
    const oId = currentUserId++;
    ownerIds.push(oId);
    stmtUser.run(
      oId,
      faker.person.fullName(),
      `owner${i}@bookings.com`,
      `owner${i}`,
      i === 1 ? HASH_OWNER1 : HASH_GENERIC,
      1,
      'business'
    );
  }

  // 200 clientes CRM (IDs 33 al 232)
  const clientIds = [2]; // Incluir el cliente demo (ID 2)
  for (let i = 1; i <= 200; i++) {
    const cId = currentUserId++;
    clientIds.push(cId);
    stmtUser.run(
      cId,
      faker.person.fullName(),
      faker.internet.email(),
      `client_crm_${i}`,
      null, // Sin login credentials
      1,
      'client'
    );
  }
  stmtUser.finalize();

  // 2. NEGOCIOS (50) - asignados a los owners (IDs 3 al 32)
  const stmtBusiness = db.prepare(`
    INSERT INTO business (id, name, slug, category, description, street, city, zipCode, phone, email, image, logo, hours, socialLinks, gallery, rating, reviewsCount, isSuspended, createdAt, ownerId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let businessCount = 0;
  let ownerIndex = 0;
  const businessIds = [];
  const businessNames = {}; // maps businessId to businessName

  const fixedImagesByCategory = {
    'Salud': [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
      'https://images.unsplash.com/photo-1582750433449-648ed127d0fc?w=800&q=80',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
      'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800&q=80',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'
    ],
    'Belleza': [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
      'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=800&q=80',
      'https://images.unsplash.com/photo-1516975080661-46b0a8806283?w=800&q=80',
      'https://images.unsplash.com/photo-1521590832167-7bfc17484d20?w=800&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80'
    ],
    'Deporte': [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=800&q=80',
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80',
      'https://images.unsplash.com/photo-1526502396160-c3cf27eb845d?w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80'
    ],
    'Nutrición': [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      'https://images.unsplash.com/photo-1498837167922-41c543bd8bf2?w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=800&q=80',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80',
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=80',
      'https://images.unsplash.com/photo-1490818387583-1b5ba4596d3f?w=800&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80'
    ],
    'Psicología': [
      'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
      'https://images.unsplash.com/photo-1520694478166-daaaaec95b69?w=800&q=80',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
      'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&q=80',
      'https://images.unsplash.com/photo-1516302752946-f93f9887cece?w=800&q=80',
      'https://images.unsplash.com/photo-1506869640319-fea1a2753689?w=800&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80'
    ]
  };

  while (businessCount < 50) {
    const numNegocios = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < numNegocios && businessCount < 50; j++) {
      const bId = businessCount + 1;
      businessIds.push(bId);
      const category = faker.helpers.arrayElement(categories);
      const name = `${category} ${faker.company.buzzNoun()} ${faker.number.int({ min: 1, max: 99 })}`;
      businessNames[bId] = name;
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const uniqueImage = fixedImagesByCategory[category][businessCount % 10];

      const assignedOwnerId = ownerIds[ownerIndex % ownerIds.length];

      stmtBusiness.run(
        bId,
        name, slug, category,
        faker.company.catchPhrase(),
        faker.location.streetAddress(),
        faker.helpers.arrayElement(['Alicante', 'Valencia', 'Madrid', 'Barcelona', 'Sevilla']),
        faker.location.zipCode('0####'),
        faker.phone.number(),
        faker.internet.email(),
        uniqueImage,
        '',
        JSON.stringify({ monFri: '09:00 - 20:00', sat: '09:00 - 14:00', sun: 'Cerrado' }),
        JSON.stringify({ instagram: '', facebook: '' }),
        JSON.stringify([]),
        parseFloat(faker.number.float({ min: 3.8, max: 5.0, fractionDigits: 1 })),
        faker.number.int({ min: 15, max: 150 }),
        0,
        faker.date.past({ years: 1 }).toISOString(),
        assignedOwnerId
      );
      businessCount++;
    }
    ownerIndex++;
  }
  stmtBusiness.finalize();

  // 3. SERVICIOS (Asociados a los 50 negocios)
  const stmtService = db.prepare(`
    INSERT INTO service (id, name, description, price, duration, businessId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let serviceId = 1;
  const servicesByBusiness = {}; // maps businessId to array of services {id, name, price}

  for (let bId of businessIds) {
    // Determinar la categoría del negocio (simulada por faker o leída si fuera necesario, usaremos una aleatoria)
    const category = faker.helpers.arrayElement(categories);
    const serviceNames = servicesByCategory[category];
    
    servicesByBusiness[bId] = [];

    serviceNames.forEach(serviceName => {
      const sId = serviceId++;
      const price = faker.number.int({ min: 15, max: 80 });
      
      servicesByBusiness[bId].push({
        id: sId,
        name: serviceName,
        price: price
      });

      stmtService.run(
        sId,
        serviceName,
        faker.lorem.sentence(),
        price,
        faker.helpers.arrayElement([30, 45, 60]),
        bId
      );
    });
  }
  stmtService.finalize();

  // 4. CITAS (Reservas de clientes reales a negocios reales)
  const stmtApp = db.prepare(`
    INSERT INTO appointment (date, time, status, customerId, businessId, serviceName, userId, serviceId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const appointmentsList = [];

  for (let bId of businessIds) {
    for (let j = 0; j < 5; j++) {
      createAppointment(bId);
    }
  }

  for (let i = 0; i < 350; i++) {
    const businessId = faker.helpers.arrayElement(businessIds);
    createAppointment(businessId);
  }

  function createAppointment(businessId) {
    const services = servicesByBusiness[businessId];
    if (!services || services.length === 0) return;
    const service = faker.helpers.arrayElement(services);
    const clientId = faker.helpers.arrayElement(clientIds); // ID de la tabla user con rol client

    const date = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
      to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)   // Próximos 30 días
    }).toISOString().split('T')[0];

    const status = faker.helpers.arrayElement(['pending', 'confirmed', 'paid', 'cancelled']);

    appointmentsList.push({
      date,
      clientId,
      businessId,
      amount: service.price,
      status
    });

    stmtApp.run(
      date,
      `${faker.number.int({ min: 8, max: 19 })}:00`,
      status,
      clientId,     // customerId es el ID del User cliente
      businessId,
      service.name,
      clientId,     // userId también apunta al mismo ID del User cliente
      service.id
    );
  }
  stmtApp.finalize();

  // Obtener nombres de usuarios clientes para Payments
  db.all('SELECT id, fullName FROM user WHERE role = \'client\'', (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    const clientsMap = {};
    rows.forEach(r => {
      clientsMap[r.id] = r.fullName;
    });

    // 5. PAGOS (Ingresos financieros diversificados y realistas)
    const stmtPay = db.prepare(`
      INSERT INTO payment (clientName, businessName, amount, method, date, status, createdAt, businessId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Crear pagos realistas basados en citas pagadas o aleatorios de clientes reales
    for (let i = 0; i < 500; i++) {
      const app = faker.helpers.arrayElement(appointmentsList);
      const clientName = clientsMap[app.clientId] || faker.person.fullName();
      const businessName = businessNames[app.businessId] || 'Negocio';
      const amount = app.amount;
      const date = app.date;
      const status = app.status === 'paid' ? 'paid' : faker.helpers.arrayElement(['paid', 'paid', 'pending']);
      const method = faker.helpers.arrayElement(['Tarjeta', 'Efectivo', 'Bizum', 'Transferencia']);

      stmtPay.run(
        clientName,
        businessName,
        amount,
        method,
        date,
        status,
        new Date(date).toISOString(),
        app.businessId
      );
    }
    stmtPay.finalize();

    console.log('✅ Base de datos resembrada con éxito!');
    console.log(`   - 232 usuarios en total (1 admin, 1 client demo, 30 owners, 200 clientes crm)`);
    console.log(`   - 50 negocios reales de los owners`);
    console.log(`   - 150 servicios con precios consistentes`);
    console.log(`   - 600 citas totalmente consistentes (customerId == userId)`);
    console.log(`   - 500 cobros detallados y coherentes`);
    db.close();
  });
});
