import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// 动态导入 CommonJS 模块
let app;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  // supertest 需要 require 方式加载 CJS 路由
  const userRouter = (await import('../../server/routes/user.js')).default
    ?? require('../../server/routes/user.js');
  app.use(userRouter);
});

describe('用户登录 POST /api/user/login', () => {
  it('使用正确的用户名密码应登录成功', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ username: 'admin', password: '123456' });

    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('登录成功');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('admin');
    expect(res.body.data.user.nickname).toBe('京东用户');
    // 不应返回密码
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('使用错误密码应登录失败', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(res.body.code).toBe(401);
    expect(res.body.message).toBe('用户名或密码错误');
    expect(res.body.data).toBeNull();
  });

  it('使用不存在的用户名应登录失败', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ username: 'nonexist_user_xyz', password: '123456' });

    expect(res.body.code).toBe(401);
  });
});

describe('用户注册 POST /api/user/register', () => {
  it('使用合法信息应注册成功', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({
        username: 'testuser001',
        password: '654321',
        nickname: '测试用户',
        phone: '13900001111',
      });

    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('注册成功');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('testuser001');
    expect(res.body.data.user.nickname).toBe('测试用户');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('用户名已存在应注册失败', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ username: 'admin', password: '123456' });

    expect(res.body.code).toBe(409);
    expect(res.body.message).toBe('用户名已存在');
  });

  it('用户名为空应注册失败', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ username: '', password: '123456' });

    expect(res.body.code).toBe(400);
  });

  it('密码过短应注册失败', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ username: 'newuser999', password: '12' });

    expect(res.body.code).toBe(400);
    expect(res.body.message).toContain('密码');
  });

  it('用户名过短应注册失败', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ username: 'ab', password: '123456' });

    expect(res.body.code).toBe(400);
    expect(res.body.message).toContain('用户名');
  });

  it('注册后可以用新账号登录', async () => {
    // 先注册
    await request(app)
      .post('/api/user/register')
      .send({ username: 'logintest01', password: 'abc123' });

    // 再登录
    const res = await request(app)
      .post('/api/user/login')
      .send({ username: 'logintest01', password: 'abc123' });

    expect(res.body.code).toBe(200);
    expect(res.body.data.user.username).toBe('logintest01');
  });
});

describe('获取个人信息 GET /api/user/profile', () => {
  it('默认获取 userId=1 的用户信息', async () => {
    const res = await request(app)
      .get('/api/user/profile');

    expect(res.body.code).toBe(200);
    expect(res.body.data.username).toBe('admin');
    expect(res.body.data.password).toBeUndefined();
  });

  it('通过 x-user-id 获取指定用户', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('x-user-id', '1');

    expect(res.body.code).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('不存在的用户应返回404', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('x-user-id', '99999');

    expect(res.body.code).toBe(404);
  });
});

describe('修改个人信息 PUT /api/user/profile', () => {
  it('修改昵称应成功', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('x-user-id', '1')
      .send({ nickname: '新昵称' });

    expect(res.body.code).toBe(200);
    expect(res.body.data.nickname).toBe('新昵称');
  });

  it('昵称为空应失败', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('x-user-id', '1')
      .send({ nickname: '' });

    expect(res.body.code).toBe(400);
  });

  it('昵称超过20个字符应失败', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('x-user-id', '1')
      .send({ nickname: '这个昵称超级长超级长超级长超级长超级长' });

    expect(res.body.code).toBe(400);
  });

  it('不存在的用户修改应返回404', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('x-user-id', '99999')
      .send({ nickname: '测试' });

    expect(res.body.code).toBe(404);
  });
});

describe('退出登录 POST /api/user/logout', () => {
  it('退出登录应返回成功', async () => {
    const res = await request(app)
      .post('/api/user/logout');

    expect(res.body.code).toBe(200);
    expect(res.body.message).toBe('退出成功');
  });
});

describe('我的订单 GET /api/user/orders', () => {
  it('获取订单列表应返回成功', async () => {
    const res = await request(app)
      .get('/api/user/orders')
      .set('x-user-id', '1');

    expect(res.body.code).toBe(200);
    expect(res.body.data.list).toBeDefined();
    expect(Array.isArray(res.body.data.list)).toBe(true);
    expect(res.body.data.total).toBeDefined();
  });

  it('按状态筛选订单', async () => {
    const res = await request(app)
      .get('/api/user/orders?status=0')
      .set('x-user-id', '1');

    expect(res.body.code).toBe(200);
    // 所有返回的订单状态都应为 0
    res.body.data.list.forEach((order) => {
      expect(order.status).toBe(0);
    });
  });

  it('获取订单详情应返回成功', async () => {
    const res = await request(app)
      .get('/api/user/orders/1')
      .set('x-user-id', '1');

    expect(res.body.code).toBe(200);
    expect(res.body.data.id).toBe(1);
  });

  it('不存在的订单应返回404', async () => {
    const res = await request(app)
      .get('/api/user/orders/99999')
      .set('x-user-id', '1');

    expect(res.body.code).toBe(404);
  });
});
