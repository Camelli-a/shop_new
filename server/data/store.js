const fs = require('fs');
const path = require('path');
const { createSeedData } = require('./seedData');

const DB_PATH = process.env.MALL_DB_PATH
  ? path.resolve(process.env.MALL_DB_PATH)
  : path.join(__dirname, 'db.json');

function isValidDatabase(data) {
  return data
    && Array.isArray(data.categories)
    && Array.isArray(data.products)
    && Array.isArray(data.users)
    && Array.isArray(data.roles)
    && Array.isArray(data.orders)
    && data.carts
    && typeof data.carts === 'object';
}

function writeDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function loadDatabase() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      if (isValidDatabase(parsed)) return parsed;
    } catch {
      // Invalid local data is replaced with a clean seed database.
    }
  }

  const seeded = createSeedData();
  writeDatabase(seeded);
  return seeded;
}

const database = loadDatabase();

function saveDatabase() {
  writeDatabase(database);
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

module.exports = {
  database,
  nextId,
  saveDatabase,
  DB_PATH,
};
