const express = require('express');
const cors = require('cors');
const { database, nextId, saveDatabase, DB_PATH } = require('./data/store');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

const ok = (res, data, message = '获取成功') => res.json({ code: 200, message, data });
const fail = (res, code, message) => res.status(code).json({ code, message, data: null });
const numberValue = value => Number(value || 0);
const cartFor = userId => {
  const key = String(userId);
  if (!Array.isArray(database.carts[key])) database.carts[key] = [];
  return database.carts[key];
};
const productById = id => database.products.find(product => Number(product.id) === Number(id));
const orderById = id => database.orders.find(order => Number(order.id) === Number(id));
const itemCount = order => order.items.reduce((total, item) => total + item.quantity, 0);
const orderSummary = order => ({
  ...order,
  quantity: itemCount(order),
  goodName: order.items[0]?.name || '',
  price: order.items[0]?.unitPrice || 0,
});
// ===== 前台用户模块路由 =====
const userRouter = require('./routes/user');
app.use(userRouter);

const Random = Mock.Random;

const mockUsers = Mock.mock({
  'list|3': [
    {
      'id|+1': 1,
      'username': /admin|manager|user/,
      'password': '123456',
      'role': '@pick(["admin", "manager", "user"])',
      'name': '@cname',
      'avatar': "@image('100x100', '#50B347', '#FFF', 'png', 'A')",
      'email': '@email',
      'phone': /^1[3-9]\d{9}$/,
      'createTime': '@datetime',
      'status': 1
    }
  ]
}).list;

const mockCategories = Mock.mock({
  'list|6': [
    {
      'id|+1': 1,
      'name': '@pick(["美妆", "母婴", "图书", "运动", "数码", "家居"])',
      'icon': "@image('50x50', '#4A90E2', '#FFF', 'png', 'I')",
      'sort|+1': 1,
      'status': 1,
      'createTime': '@datetime'
    }
  ]
}).list;

const mockProducts = Mock.mock({
  'list|20': [
    {
      'id|+1': 1,
      'name': '@ctitle(5, 20)',
      'categoryId': '@integer(1, 6)',
      'categoryName': '@pick(["美妆", "母婴", "图书", "运动", "数码", "家居"])',
      'price': '@integer(10, 10000)',
      'originalPrice': '@integer(20, 15000)',
      'stock': '@integer(10, 500)',
      'sales': '@integer(0, 1000)',
      'img': "@image('200x200', '#E8E8E8', '#FFF', 'png', '商品')",
      'description': '@cparagraph(1, 3)',
      'status': '@pick([0, 1])',
      'createTime': '@datetime',
      'updateTime': '@datetime'
    }
  ]
}).list;

const mockOrders = Mock.mock({
  'list|15': [
    {
      'id|+1': 1,
      'orderNo': /\d{14}/,
      'userId': '@integer(1, 100)',
      'userName': '@cname',
      'userPhone': /^1[3-9]\d{9}$/,
      'goodId': '@integer(1, 20)',
      'goodName': '@ctitle(5, 15)',
      'price': '@integer(100, 5000)',
      'quantity': '@integer(1, 5)',
      'totalAmount': '@integer(100, 10000)',
      'status|+1': 0,
      'payMethod': '@pick(["支付宝", "微信", "银行卡"])',
      'payTime': '@datetime',
      'createTime': '@datetime',
      'shipTime': '@datetime',
      'receiveTime': '@datetime',
      'address': '@county(true)',
      'receiver': '@cname',
      'receiverPhone': /^1[3-9]\d{9}$/
    }
  ]
}).list;

const mockRoles = Mock.mock({
  'list|3': [
    {
      'id|+1': 1,
      'name': '@pick(["超级管理员", "商品管理员", "订单管理员"])',
      'description': '@cparagraph(1, 2)',
      'permissions': ['dashboard', 'goods', 'categories', 'orders', 'users', 'roles'],
      'createTime': '@datetime'
    }
  ]
}).list;

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = database.users.find(item => item.username === username && item.password === password);
  if (!user) return fail(res, 401, '用户名或密码错误');

  return ok(res, {
    token: `mock-token-${Date.now()}`,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      email: user.email,
      phone: user.phone,
    },
  }, '登录成功');
});

