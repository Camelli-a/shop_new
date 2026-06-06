import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_USER } from '../mocks';

class UserService {
  currentUser = null;

  constructor() {
    this._loadData();
  }

  // 登录验证：返回 user 对象（不含密码）或 null
  login(username, password) {
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      this.currentUser = {
        username: MOCK_USER.username,
        nickname: MOCK_USER.nickname,
        phone: MOCK_USER.phone,
        gender: MOCK_USER.gender,
        avatar: MOCK_USER.avatar,
      };
      this._saveData();
      return { ...this.currentUser };
    }
    return null;
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
}

const userService = new UserService();
export default userService;
