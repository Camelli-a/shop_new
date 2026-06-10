const express = require('express');
const Mock = require('mockjs');

const router = express.Router();
const Random = Mock.Random;

// ===== 前台用户模块 Mock 数据 =====
const mockFrontUsers = Mock.mock({
  'list|5': [
    {
      'id|+1': 100,
      'username': '@word(4, 8)',
      'password': '123456',
      'nickname': '@cname',
      'phone': /^1[3-9]\d{9}$/,
      'gender': '@pick(["男", "女"])',
      'avatar': "@image('100x100', '#4A90E2', '#FFF', 'png', 'U')",
      'createTime': '@datetime',
      'status': 1,
    },
  ],
}).list;

// 预置一个默认用户，方便测试
mockFrontUsers.unshift({
  id: 1,
  username: 'admin',
  password: '123456',
  nickname: '京东用户',
  phone: '13888888888',
  gender: '男',
  avatar: "/assets/home/icons/recommend.svg",
  createTime: '2024-01-01 00:00:00',
  status: 1,
});

// ===== 前台用户订单 Mock 数据 =====
const mockFrontOrders = Mock.mock({
  'list|10': [
    {
      'id|+1': 1,
      'orderNo': /\d{14}/,
      'userId': 1,
      'goodId': '@integer(1, 20)',
      'goodName': '@ctitle(5, 15)',
      'goodImg': "@image('200x200', '#E8E8E8', '#FFF', 'png', '商品')",
      'price': '@integer(10, 5000)',
      'quantity': '@integer(1, 5)',
      'totalAmount': '@integer(100, 10000)',
      'status': '@pick([0, 1, 2, 3])',
      'payMethod': '@pick(["支付宝", "微信", "银行卡"])',
      'payTime': '@datetime',
      'createTime': '@datetime',
      'address': '@county(true)',
      'receiver': '@cname',
      'receiverPhone': /^1[3-9]\d{9}$/,
    },
  ],
}).list;

// ===== 辅助函数 =====
function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// ===== 前台用户登录 =====
router.post('/api/user/login', (req, res) => {
  const { username, password } = req.body;
  const user = mockFrontUsers.find(
    (u) => u.username === username && u.password === password
  );

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

// ===== 前台用户注册 =====
router.post('/api/user/register', (req, res) => {
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
  const existUser = mockFrontUsers.find((u) => u.username === username);
  if (existUser) {
    return res.json({
      code: 409,
      message: '用户名已存在',
      data: null,
    });
  }

  // 检查手机号是否已注册
  if (phone) {
    const existPhone = mockFrontUsers.find((u) => u.phone === phone);
    if (existPhone) {
      return res.json({
        code: 409,
        message: '该手机号已注册',
        data: null,
      });
    }
  }

  // 创建新用户
  const maxId = mockFrontUsers.reduce(
    (max, u) => Math.max(max, Number(u.id) || 0),
    0
  );
  const newUser = {
    id: maxId + 1,
    username,
    password,
    nickname: nickname || '新用户' + Random.string('number', 4),
    phone: phone || '',
    gender: '男',
    avatar: "@image('100x100', '#50B347', '#FFF', 'png', 'U')",
    createTime: new Date().toISOString(),
    status: 1,
  };

  mockFrontUsers.push(newUser);

  res.json({
    code: 200,
    message: '注册成功',
    data: {
      token: 'front-token-' + Date.now(),
      user: safeUser(newUser),
    },
  });
});

// ===== 获取当前用户信息 =====
router.get('/api/user/profile', (req, res) => {
  // 简化鉴权：从 header 中取 userId
  const userId = parseInt(req.headers['x-user-id']) || 1;
  const user = mockFrontUsers.find((u) => u.id === userId);

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

// ===== 修改个人信息 =====
router.put('/api/user/profile', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']) || 1;
  const user = mockFrontUsers.find((u) => u.id === userId);

  if (!user) {
    return res.json({
      code: 404,
      message: '用户不存在',
      data: null,
    });
  }

  const { nickname, phone, gender } = req.body;

  if (nickname !== undefined) {
    if (nickname.length < 1 || nickname.length > 20) {
      return res.json({
        code: 400,
        message: '昵称长度应在1-20个字符之间',
        data: null,
      });
    }
    user.nickname = nickname;
  }
  if (phone !== undefined) user.phone = phone;
  if (gender !== undefined) user.gender = gender;

  res.json({
    code: 200,
    message: '修改成功',
    data: safeUser(user),
  });
});

// ===== 退出登录 =====
router.post('/api/user/logout', (req, res) => {
  res.json({
    code: 200,
    message: '退出成功',
    data: null,
  });
});

// ===== 获取我的订单列表 =====
router.get('/api/user/orders', (req, res) => {
  const userId = parseInt(req.headers['x-user-id']) || 1;
  const { status, page = 1, pageSize = 10 } = req.query;

  let list = mockFrontOrders.filter((o) => o.userId === userId);

  if (status !== undefined && status !== '') {
    list = list.filter((o) => o.status === parseInt(status));
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
      pageSize: parseInt(pageSize),
    },
  });
});

// ===== 获取订单详情 =====
router.get('/api/user/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = mockFrontOrders.find((o) => o.id === id);

  if (order) {
    res.json({
      code: 200,
      message: '获取成功',
      data: order,
    });
  } else {
    res.json({
      code: 404,
      message: '订单不存在',
      data: null,
    });
  }
});

module.exports = router;