app.get('/api/products', (req, res) => {
  const products = database.products.filter(product => Number(product.status) === 1);
  ok(res, products);
});

app.get('/api/categories', (req, res) => {
  ok(res, database.categories
    .filter(category => Number(category.status) === 1)
    .sort((a, b) => numberValue(a.sort) - numberValue(b.sort)));
});

app.get('/api/products/:id', (req, res) => {
  const product = productById(req.params.id);
  if (!product || Number(product.status) !== 1) return fail(res, 404, '商品不存在或已下架');
  return ok(res, product);
});

app.get('/api/users/:userId/cart', (req, res) => {
  ok(res, cartFor(req.params.userId));
});

app.post('/api/users/:userId/cart', (req, res) => {
  const product = productById(req.body.goodId ?? req.body.id);
  if (!product || Number(product.status) !== 1) return fail(res, 404, '商品不存在或已下架');

  const cart = cartFor(req.params.userId);
  const sku = req.body.sku || '默认规格';
  const cartKey = req.body.cartKey || `${product.id}-${sku}`;
  const quantity = Math.max(1, numberValue(req.body.quantity ?? req.body.count ?? 1));
  const existing = cart.find(item => item.cartKey === cartKey);

  if (existing) {
    existing.quantity += quantity;
    existing.selected = true;
  } else {
    cart.push({
      cartKey,
      goodId: product.id,
      id: product.id,
      name: product.name,
      img: product.img,
      price: product.price,
      sku,
      quantity,
      selected: req.body.selected !== false,
    });
  }
  saveDatabase();
  return ok(res, cart, '已加入购物车');
});

app.put('/api/users/:userId/cart/selection', (req, res) => {
  const cart = cartFor(req.params.userId);
  const { selected, cartKey } = req.body;
  cart.forEach(item => {
    if (!cartKey || item.cartKey === cartKey) item.selected = Boolean(selected);
  });
  saveDatabase();
  return ok(res, cart, '选择状态已更新');
});

app.put('/api/users/:userId/cart/:cartKey', (req, res) => {
  const cart = cartFor(req.params.userId);
  const item = cart.find(entry => entry.cartKey === req.params.cartKey);
  if (!item) return fail(res, 404, '购物车商品不存在');

  if (req.body.quantity !== undefined) item.quantity = Math.max(1, numberValue(req.body.quantity));
  if (req.body.selected !== undefined) item.selected = Boolean(req.body.selected);
  saveDatabase();
  return ok(res, item, '购物车已更新');
});

app.delete('/api/users/:userId/cart/:cartKey', (req, res) => {
  const cart = cartFor(req.params.userId);
  const index = cart.findIndex(item => item.cartKey === req.params.cartKey);
  if (index === -1) return fail(res, 404, '购物车商品不存在');
  cart.splice(index, 1);
  saveDatabase();
  return ok(res, null, '商品已移除');
});

app.post('/api/users/:userId/cart/remove-batch', (req, res) => {
  const keys = new Set(Array.isArray(req.body.cartKeys) ? req.body.cartKeys : []);
  database.carts[String(req.params.userId)] = cartFor(req.params.userId)
    .filter(item => !keys.has(item.cartKey));
  saveDatabase();
  return ok(res, database.carts[String(req.params.userId)], '商品已移除');
});

app.get('/api/users/:userId/orders', (req, res) => {
  const { status } = req.query;
  const orders = database.orders
    .filter(order => Number(order.userId) === Number(req.params.userId))
    .filter(order => status === undefined || order.status === Number(status));
  ok(res, orders);
});

