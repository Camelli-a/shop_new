import { useCallback, useEffect, useState } from 'react';
import './UserManagement.css';

const ROLE_NAME_TO_KEY = {
  超级管理员: 'admin',
  商品管理员: 'manager',
  订单管理员: 'user'
};

const DEFAULT_ROLE_OPTIONS = [
  { value: 'admin', label: '超级管理员' },
  { value: 'manager', label: '商品管理员' },
  { value: 'user', label: '订单管理员' }
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLE_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'user',
    status: 1
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.code === 200) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('获取用户失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/roles');
      const result = await response.json();
      if (result.code === 200 && Array.isArray(result.data)) {
        const roleOptions = result.data
          .map(role => ({
            value: ROLE_NAME_TO_KEY[role.name] || role.value || role.key || role.name,
            label: role.name || role.label || role.value
          }))
          .filter(role => role.value && role.label);

        setRoles(roleOptions.length > 0 ? roleOptions : DEFAULT_ROLE_OPTIONS);
      }
    } catch (err) {
      console.error('获取角色失败', err);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
    void Promise.resolve().then(fetchRoles);
  }, [fetchUsers, fetchRoles]);

  const getStatusText = (status) => status === 1 ? '启用' : '禁用';
  const getStatusClass = (status) => status === 1 ? 'status-active' : 'status-inactive';
  const getRoleText = (roleKey) => {
    const roleMap = {
      admin: '超级管理员',
      manager: '商品管理员',
      user: '订单管理员'
    };
    return roleMap[roleKey] || roleKey;
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      phone: '',
      avatar: '',
      role: 'user',
      status: 1
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsAdding(false);
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role || '',
      status: user.status ?? 1
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (user.role === 'admin') {
      alert('超级管理员不能删除');
      return;
    }
    
    if (!confirm(`确定要删除用户 "${user.name}" 吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.code === 200) {
        alert('删除成功');
        fetchUsers();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (err) {
      console.error('删除用户失败', err);
      alert('删除失败');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (isAdding) {
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      const result = await response.json();
      if (result.code === 200) {
        alert(isAdding ? '创建成功' : '更新成功');
        setShowModal(false);
        fetchUsers();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (err) {
      console.error('操作用户失败', err);
      alert('操作失败');
    }
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>用户管理</h2>
        <button className="btn btn-success" onClick={handleAdd}>
          添加用户
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
                <th>头像</th>
                <th>用户名</th>
                <th>姓名</th>
                <th>邮箱</th>
                <th>手机号</th>
                <th>角色</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <img src={user.avatar} alt={user.name} className="user-avatar-small" />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{getRoleText(user.role)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{user.createTime?.split('T')[0] || user.createTime}</td>
                  <td>
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => handleEdit(user)}
                    >
                      编辑
                    </button>
                    <button 
                      className={`btn btn-small ${user.role === 'admin' ? 'btn-disabled' : 'btn-danger'}`}
                      onClick={() => handleDelete(user)}
                      disabled={user.role === 'admin'}
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
              <h3>{isAdding ? '添加用户' : '编辑用户'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {isAdding && (
                <>
                  <div className="form-group">
                    <label>用户名</label>
                    <input 
                      type="text" 
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>密码</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}
              {!isAdding && (
                <div className="form-group">
                  <label>用户名（不可修改）</label>
                  <input 
                    type="text" 
                    value={editingUser?.username}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              )}
              <div className="form-group">
                <label>姓名</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>邮箱</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>手机号</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>头像URL</label>
                <input 
                  type="text" 
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>角色</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="form-input"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>状态</label>
                <div className="status-toggle">
                  <div 
                    className={`status-option ${formData.status === 1 ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 1 }))}
                  >
                    <input 
                      type="radio" 
                      name="status"
                      checked={formData.status === 1}
                      onChange={() => setFormData(prev => ({ ...prev, status: 1 }))}
                    />
                    <span>启用</span>
                  </div>
                  <div 
                    className={`status-option ${formData.status === 0 ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, status: 0 }))}
                  >
                    <input 
                      type="radio" 
                      name="status"
                      checked={formData.status === 0}
                      onChange={() => setFormData(prev => ({ ...prev, status: 0 }))}
                    />
                    <span>禁用</span>
                  </div>
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

export default UserManagement;
