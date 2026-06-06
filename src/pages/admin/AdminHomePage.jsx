import { useEffect, useState } from 'react';
import './AdminHomePage.css';

function AdminHomePage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard');
      const result = await response.json();
      if (result.code === 200) {
        setDashboardData(result.data);
      }
    } catch (err) {
      console.error('获取数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = dashboardData ? [
    { title: '用户总数', value: dashboardData.totalUsers, icon: '👥', color: '#1890ff' },
    { title: '今日新增', value: dashboardData.todayUsers, icon: '📈', color: '#52c41a' },
    { title: '订单总数', value: dashboardData.totalOrders, icon: '📋', color: '#fa8c16' },
    { title: '今日订单', value: dashboardData.todayOrders, icon: '📦', color: '#eb2f96' },
    { title: '商品总数', value: dashboardData.totalProducts, icon: '🛍️', color: '#13c2c2' },
    { title: '在售商品', value: dashboardData.onSaleProducts, icon: '✅', color: '#722ed1' },
  ] : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{card.value}</h3>
              <p className="stat-title">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sales-card">
        <div className="sales-header">
          <h3>总收入</h3>
        </div>
        <div className="sales-amount">
          ¥{dashboardData?.totalSales?.toLocaleString() || 0}
        </div>
        <div className="sales-today">
          今日收入：¥{dashboardData?.todaySales?.toLocaleString() || 0}
        </div>
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h3>最近订单</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>用户信息</th>
                <th>订单金额</th>
                <th>商品数量</th>
                <th>订单状态</th>
                <th>支付方式</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentOrders?.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNo}</td>
                  <td>
                    <div>{order.userName}</div>
                    <div className="small-text">{order.userPhone}</div>
                  </td>
                  <td>¥{order.price}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {['待付款', '待发货', '已发货', '已完成'][order.status]}
                    </span>
                  </td>
                  <td>{order.payMethod}</td>
                  <td>{order.createTime?.split('T')[0] || order.createTime}</td>
                  <td>
                    <button className="btn btn-primary btn-small">查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