app.post('/api/users/:userId/orders', (req, res) => {
  const requestedItems = Array.isArray(req.body.items) ? req.body.items : [];
  if (!requestedItems.length) return fail(res, 400, '订单中至少需要一件商品');

  const items = [];
  for (const requested of requestedItems) {
    const product = productById(requested.goodId ?? requested.id);
    if (!product || Number(product.status) !== 1) {
      return fail(res, 400, `商品 ${requested.name || requested.goodId} 不存在或已下架`);
    }
    const quantity = Math.max(1, numberValue(requested.quantity ?? requested.count ?? 1));
    if (numberValue(product.stock) < quantity) return fail(res, 400, `${product.name} 库存不足`);
    items.push({
      cartKey: requested.cartKey,
      goodId: product.id,
      name: product.name,
      img: product.img,
      sku: requested.sku || '默认规格',
      quantity,
      unitPrice: numberValue(product.price),
      subtotal: Number((numberValue(product.price) * quantity).toFixed(2)),
    });
  }

  const now = new Date().toISOString();
  const order = {
    id: nextId(database.orders),
    orderNo: `${Date.now()}${String(nextId(database.orders)).padStart(3, '0')}`,
    userId: Number(req.params.userId),
    userName: req.body.userName || req.body.receiver || '商城用户',
    userPhone: req.body.userPhone || req.body.receiverPhone || '',
    items,
    totalAmount: Number(items.reduce((total, item) => total + item.subtotal, 0).toFixed(2)),
    receiver: req.body.receiver || '',
    receiverPhone: req.body.receiverPhone || '',
    address: req.body.address || '',
    status: 0,
    payMethod: '',
    payTime: '',
    shipTime: '',
    receiveTime: '',
    createTime: now,
  };

  items.forEach(item => {
    const product = productById(item.goodId);
    product.stock = Math.max(0, numberValue(product.stock) - item.quantity);
    product.sales = numberValue(product.sales) + item.quantity;
    product.updateTime = now;
  });
  database.orders.unshift(order);

  const purchasedKeys = new Set(items.map(item => item.cartKey).filter(Boolean));
  if (purchasedKeys.size) {
    database.carts[String(req.params.userId)] = cartFor(req.params.userId)
      .filter(item => !purchasedKeys.has(item.cartKey));
  }
  saveDatabase();
  return ok(res, order, '订单创建成功');
});

app.get('/api/orders/:id', (req, res) => {
  const order = orderById(req.params.id);
  if (!order) return fail(res, 404, '订单不存在');
  return ok(res, order);
});

app.put('/api/orders/:id/pay', (req, res) => {
  const order = orderById(req.params.id);
  if (!order) return fail(res, 404, '订单不存在');
  if (order.status !== 0) return fail(res, 409, '订单已支付或无法支付');
  order.status = 1;
  order.payMethod = req.body.payMethod || '微信支付';
  order.payTime = new Date().toISOString();
  saveDatabase();
  return ok(res, order, '支付成功');
});

app.get('/api/admin/dashboard', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const paidOrders = database.orders.filter(order => order.status >= 1);
  ok(res, {
    totalUsers: database.users.length,
    todayUsers: database.users.filter(user => String(user.createTime).startsWith(today)).length,
    totalOrders: database.orders.length,
    todayOrders: database.orders.filter(order => String(order.createTime).startsWith(today)).length,
    totalProducts: database.products.length,
    onSaleProducts: database.products.filter(product => Number(product.status) === 1).length,
    totalSales: paidOrders.reduce((total, order) => total + numberValue(order.totalAmount), 0),
    todaySales: paidOrders
      .filter(order => String(order.payTime).startsWith(today))
      .reduce((total, order) => total + numberValue(order.totalAmount), 0),
    recentOrders: database.orders.slice(0, 5).map(orderSummary),
  });
});

app.get('/api/admin/products', (req, res) => {
  const { page = 1, pageSize = 10, keyword = '', categoryId = '' } = req.query;
  let list = [...database.products];
  if (keyword) list = list.filter(product => product.name.includes(keyword));
  if (categoryId) list = list.filter(product => product.categoryId === categoryId);
  const total = list.length;
  const start = (Number(page) - 1) * Number(pageSize);
  return ok(res, { list: list.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) });
});

app.post('/api/admin/products', (req, res) => {
  const category = database.categories.find(item => item.id === req.body.categoryId);
  if (!category) return fail(res, 400, '请选择有效分类');
  const now = new Date().toISOString();
  const product = {
    id: nextId(database.products),
    ...req.body,
    categoryName: category.name,
    price: numberValue(req.body.price),
    originalPrice: numberValue(req.body.originalPrice),
    stock: numberValue(req.body.stock),
    sales: numberValue(req.body.sales),
    rating: numberValue(req.body.rating) || 4.8,
    status: Number(req.body.status),
    createTime: now,
    updateTime: now,
  };
  database.products.unshift(product);
  saveDatabase();
  return ok(res, product, '添加成功');
});

