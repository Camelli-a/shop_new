const express = require('express');
const Mock = require('mockjs');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } else {
    res.json({
      code: 401,
      message: '用户名或密码错误',
      data: null
    });
  }
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      totalUsers: Random.integer(100, 10000),
      todayUsers: Random.integer(10, 100),
      totalOrders: mockOrders.length,
      todayOrders: Random.integer(5, 50),
      totalProducts: mockProducts.length,
      onSaleProducts: mockProducts.filter(p => p.status === 1).length,
      totalSales: Random.integer(100000, 1000000),
      todaySales: Random.integer(1000, 10000),
      recentOrders: mockOrders.slice(0, 5)
    }
  });
});

app.get('/api/admin/products', (req, res) => {
  const { page = 1, pageSize = 10, keyword = '', categoryId = '' } = req.query;
  let list = [...mockProducts];
  
  if (keyword) {
    list = list.filter(p => p.name.includes(keyword));
  }
  
  if (categoryId) {
    list = list.filter(p => p.categoryId === parseInt(categoryId));
  }
  
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const pageList = list.slice(start, end);
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: pageList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

app.post('/api/admin/products', (req, res) => {
  const product = {
    id: mockProducts.length + 1,
    ...req.body,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };
  mockProducts.unshift(product);
  res.json({
    code: 200,
    message: '添加成功',
    data: product
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts[index] = { ...mockProducts[index], ...req.body, updateTime: new Date().toISOString() };
    res.json({
      code: 200,
      message: '更新成功',
      data: mockProducts[index]
    });
  } else {
    res.json({
      code: 404,
      message: '商品不存在',
      data: null
    });
  }
});

app.delete('/api/admin/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts.splice(index, 1);
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } else {
    res.json({
      code: 404,
      message: '商品不存在',
      data: null
    });
  }
});

app.get('/api/admin/categories', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: mockCategories
  });
});

app.post('/api/admin/categories', (req, res) => {
  const category = {
    id: mockCategories.length + 1,
    ...req.body,
    createTime: new Date().toISOString()
  };
  mockCategories.push(category);
  res.json({
    code: 200,
    message: '添加成功',
    data: category
  });
});

app.put('/api/admin/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    mockCategories[index] = { ...mockCategories[index], ...req.body };
    res.json({
      code: 200,
      message: '更新成功',
      data: mockCategories[index]
    });
  } else {
    res.json({
      code: 404,
      message: '分类不存在',
      data: null
    });
  }
});

app.delete('/api/admin/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = mockCategories.findIndex(c => c.id === id);
  if (index !== -1) {
    mockCategories.splice(index, 1);
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } else {
    res.json({
      code: 404,
      message: '分类不存在',
      data: null
    });
  }
});

app.get('/api/admin/orders', (req, res) => {
  const { page = 1, pageSize = 10, status = '' } = req.query;
  let list = [...mockOrders];
  
  if (status !== '') {
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
      list: pageList,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

app.get('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = mockOrders.find(o => o.id === id);
  if (order) {
    res.json({
      code: 200,
      message: '获取成功',
      data: order
    });
  } else {
    res.json({
      code: 404,
      message: '订单不存在',
      data: null
    });
  }
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = mockOrders.find(o => o.id === id);
  if (order) {
    order.status = status;
    if (status === 1) {
      order.payTime = new Date().toISOString();
    } else if (status === 2) {
      order.shipTime = new Date().toISOString();
    } else if (status === 3) {
      order.receiveTime = new Date().toISOString();
    }
    res.json({
      code: 200,
      message: '更新成功',
      data: order
    });
  } else {
    res.json({
      code: 404,
      message: '订单不存在',
      data: null
    });
  }
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: mockUsers
  });
});

app.get('/api/admin/roles', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: mockRoles
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Test accounts:');
  console.log('  Username: admin, Password: 123456');
  console.log('  Username: manager, Password: 123456');
  console.log('  Username: user, Password: 123456');
});
