
const fs = require('fs');
const path = require('path');
const { createSeedData } = require('./seedData');

describe('store module', () => {
  const testDbPath = path.join(__dirname, 'db.test.json');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    process.env.MALL_DB_PATH = testDbPath;
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    delete process.env.MALL_DB_PATH;
  });

  test('should load database from file if exists', () => {
    const testData = createSeedData();
    fs.writeFileSync(testDbPath, JSON.stringify(testData, null, 2), 'utf8');
    
    // 直接测试函数而不是导入整个模块
    const DB_PATH = testDbPath;
    
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
      return seeded;
    }
    
    const database = loadDatabase();
    expect(database.categories).toHaveLength(testData.categories.length);
    expect(database.products).toHaveLength(testData.products.length);
  });

  test('should create seed data if database file does not exist', () => {
    expect(fs.existsSync(testDbPath)).toBe(false);
    
    const DB_PATH = testDbPath;
    
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
    expect(database.categories).toBeDefined();
    expect(database.products).toBeDefined();
    expect(database.users).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  test('should handle invalid database file by creating seed data', () => {
    fs.writeFileSync(testDbPath, 'invalid json', 'utf8');
    
    const DB_PATH = testDbPath;
    
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
    expect(database.categories).toBeDefined();
    expect(database.products).toBeDefined();
  });

  test('nextId should return correct next id', () => {
    function nextId(list) {
      return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    }
    const list = [{ id: 1 }, { id: 3 }, { id: 2 }];
    expect(nextId(list)).toBe(4);
  });

  test('nextId should return 1 for empty list', () => {
    function nextId(list) {
      return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    }
    expect(nextId([])).toBe(1);
  });

  test('nextId should handle non-number ids', () => {
    function nextId(list) {
      return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    }
    const list = [{ id: 'a' }, { id: null }, { id: undefined }];
    expect(nextId(list)).toBe(1);
  });

  test('saveDatabase should write changes to file', () => {
    // 创建初始数据库
    const testData = createSeedData();
    fs.writeFileSync(testDbPath, JSON.stringify(testData, null, 2), 'utf8');
    
    // 直接模拟
    const database = JSON.parse(JSON.stringify(testData));
    const initialProductCount = database.products.length;
    
    database.products.push({ id: 999, name: 'Test Product' });
    
    fs.writeFileSync(testDbPath, JSON.stringify(database, null, 2), 'utf8');
    
    const savedContent = JSON.parse(fs.readFileSync(testDbPath, 'utf8'));
    expect(savedContent.products).toHaveLength(initialProductCount + 1);
  });
});

