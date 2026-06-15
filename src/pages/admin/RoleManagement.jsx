import { useCallback, useEffect, useState } from 'react';
import './RoleManagement.css';

const ADMIN_STORAGE_KEYS = {
  roles: 'adminRoles',
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

function saveAdminRoles(roles) {
  localStorage.setItem(ADMIN_STORAGE_KEYS.roles, JSON.stringify(roles));
  window.dispatchEvent(new Event('adminRolesUpdated'));
}

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const permissionNames = {
    dashboard: '首页',
    goods: '商品管理',
    categories: '分类管理',
    orders: '订单管理',
    users: '用户管理',
    roles: '角色管理'
  };

  const allPermissions = ['dashboard', 'goods', 'categories', 'orders', 'users', 'roles'];

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      setRoles(loadAdminRoles());
    } catch (err) {
      console.error('获取角色失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchRoles);
  }, [fetchRoles]);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setIsAdding(false);
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      permissions: [...(role.permissions || [])]
    });
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (role.id === 1) {
      alert('超级管理员角色不能删除');
      return;
    }
    
    if (!confirm(`确定要删除角色 "${role.name}" 吗？`)) {
      return;
    }

    try {
      const nextRoles = loadAdminRoles().filter((r) => r?.id !== role.id);
      saveAdminRoles(nextRoles);
      setRoles(nextRoles);
      alert('删除成功');
    } catch (err) {
      console.error('删除角色失败', err);
      alert('删除失败');
    }
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('角色名称不能为空');
      return;
    }

    try {
      if (isAdding) {
        const currentRoles = loadAdminRoles();
        const maxId = currentRoles.reduce((max, r) => Math.max(max, Number(r?.id) || 0), 0);
        const newRole = {
          id: maxId + 1,
          name: formData.name,
          description: formData.description,
          permissions: Array.isArray(formData.permissions) ? formData.permissions : [],
          createTime: new Date().toISOString(),
        };
        const nextRoles = [...currentRoles, newRole];
        saveAdminRoles(nextRoles);
        setRoles(nextRoles);
        alert('创建成功');
      } else {
        const currentRoles = loadAdminRoles();
        const nextRoles = currentRoles.map((r) => {
          if (r?.id !== editingRole.id) return r;
          return {
            ...r,
            name: formData.name,
            description: formData.description,
            permissions: Array.isArray(formData.permissions) ? formData.permissions : [],
          };
        });
        saveAdminRoles(nextRoles);
        setRoles(nextRoles);
        alert('更新成功');
      }
      setShowModal(false);
    } catch (err) {
      console.error('操作角色失败', err);
      alert('操作失败');
    }
  };

  return (
    <div className="role-management">
      <div className="page-header">
        <h2>角色管理</h2>
        <button className="btn btn-success" onClick={handleAdd}>
          添加角色
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>角色名称</th>
                <th>描述</th>
                <th>权限</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>{role.description}</td>
                  <td>
                    <div className="permission-tags">
                      {role.permissions?.map((perm) => (
                        <span key={perm} className="permission-tag">
                          {permissionNames[perm] || perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{role.createTime?.split('T')[0] || role.createTime}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleEdit(role)}
                    >
                      编辑
                    </button>
                    <button 
                      className={`btn btn-small ${role.id === 1 ? 'btn-disabled' : 'btn-danger'}`}
                      onClick={() => handleDelete(role)}
                      disabled={role.id === 1}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isAdding ? '添加角色' : '编辑角色'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>角色名称</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="form-input"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>权限</label>
                <div className="permission-checkboxes">
                  {allPermissions.map((perm) => (
                    <div key={perm} className="permission-item">
                      <input 
                        type="checkbox"
                        id={`perm-${perm}`}
                        checked={formData.permissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                      />
                      <label htmlFor={`perm-${perm}`} className="permission-label">
                        {permissionNames[perm] || perm}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {isAdding ? '创建' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;
