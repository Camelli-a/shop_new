
const request = require('supertest');
const { createApp } = require('./server');
const { createSeedData } = require('./data/seedData');

describe('API Tests', () => {
  let app;
  let store;
  let database;

  beforeEach(() => {
    const seedData = createSeedData();
    database = JSON.parse(JSON.stringify(seedData));
    
    const nextId = (list) => list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const saveDatabase = vi.fn();
    
    store = { database, nextId, saveDatabase };
    app = createApp(store);
  });

  describe('Authentication', () => {
    test('POST /api/admin/login should succeed with correct credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: '123456' });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.data.user.username).toBe('admin');
      expect(response.body.data.token).toBeDefined();
    });

    test('POST /api/admin/login should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ username: 'admin', password: 'wrong' });
      
      expect(response.status).toBe(401);
    });

    test('POST /api/admin/login should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ username: 'nonexistent', password: '123456' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Products API', () => {
    test('GET /api/products should return active products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(product => {
        expect(product.status).toBe(1);
      });
    });

    test('GET /api/products/:id should return product by id', async () => {
      const response = await request(app).get('/api/products/1');
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(1);
    });

    test('GET /api/products/:id should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/9999');
      expect(response.status).toBe(404);
    });
  });

  describe('Categories API', () => {
    test('GET /api/categories should return active categories sorted by sort', async () => {
      const response = await request(app).get('/api/categories');
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].sort).toBeLessThanOrEqual(response.body.data[i + 1].sort);
      }
    });
  });

  describe('Cart API', () => {
    test('GET /api/users/:userId/cart should return empty cart initially', async () => {
      const response = await request(app).get('/api/users/1/cart');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test('POST /api/users/:userId/cart should add product to cart', async () => {
      const response = await request(app)
        .post('/api/users/1/cart')
        .send({ goodId: 1, sku: 'test', quantity: 2 });
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].goodId).toBe(1);
      expect(store.saveDatabase).toHaveBeenCalled();
    });

    test('POST /api/users/:userId/cart should increment quantity if product already exists', async () => {
      await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'test', quantity: 2 });
      const response = await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'test', quantity: 3 });
      
      expect(response.body.data[0].quantity).toBe(5);
    });

    test('PUT /api/users/:userId/cart/selection should update selection', async () => {
      await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'test', quantity: 1 });
      
      const response = await request(app)
        .put('/api/users/1/cart/selection')
        .send({ selected: false });
      
      expect(response.body.data[0].selected).toBe(false);
    });

    test('PUT /api/users/:userId/cart/:cartKey should update item', async () => {
      await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'test', quantity: 1, cartKey: '1-test' });
      
      const response = await request(app)
        .put('/api/users/1/cart/1-test')
        .send({ quantity: 5 });
      
      expect(response.body.data.quantity).toBe(5);
    });

    test('DELETE /api/users/:userId/cart/:cartKey should remove item', async () => {
      await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'test', quantity: 1, cartKey: '1-test' });
      
      const response = await request(app).delete('/api/users/1/cart/1-test');
      expect(response.status).toBe(200);
      
      const cartResponse = await request(app).get('/api/users/1/cart');
      expect(cartResponse.body.data.length).toBe(0);
    });

    test('POST /api/users/:userId/cart/remove-batch should remove multiple items', async () => {
      await request(app).post('/api/users/1/cart').send({ goodId: 1, sku: 'a', cartKey: '1-a' });
      await request(app).post('/api/users/1/cart').send({ goodId: 2, sku: 'b', cartKey: '2-b' });
      
      const response = await request(app)
        .post('/api/users/1/cart/remove-batch')
        .send({ cartKeys: ['1-a', '2-b'] });
      
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('Orders API', () => {
    test('POST /api/users/:userId/orders should create order', async () => {
      const initialStock = database.products[0].stock;
      
      const response = await request(app)
        .post('/api/users/1/orders')
        .send({
          items: [{ goodId: 1, quantity: 2 }],
          receiver: 'Test User',
          receiverPhone: '123456789',
          address: 'Test Address'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.status).toBe(0);
      expect(database.products[0].stock).toBe(initialStock - 2);
      expect(database.products[0].sales).toBeGreaterThan(0);
    });

    test('POST /api/users/:userId/orders should fail with empty items', async () => {
      const response = await request(app)
        .post('/api/users/1/orders')
        .send({ items: [] });
      
      expect(response.status).toBe(400);
    });

    test('PUT /api/orders/:id/pay should mark order as paid', async () => {
      await request(app)
        .post('/api/users/1/orders')
        .send({
          items: [{ goodId: 1, quantity: 1 }],
          receiver: 'Test'
        });
      
      const response = await request(app)
        .put('/api/orders/1/pay')
        .send({ payMethod: '支付宝' });
      
      expect(response.body.data.status).toBe(1);
      expect(response.body.data.payMethod).toBe('支付宝');
    });

    test('GET /api/users/:userId/orders should return user orders', async () => {
      await request(app)
        .post('/api/users/1/orders')
        .send({
          items: [{ goodId: 1, quantity: 1 }],
          receiver: 'Test'
        });
      
      const response = await request(app).get('/api/users/1/orders');
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Dashboard', () => {
    test('GET /api/admin/dashboard should return dashboard data', async () => {
      const response = await request(app).get('/api/admin/dashboard');
      expect(response.status).toBe(200);
      expect(response.body.data.totalUsers).toBeDefined();
      expect(response.body.data.totalProducts).toBeDefined();
      expect(response.body.data.totalOrders).toBeDefined();
    });
  });

  describe('Admin Products API', () => {
    test('GET /api/admin/products should return products with pagination', async () => {
      const response = await request(app).get('/api/admin/products?page=1&pageSize=5');
      expect(response.status).toBe(200);
      expect(response.body.data.list.length).toBeLessThanOrEqual(5);
      expect(response.body.data.total).toBeDefined();
    });

    test('POST /api/admin/products should create product', async () => {
      const newProduct = {
        name: 'New Product',
        categoryId: 'digital',
        price: 100,
        originalPrice: 150,
        stock: 50,
        status: 1
      };
      
      const response = await request(app)
        .post('/api/admin/products')
        .send(newProduct);
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('New Product');
    });

    test('PUT /api/admin/products/:id should update product', async () => {
      const response = await request(app)
        .put('/api/admin/products/1')
        .send({ name: 'Updated Product', categoryId: 'digital' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Product');
    });

    test('DELETE /api/admin/products/:id should delete product', async () => {
      const initialCount = database.products.length;
      
      const response = await request(app).delete('/api/admin/products/1');
      expect(response.status).toBe(200);
      
      expect(database.products.length).toBe(initialCount - 1);
    });
  });

  describe('Admin Categories API', () => {
    test('GET /api/admin/categories should return all categories', async () => {
      const response = await request(app).get('/api/admin/categories');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('POST /api/admin/categories should create category', async () => {
      const response = await request(app)
        .post('/api/admin/categories')
        .send({ name: 'New Category', sort: 10, status: 1 });
      
      expect(response.status).toBe(200);
    });

    test('PUT /api/admin/categories/:id should update category', async () => {
      const response = await request(app)
        .put('/api/admin/categories/digital')
        .send({ name: 'Updated Digital' });
      
      expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/categories/:id should delete empty category', async () => {
      database.products = database.products.filter(p => p.categoryId !== 'sport');
      
      const response = await request(app).delete('/api/admin/categories/sport');
      expect(response.status).toBe(200);
    });

    test('DELETE /api/admin/categories/:id should fail if category has products', async () => {
      const response = await request(app).delete('/api/admin/categories/digital');
      expect(response.status).toBe(409);
    });
  });

  describe('Admin Orders API', () => {
    test('GET /api/admin/orders should return orders with pagination', async () => {
      const response = await request(app).get('/api/admin/orders?page=1&pageSize=10');
      expect(response.status).toBe(200);
      expect(response.body.data.list).toBeDefined();
    });

    test('PUT /api/admin/orders/:id/status should update order status', async () => {
      await request(app)
        .post('/api/users/1/orders')
        .send({
          items: [{ goodId: 1, quantity: 1 }],
          receiver: 'Test'
        });
      
      const response = await request(app)
        .put('/api/admin/orders/1/status')
        .send({ status: 2 });
      
      expect(response.body.data.status).toBe(2);
      expect(response.body.data.shipTime).toBeDefined();
    });
  });

  describe('Admin Users and Roles', () => {
    test('GET /api/admin/users should return users', async () => {
      const response = await request(app).get('/api/admin/users');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/admin/roles should return roles', async () => {
      const response = await request(app).get('/api/admin/roles');
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});

