const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

const CURRENT_MONTH = new Date().toISOString().substring(0, 7); // YYYY-MM
const BUSINESS_ID = 1; // Assuming 'Psicología methodologies 52' or 'empresa de prueba' is ID 1
const USER_ID = 2; // Assuming the client test user is ID 2 (or we can use 3, we'll fetch it)

db.serialize(() => {
  // First, find the "Cliente de Prueba" user ID
  db.get("SELECT id FROM user WHERE username = 'cliente' LIMIT 1", (err, clientRow) => {
    if (err) throw err;
    if (!clientRow) {
      console.log("No client found with username 'cliente'");
      return;
    }
    const clientId = clientRow.id;
    console.log("Found client with ID:", clientId);

    // Find the business ID
    db.get("SELECT id FROM business WHERE id = 1", (err, bizRow) => {
      if (err) throw err;
      if (!bizRow) {
         console.log("No business found");
         return;
      }
      const bizId = bizRow.id;
      console.log("Found business with ID:", bizId);

      // Create a reward for this business if it doesn't exist, requiring 10 points
      db.run("CREATE TABLE IF NOT EXISTS reward (id INTEGER PRIMARY KEY, name TEXT, description TEXT, validUntil TEXT, pointsRequired INTEGER, isActive BOOLEAN, createdAt TEXT, businessId INTEGER)", () => {
         
         db.run(`INSERT INTO reward (name, description, pointsRequired, isActive, createdAt, businessId) VALUES (?, ?, ?, ?, ?, ?)`, 
          ["Premio Simulación", "10 reservas conseguidas", 10, 1, new Date().toISOString(), bizId], function(err) {
            if (err) console.error("Reward insert error", err);
            else console.log("Created test reward requiring 10 points.");

            // Insert 10 bookings for the current month
            const stmt = db.prepare(`INSERT INTO appointment (date, time, status, userId, businessId, serviceName) VALUES (?, ?, ?, ?, ?, ?)`);
            
            for (let i = 1; i <= 10; i++) {
              const dayStr = i.toString().padStart(2, '0');
              stmt.run(`${CURRENT_MONTH}-${dayStr}`, '10:00', 'confirmed', clientId, bizId, 'Servicio Simulado');
            }
            
            stmt.finalize(() => {
              console.log("Successfully inserted 10 confirmed appointments for the current month!");
              db.close();
            });
         });
      });
    });
  });
});
