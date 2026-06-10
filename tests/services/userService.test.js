import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// 每次测试重新加载 userService
let userService;

beforeEach(async () => {
  localStorageMock.clear();
  vi.resetModules();
  vi.restoreAllMocks();
  const mod = await import('../../src/services/userService.js');
  userService = mod.default;
});

describe('userService.login', () => {
  it('登录成功应返回用户信息并存储到 localStorage', async () => {
    const mockResponse = {
      code: 200,
      message: '登录成功',
      data: {
        token: 'test-token-123',
        user: { id: 1, username: 'admin', nickname: '京东用户' },
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.login('admin', '123456');

    expect(result.success).toBe(true);
    expect(result.user.username).toBe('admin');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123456' }),
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('登录失败应返回错误信息', async () => {
    const mockResponse = {
      code: 401,
      message: '用户名或密码错误',
      data: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.login('admin', 'wrong');

    expect(result.success).toBe(false);
    expect(result.error).toBe('用户名或密码错误');
  });

  it('网络错误应返回友好提示', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await userService.login('admin', '123456');

    expect(result.success).toBe(false);
    expect(result.error).toContain('网络');
  });
});

describe('userService.register', () => {
  it('注册成功应返回用户信息', async () => {
    const mockResponse = {
      code: 200,
      message: '注册成功',
      data: {
        token: 'new-token-456',
        user: { id: 101, username: 'newuser', nickname: '新用户' },
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.register('newuser', '123456', {
      nickname: '新用户',
      phone: '13900001111',
    });

    expect(result.success).toBe(true);
    expect(result.user.username).toBe('newuser');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'newuser',
        password: '123456',
        nickname: '新用户',
        phone: '13900001111',
      }),
    });
  });

  it('用户名已存在应返回错误', async () => {
    const mockResponse = {
      code: 409,
      message: '用户名已存在',
      data: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.register('admin', '123456', {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('用户名已存在');
  });
});

describe('userService.updateProfile', () => {
  it('修改昵称成功应更新本地用户信息', async () => {
    // 先模拟已登录状态
    userService.currentUser = { id: 1, username: 'admin', nickname: '旧昵称' };
    userService.token = 'test-token';

    const mockResponse = {
      code: 200,
      message: '修改成功',
      data: { id: 1, username: 'admin', nickname: '新昵称' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.updateProfile({ nickname: '新昵称' });

    expect(result.success).toBe(true);
    expect(result.user.nickname).toBe('新昵称');
    expect(userService.getCurrentUser().nickname).toBe('新昵称');
  });
});

describe('userService.logout', () => {
  it('退出登录应清除本地状态', async () => {
    userService.currentUser = { id: 1, username: 'admin' };
    userService.token = 'test-token';

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ code: 200 }),
    });

    await userService.logout();

    expect(userService.getCurrentUser()).toBeNull();
    expect(userService.isAuthenticated()).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });

  it('即使服务器请求失败也应清除本地状态', async () => {
    userService.currentUser = { id: 1, username: 'admin' };
    userService.token = 'test-token';

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await userService.logout();

    expect(userService.getCurrentUser()).toBeNull();
    expect(userService.isAuthenticated()).toBe(false);
  });
});

describe('userService.getOrders', () => {
  it('获取订单列表应调用正确接口', async () => {
    userService.currentUser = { id: 1 };
    userService.token = 'test-token';

    const mockResponse = {
      code: 200,
      data: { list: [{ id: 1, orderNo: '001' }], total: 1 },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.getOrders();

    expect(result.success).toBe(true);
    expect(result.list).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/user/orders',
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('按状态筛选订单应传递 status 参数', async () => {
    userService.currentUser = { id: 1 };
    userService.token = 'test-token';

    const mockResponse = {
      code: 200,
      data: { list: [], total: 0 },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    await userService.getOrders(0);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/user/orders?status=0',
      expect.any(Object)
    );
  });
});

describe('userService.getProfile', () => {
  it('获取个人信息成功应更新本地状态', async () => {
    userService.currentUser = { id: 1 };
    userService.token = 'test-token';

    const mockResponse = {
      code: 200,
      data: { id: 1, username: 'admin', nickname: '京东用户', phone: '138****8888' },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await userService.getProfile();

    expect(result.success).toBe(true);
    expect(result.user.nickname).toBe('京东用户');
    expect(userService.getCurrentUser().phone).toBe('138****8888');
  });
});
