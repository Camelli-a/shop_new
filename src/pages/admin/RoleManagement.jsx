import { useCallback, useEffect, useState } from 'react';
import './RoleManagement.css';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/roles');
      const result = await response.json();
      if (result.code === 200) {
        setRoles(result.data);
      }
    } catch (err) {
      console.error('获取角色失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchRoles);
  }, [fetchRoles]);

  const permissionNames = {
    dashboard: '首页',
    goods: '商品管理',
    categories: '分类管理',
    orders: '订单管理',
    users: '用户管理',
    roles: '角色管理'
  };

  return (
    <div className="role-management">
      <div className="page-header">
        <h2>角色管理</h2>
        <button className="btn btn-success">添加角色</button>
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

export default RoleManagement;
