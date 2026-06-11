const express = require('express');
const cors = require('cors');

function createApp(store) {
  const { database, nextId, saveDatabase } = store;
  const app = express();
  
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
    const { page, pageSize, keyword = '', categoryId = '' } = req.query;
    const normalizedKeyword = String(keyword).trim().toLowerCase();
    const hasPagination = page !== undefined || pageSize !== undefined;
    let products = database.products.filter(product => Number(product.status) === 1);

    if (categoryId && categoryId !== 'all') {
      products = products.filter(product => product.categoryId === categoryId);
    }
    if (normalizedKeyword) {
      products = products.filter(product => {
        const text = [
          product.name,
          product.categoryName,
          product.description,
        ].filter(Boolean).join(' ').toLowerCase();
        return text.includes(normalizedKeyword);
      });
    }

    if (!hasPagination) return ok(res, products);

    const currentPage = Math.max(1, Number(page) || 1);
    const currentPageSize = Math.max(1, Math.min(50, Number(pageSize) || 10));
    const total = products.length;
    const start = (currentPage - 1) * currentPageSize;
    const list = products.slice(start, start + currentPageSize);

    return ok(res, {
      list,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      hasMore: start + list.length < total,
    });
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
  
  app.post('/api/admin/users', (req, res) => {
    const { username, password, name, email, phone, avatar, role, status } = req.body;
    
    if (!username || !password) {
      return fail(res, 400, '用户名和密码不能为空');
    }
    
    if (database.users.some(u => u.username === username)) {
      return fail(res, 400, '用户名已存在');
    }
    
    const now = new Date().toISOString();
    const user = {
      id: nextId(database.users),
      username,
      password,
      name: name || username,
      email: email || '',
      phone: phone || '',
      avatar: avatar || '/assets/home/icons/recommend.svg',
      role: role || 'user',
      status: status !== undefined ? Number(status) : 1,
      createTime: now,
    };
    
    database.users.unshift(user);
    saveDatabase();
    
    return ok(res, {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      createTime: user.createTime,
      status: user.status,
    }, '用户创建成功');
  });
  
  app.put('/api/admin/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const userIndex = database.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return fail(res, 404, '用户不存在');
    }
    
    const user = database.users[userIndex];
    const { name, email, phone, avatar, role, status } = req.body;
    
    // 更新用户信息（不允许修改 username 和 password）
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    
    saveDatabase();
    return ok(res, {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
      createTime: user.createTime,
      status: user.status,
    }, '用户更新成功');
  });
  
  app.delete('/api/admin/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const userIndex = database.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return fail(res, 404, '用户不存在');
    }
    
    const user = database.users[userIndex];
    // 不允许删除超级管理员
    if (user.role === 'admin') {
      return fail(res, 403, '超级管理员不能删除');
    }
    
    database.users.splice(userIndex, 1);
    saveDatabase();
    return ok(res, null, '用户删除成功');
  });
  
  app.get('/api/admin/roles', (req, res) => ok(res, database.roles));
  
  app.post('/api/admin/roles', (req, res) => {
    const { name, description, permissions } = req.body;
    
    if (!name) {
      return fail(res, 400, '角色名称不能为空');
    }
    
    const now = new Date().toISOString();
    const role = {
      id: nextId(database.roles),
      name,
      description: description || '',
      permissions: permissions || [],
      createTime: now,
    };
    
    database.roles.push(role);
    saveDatabase();
    
    return ok(res, role, '角色创建成功');
  });
  
  app.put('/api/admin/roles/:id', (req, res) => {
    const roleId = Number(req.params.id);
    const roleIndex = database.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      return fail(res, 404, '角色不存在');
    }
    
    const role = database.roles[roleIndex];
    const { name, description, permissions } = req.body;
    
    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    
    saveDatabase();
    return ok(res, role, '角色更新成功');
  });
  
  app.delete('/api/admin/roles/:id', (req, res) => {
    const roleId = Number(req.params.id);
    const roleIndex = database.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) {
      return fail(res, 404, '角色不存在');
    }
    
    const role = database.roles[roleIndex];
    // 不允许删除超级管理员角色
    if (role.id === 1) {
      return fail(res, 403, '超级管理员角色不能删除');
    }
    
    // 检查是否有用户正在使用此角色
    const roleKey = role.name === '超级管理员' ? 'admin' : 
                    role.name === '商品管理员' ? 'manager' : 'user';
    const usersWithRole = database.users.filter(u => u.role === roleKey);
    if (usersWithRole.length > 0) {
      return fail(res, 409, '该角色下还有用户，不能删除');
    }
    
    database.roles.splice(roleIndex, 1);
    saveDatabase();
    return ok(res, null, '角色删除成功');
  });

  // ===== 前台用户相关 API =====
  const safeUser = (user) => {
    const { password, ...rest } = user;
    return rest;
  };

  // 前台用户登录
  app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;
    const user = database.users.find(u => u.username === username && u.password === password);

    if (user) {
      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token: 'front-token-' + Date.now(),
          user: safeUser(user),
        },
      });
    } else {
      res.json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }
  });

  // 前台用户注册
  app.post('/api/user/register', (req, res) => {
    const { username, password, nickname, phone } = req.body;

    // 参数校验
    if (!username || !password) {
      return res.json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null,
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.json({
        code: 400,
        message: '用户名长度应在3-20个字符之间',
        data: null,
      });
    }

    if (password.length < 6 || password.length > 32) {
      return res.json({
        code: 400,
        message: '密码长度应在6-32个字符之间',
        data: null,
      });
    }

    // 检查用户名是否已存在
    const existUser = database.users.find(u => u.username === username);
    if (existUser) {
      return res.json({
        code: 409,
        message: '用户名已存在',
        data: null,
      });
    }

    // 检查手机号是否已注册
    if (phone) {
      const existPhone = database.users.find(u => u.phone === phone);
      if (existPhone) {
        return res.json({
          code: 409,
          message: '该手机号已注册',
          data: null,
        });
      }
    }

    // 创建新用户
    const newUser = {
      id: nextId(database.users),
      username,
      password,
      nickname: nickname || '新用户',
      name: nickname || username,
      phone: phone || '',
      avatar: '/assets/home/icons/recommend.svg',
      role: 'user',
      status: 1,
      createTime: new Date().toISOString(),
    };

    database.users.push(newUser);
    saveDatabase();

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        token: 'front-token-' + Date.now(),
        user: safeUser(newUser),
      },
    });
  });

  // 获取当前用户信息
  app.get('/api/user/profile', (req, res) => {
    // 简化鉴权：从 header 中取 userId
    const userId = parseInt(req.headers['x-user-id']) || 1;
    const user = database.users.find(u => Number(u.id) === userId);

    if (user) {
      res.json({
        code: 200,
        message: '获取成功',
        data: safeUser(user),
      });
    } else {
      res.json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }
  });

  // 修改个人信息
  app.put('/api/user/profile', (req, res) => {
    const userId = parseInt(req.headers['x-user-id']) || 1;
    const user = database.users.find(u => Number(u.id) === userId);

    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在',
        data: null,
      });
    }

    const { nickname, phone, avatar, email } = req.body;

    if (nickname !== undefined) {
      if (nickname.length < 1 || nickname.length > 20) {
        return res.json({
          code: 400,
          message: '昵称长度应在1-20个字符之间',
          data: null,
        });
      }
      user.nickname = nickname;
      user.name = nickname;
    }
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (email !== undefined) user.email = email;

    saveDatabase();
    res.json({
      code: 200,
      message: '修改成功',
      data: safeUser(user),
    });
  });

  // 退出登录
  app.post('/api/user/logout', (req, res) => {
    res.json({
      code: 200,
      message: '退出成功',
      data: null,
    });
  });

  // 获取我的订单列表
  app.get('/api/user/orders', (req, res) => {
    const userId = parseInt(req.headers['x-user-id']) || 1;
    const { status, page = 1, pageSize = 10 } = req.query;

    let list = database.orders.filter(o => Number(o.userId) === userId);

    if (status !== undefined && status !== '') {
      list = list.filter(o => o.status === parseInt(status));
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + parseInt(pageSize);
    const pageList = list.slice(start, end);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: pageList.map(orderSummary),
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  });

  // 获取订单详情
  app.get('/api/user/orders/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const order = orderById(id);

    if (order) {
      res.json({
        code: 200,
        message: '获取成功',
        data: orderSummary(order),
      });
    } else {
      res.json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }
  });

  return app;
}

module.exports = { createApp };

if (require.main === module) {
  const { database, nextId, saveDatabase, DB_PATH } = require('./data/store');
  const PORT = Number(process.env.PORT || 5000);
  const app = createApp({ database, nextId, saveDatabase });
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
    console.log('Test accounts: admin / manager / user, password: 123456');
  });
}
