import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginPage.css';

function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        localStorage.setItem('adminToken', result.data.token);
        localStorage.setItem('adminUser', JSON.stringify(result.data.user));
        navigate('/admin/home');
      } else {
        setError(result.message || '登录失败');
      }
    } catch {
      setError('网络错误，请确保后端服务已启动');
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
