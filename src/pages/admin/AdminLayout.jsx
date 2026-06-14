import { useState, useMemo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthAdmin } from '../../contexts/useAuthAdmin';
import './AdminLayout.css';

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, logout, hasMenuPermission } = useAuthAdmin();

  // 页面加载时刷新权限
  const menuItems = useMemo(() => ([
    { path: '/admin/home', name: '首页', icon: '/assets/admin/icons/home.svg', key: 'home' },
    { path: '/admin/products', name: '商品管理', icon: '/assets/admin/icons/products.svg', key: 'products' },
    { path: '/admin/categories', name: '分类管理', icon: '/assets/admin/icons/categories.svg', key: 'categories' },
    { path: '/admin/orders', name: '订单管理', icon: '/assets/admin/icons/orders.svg', key: 'orders' },
    { path: '/admin/users', name: '用户管理', icon: '/assets/admin/icons/users.svg', key: 'users' },
    { path: '/admin/roles', name: '角色管理', icon: '/assets/admin/icons/roles.svg', key: 'roles' },
  ]), []);

  // 只显示有权限的菜单
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => hasMenuPermission(item.key));
  }, [menuItems, hasMenuPermission]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">{collapsed ? '🛒' : '🛒 商城管理'}</h2>
        </div>
        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <img src={item.icon} alt={item.name} className="nav-icon" />
              {!collapsed && <span className="nav-text">{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {visibleMenuItems.find((item) => isActive(item.path))?.name || '管理后台'}
            </h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img
                src={adminUser?.avatar || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="user-avatar"
              />
              <div className="user-details">
                <span className="user-name">{adminUser?.name || '管理员'}</span>
                <span className="user-role">{adminUser?.roleName || ''}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
