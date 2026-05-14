const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.sqlite');

db.serialize(() => {
  // Insert Customers
  const stmtCustomer = db.prepare("INSERT INTO customer (name, email, phone, business) VALUES (?, ?, ?, ?)");
  stmtCustomer.run('Ana Pérez', 'ana.perez@example.com', '+34 600 123 456', 'Personal');
  stmtCustomer.run('Carlos Gómez', 'carlos.gomez@example.com', '+34 611 234 567', 'Personal');
  stmtCustomer.finalize();

  // Insert Appointments
  const stmtAppointment = db.prepare("INSERT INTO appointment (date, time, status, customerId, businessId, serviceName) VALUES (?, ?, ?, ?, ?, ?)");
  stmtAppointment.run('2026-06-10', '10:00', 'confirmed', 1, 1, 'Corte de pelo');
  stmtAppointment.run('2026-06-11', '15:30', 'pending', 2, 1, 'Tratamiento facial');
  stmtAppointment.finalize();

  // Insert Payments
  // Note: The schema doesn't have appointmentId, so we map the data to the available columns.
  const stmtPayment = db.prepare("INSERT INTO payment (clientName, businessName, amount, method, date, status) VALUES (?, ?, ?, ?, ?, ?)");
  stmtPayment.run('Ana Pérez', 'Negocio 1', 45.00, 'Tarjeta', '2026-06-10', 'paid');
  stmtPayment.run('Carlos Gómez', 'Negocio 1', 30.00, 'Tarjeta', '2026-06-11', 'pending');
  stmtPayment.finalize();

  console.log('Data inserted successfully.');
});

db.close();
