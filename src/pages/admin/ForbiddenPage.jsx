import { useNavigate } from 'react-router-dom';
import { useAuthAdmin } from '../../contexts/AuthAdminContext';
import './ForbiddenPage.css';

function ForbiddenPage() {
  const navigate = useNavigate();
  const { adminUser, logout } = useAuthAdmin();

  const handleBack = () => {
    navigate('/admin/home');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="forbidden-container">
      <div className="forbidden-content">
        <div className="forbidden-icon">🔒</div>
        <h1 className="forbidden-title">403 无权限访问</h1>
        <p className="forbidden-message">
          抱歉，您没有访问此页面的权限。
        </p>
        <div className="forbidden-user">
          <p>当前用户：{adminUser?.name || '未知'}</p>
          <p>角色：{adminUser?.roleName || '未知角色'}</p>
          <p className="forbidden-permissions">
            权限：{adminUser?.permissions?.join('、') || '无'}
          </p>
        </div>
        <div className="forbidden-actions">
          <button className="btn btn-secondary" onClick={handleBack}>
            返回首页
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            切换账号
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
