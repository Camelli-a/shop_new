import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthAdmin } from '../../contexts/useAuthAdmin';
import './AdminLoginPage.css';

const ADMIN_STORAGE_KEYS = {
  roles: 'adminRoles',
  accounts: 'adminAccounts',
};

function safeParseJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadAdminRoles() {
  const roles = safeParseJson(localStorage.getItem(ADMIN_STORAGE_KEYS.roles), []);
  return Array.isArray(roles) ? roles : [];
}

function loadAdminAccounts() {
  const accounts = safeParseJson(localStorage.getItem(ADMIN_STORAGE_KEYS.accounts), []);
  return Array.isArray(accounts) ? accounts : [];
}

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthAdmin();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const accounts = loadAdminAccounts();
      const roles = loadAdminRoles();

      const matched = accounts.find(
        (u) => u?.username === username && u?.password === password
      );

      if (!matched) {
        setError('用户名或密码错误');
        return;
      }

      const role = roles.find((r) => r?.id === matched.roleId);
      const token = `mock-admin-token-${Date.now()}`;

      const userData = {
        id: matched.id,
        username: matched.username,
        name: matched.name || matched.username,
        avatar: matched.avatar,
        roleId: matched.roleId,
        roleName: role?.name || '',
        permissions: Array.isArray(role?.permissions) ? role.permissions : [],
      };

      login(userData, token);
      navigate('/admin/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="login-title">商城管理系统</h1>
        <p className="login-subtitle">管理员登录</p>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              记住我
            </label>
            <a href="#" className="forgot-password">忘记密码</a>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="login-footer">
          <a href="/" className="back-link">返回前台首页</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
