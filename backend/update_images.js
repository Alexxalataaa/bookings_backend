const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const fixedImagesByCategory = {
  'Salud': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80',
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80'
  ],
  'Belleza': [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80',
    'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&q=80',
    'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=800&q=80',
    'https://images.unsplash.com/photo-1516975080661-46b0a8806283?w=800&q=80'
  ],
  'Deporte': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80'
  ],
  'Nutrición': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1498837167922-41c543bd8bf2?w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=800&q=80',
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80'
  ],
  'Psicología': [
    'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
    'https://images.unsplash.com/photo-1520694478166-daaaaec95b69?w=800&q=80',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80'
  ]
};

db.serialize(() => {
  db.all("SELECT id, category FROM business", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    
    const stmt = db.prepare("UPDATE business SET image = ? WHERE id = ?");
    
    rows.forEach(row => {
      const categoryImages = fixedImagesByCategory[row.category] || fixedImagesByCategory['Belleza'];
      // pick one randomly based on id so it's deterministic but varied
      const imageIndex = row.id % categoryImages.length;
      const imageUrl = categoryImages[imageIndex];
      stmt.run([imageUrl, row.id]);
    });
    
    stmt.finalize(() => {
      console.log("Updated images for " + rows.length + " businesses.");
      db.close();
    });
  });
});
