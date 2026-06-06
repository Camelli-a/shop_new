import { useEffect, useState } from 'react';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const result = await response.json();
      if (result.code === 200) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error('获取用户失败', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => status === 1 ? '启用' : '禁用';
  const getStatusClass = (status) => status === 1 ? 'status-active' : 'status-inactive';

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>用户管理</h2>
        <button className="btn btn-success">添加用户</button>
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
                  <td>{user.role}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{user.createTime?.split('T')[0] || user.createTime}</td>
                  <td>
                    <button className="btn btn-primary btn-small">编辑</button>
                    <button className="btn btn-danger btn-small">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
