import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_USER } from '../mocks';

// 已注册用户列表（模拟持久化）
const REGISTERED_USERS_KEY = 'registeredUsers';

class UserService {
  currentUser = null;
  registeredUsers = [];

  constructor() {
    this._loadRegisteredUsers();
    this._loadData();
  }

  // 登录验证：返回 user 对象（不含密码）或 null
  login(username, password) {
    // 先检查预置用户
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      this.currentUser = {
        id: MOCK_USER.id,
        username: MOCK_USER.username,
        nickname: MOCK_USER.nickname,
        phone: MOCK_USER.phone,
        gender: MOCK_USER.gender,
        avatar: MOCK_USER.avatar,
      };
      this._saveData();
      return { ...this.currentUser };
    }

    // 再检查注册用户
    const regUser = this.registeredUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (regUser) {
      this.currentUser = {
        id: regUser.id,
        username: regUser.username,
        nickname: regUser.nickname,
        phone: regUser.phone,
        gender: regUser.gender,
        avatar: regUser.avatar,
      };
      this._saveData();
      return { ...this.currentUser };
    }

    return null;
  }

  // 注册新用户
  register(username, password, { nickname, phone } = {}) {
    // 参数校验
    if (!username || username.length < 3 || username.length > 20) {
      return { success: false, error: '用户名长度应在3-20个字符之间' };
    }
    if (!password || password.length < 6 || password.length > 32) {
      return { success: false, error: '密码长度应在6-32个字符之间' };
    }

    // 检查用户名是否已存在
    if (username === MOCK_USER.username) {
      return { success: false, error: '用户名已存在' };
    }
    if (this.registeredUsers.find((u) => u.username === username)) {
      return { success: false, error: '用户名已存在' };
    }

    // 检查手机号是否已注册
    if (phone) {
      if (phone === MOCK_USER.phone) {
        return { success: false, error: '该手机号已注册' };
      }
      if (this.registeredUsers.find((u) => u.phone === phone)) {
        return { success: false, error: '该手机号已注册' };
      }
    }

    // 创建新用户
    const maxId = this.registeredUsers.reduce(
      (max, u) => Math.max(max, Number(u.id) || 0),
      100
    );
    const newUser = {
      id: maxId + 1,
      username,
      password,
      nickname: nickname || '新用户' + String(maxId + 1),
      phone: phone || '',
      gender: '男',
      avatar: '/assets/home/icons/recommend.svg',
      createTime: new Date().toISOString(),
    };

    this.registeredUsers.push(newUser);
    this._saveRegisteredUsers();

    // 注册成功后自动登录
    this.currentUser = {
      id: newUser.id,
      username: newUser.username,
      nickname: newUser.nickname,
      phone: newUser.phone,
      gender: newUser.gender,
      avatar: newUser.avatar,
    };
    this._saveData();

    return { success: true, user: { ...this.currentUser } };
  }

  // 退出登录：清除当前用户信息
  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
    } catch {
      // localStorage 清除异常时仍然重置内存状态
    }
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }

  // 更新用户资料（仅昵称可编辑）
  updateProfile({ nickname }) {
    if (!nickname || nickname.length < 1 || nickname.length > 20) {
      throw new Error('昵称长度必须在1到20个字符之间');
    }

    this.currentUser = { ...this.currentUser, nickname };
    this._saveData();
    return { ...this.currentUser };
  }

  // 检查是否已登录
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // 从 localStorage 加载用户数据
  _loadData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.user);
      if (!data) {
        this.currentUser = null;
        return;
      }
      const parsed = JSON.parse(data);
      if (parsed && parsed.username) {
        this.currentUser = parsed;
      } else {
        this.currentUser = null;
      }
    } catch {
      // JSON 解析失败视为未登录
      this.currentUser = null;
    }
  }

  // 持久化用户数据到 localStorage（不存储密码）
  _saveData() {
    try {
      if (this.currentUser) {
        // currentUser never contains password, safe to store directly
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(this.currentUser));
      }
    } catch {
      // localStorage 写入异常时静默处理
    }
  }

  // 加载已注册用户列表
  _loadRegisteredUsers() {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.registeredUsers = Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      this.registeredUsers = [];
    }
  }

  // 持久化已注册用户列表
  _saveRegisteredUsers() {
    try {
      localStorage.setItem(
        REGISTERED_USERS_KEY,
        JSON.stringify(this.registeredUsers)
      );
    } catch {
      // 静默处理
    }
  }
}

const userService = new UserService();
export default userService;
