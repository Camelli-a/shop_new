import { STORAGE_KEYS } from '../constants/storageKeys';

const API_BASE = '/api/user';

class UserService {
  currentUser = null;
  token = null;

  constructor() {
    this._loadLocal();
  }

  // 登录 —— 调用服务器接口
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.code === 200) {
        this.token = data.data.token;
        this.currentUser = data.data.user;
        this._saveLocal();
        return { success: true, user: { ...this.currentUser } };
      }
      return { success: false, error: data.message || '登录失败' };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  // 注册 —— 调用服务器接口
  async register(username, password, { nickname, phone } = {}) {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nickname, phone }),
      });
      const data = await res.json();

      if (data.code === 200) {
        this.token = data.data.token;
        this.currentUser = data.data.user;
        this._saveLocal();
        return { success: true, user: { ...this.currentUser } };
      }
      return { success: false, error: data.message || '注册失败' };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  // 获取个人信息 —— 调用服务器接口
  async getProfile() {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: this._authHeaders(),
      });
      const data = await res.json();

      if (data.code === 200) {
        this.currentUser = data.data;
        this._saveLocal();
        return { success: true, user: { ...this.currentUser } };
      }
      return { success: false, error: data.message };
    } catch {
      return { success: false, error: '网络错误' };
    }
  }

  // 修改个人信息 —— 调用服务器接口
  async updateProfile({ nickname, phone, gender }) {
    try {
      const body = {};
      if (nickname !== undefined) body.nickname = nickname;
      if (phone !== undefined) body.phone = phone;
      if (gender !== undefined) body.gender = gender;

      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this._authHeaders(),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.code === 200) {
        this.currentUser = data.data;
        this._saveLocal();
        return { success: true, user: { ...this.currentUser } };
      }
      return { success: false, error: data.message };
    } catch {
      return { success: false, error: '网络错误' };
    }
  }

  // 退出登录 —— 调用服务器接口
  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: this._authHeaders(),
      });
    } catch {
      // 即使请求失败，前端也要清除状态
    }
    this.currentUser = null;
    this.token = null;
    this._clearLocal();
  }

  // 获取我的订单列表 —— 调用服务器接口
  async getOrders(status) {
    try {
      const params = new URLSearchParams();
      if (status !== undefined && status !== null && status !== '') {
        params.set('status', status);
      }
      const url = `${API_BASE}/orders${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, {
        headers: this._authHeaders(),
      });
      const data = await res.json();

      if (data.code === 200) {
        return { success: true, ...data.data };
      }
      return { success: false, list: [], error: data.message };
    } catch {
      return { success: false, list: [], error: '网络错误' };
    }
  }

  // 获取订单详情 —— 调用服务器接口
  async getOrderDetail(orderId) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: this._authHeaders(),
      });
      const data = await res.json();

      if (data.code === 200) {
        return { success: true, order: data.data };
      }
      return { success: false, error: data.message };
    } catch {
      return { success: false, error: '网络错误' };
    }
  }

  // 获取当前用户（从本地缓存读取，用于初始化状态）
  getCurrentUser() {
    return this.currentUser;
  }

  // 检查是否已登录
  isAuthenticated() {
    return this.currentUser !== null && this.token !== null;
  }

  // ===== 私有方法 =====

  _authHeaders() {
    const headers = {};
    if (this.currentUser) {
      headers['x-user-id'] = String(this.currentUser.id);
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  _saveLocal() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(this.currentUser));
      }
      if (this.token) {
        localStorage.setItem('userToken', this.token);
      }
    } catch {
      // 静默处理
    }
  }

  _loadLocal() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.user);
      const token = localStorage.getItem('userToken');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
      if (token) {
        this.token = token;
      }
    } catch {
      this.currentUser = null;
      this.token = null;
    }
  }

  _clearLocal() {
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem('userToken');
    } catch {
      // 静默处理
    }
  }
}

const userService = new UserService();
export default userService;