app.put('/api/admin/products/:id', (req, res) => {
  const product = productById(req.params.id);
  if (!product) return fail(res, 404, '商品不存在');
  const category = database.categories.find(item => item.id === req.body.categoryId);
  Object.assign(product, req.body, {
    categoryName: category?.name || product.categoryName,
    price: numberValue(req.body.price),
    originalPrice: numberValue(req.body.originalPrice),
    stock: numberValue(req.body.stock),
    status: Number(req.body.status),
    updateTime: new Date().toISOString(),
  });
  saveDatabase();
  return ok(res, product, '更新成功');
});

app.delete('/api/admin/products/:id', (req, res) => {
  const index = database.products.findIndex(product => Number(product.id) === Number(req.params.id));
  if (index === -1) return fail(res, 404, '商品不存在');
  database.products.splice(index, 1);
  saveDatabase();
  return ok(res, null, '删除成功');
});

app.get('/api/admin/categories', (req, res) => ok(res, database.categories));

app.post('/api/admin/categories', (req, res) => {
  const id = String(req.body.id || req.body.name || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!id || database.categories.some(item => item.id === id)) return fail(res, 400, '分类标识无效或已存在');
  const category = { ...req.body, id, sort: numberValue(req.body.sort), status: Number(req.body.status), createTime: new Date().toISOString() };
  database.categories.push(category);
  saveDatabase();
  return ok(res, category, '添加成功');
});

app.put('/api/admin/categories/:id', (req, res) => {
  const category = database.categories.find(item => item.id === req.params.id);
  if (!category) return fail(res, 404, '分类不存在');
  Object.assign(category, req.body, { id: category.id, sort: numberValue(req.body.sort), status: Number(req.body.status) });
  database.products.filter(product => product.categoryId === category.id)
    .forEach(product => { product.categoryName = category.name; });
  saveDatabase();
  return ok(res, category, '更新成功');
});

app.delete('/api/admin/categories/:id', (req, res) => {
  if (database.products.some(product => product.categoryId === req.params.id)) return fail(res, 409, '该分类下仍有商品，不能删除');
  const index = database.categories.findIndex(category => category.id === req.params.id);
  if (index === -1) return fail(res, 404, '分类不存在');
  database.categories.splice(index, 1);
  saveDatabase();
  return ok(res, null, '删除成功');
});

app.get('/api/admin/orders', (req, res) => {
  const { page = 1, pageSize = 10, status = '' } = req.query;
  let list = [...database.orders];
  if (status !== '') list = list.filter(order => order.status === Number(status));
  const total = list.length;
  const start = (Number(page) - 1) * Number(pageSize);
  return ok(res, {
    list: list.slice(start, start + Number(pageSize)).map(orderSummary),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  });
});

app.get('/api/admin/orders/:id', (req, res) => {
  const order = orderById(req.params.id);
  if (!order) return fail(res, 404, '订单不存在');
  return ok(res, orderSummary(order));
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const order = orderById(req.params.id);
  if (!order) return fail(res, 404, '订单不存在');
  const status = Number(req.body.status);
  order.status = status;
  if (status === 1 && !order.payTime) order.payTime = new Date().toISOString();
  if (status === 2) order.shipTime = new Date().toISOString();
  if (status === 3) order.receiveTime = new Date().toISOString();
  saveDatabase();
  return ok(res, orderSummary(order), '更新成功');
});

app.get('/api/admin/users', (req, res) => ok(res, database.users.map(user => ({
  id: user.id,
  username: user.username,
  role: user.role,
  name: user.name,
  avatar: user.avatar,
  email: user.email,
  phone: user.phone,
  createTime: user.createTime,
  status: user.status,
}))));
app.get('/api/admin/roles', (req, res) => ok(res, database.roles));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
  console.log('Test accounts: admin / manager / user, password: 123456');
});
