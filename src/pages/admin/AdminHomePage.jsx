import { useCallback, useEffect, useState } from 'react';
import './AdminHomePage.css';

function AdminHomePage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(null);

  const fetchDashboardData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  const fetchOrderDetail = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${id}`);
      const result = await response.json();
      if (result.code === 200) {
        setShowDetail(result.data);
      }
    } catch (err) {
      console.error('获取订单详情失败', err);
    }
  };

  const getStatusText = (status) => ['待付款', '待发货', '已发货', '已完成'][status];
  const getStatusClass = (status) => `status-${status}`;

  const statsCards = dashboardData ? [
    { title: '用户总数', value: dashboardData.totalUsers, icon: '/assets/admin/icons/total-users.svg', color: '#1890ff' },
    { title: '今日新增', value: dashboardData.todayUsers, icon: '/assets/admin/icons/today-users.svg', color: '#52c41a' },
    { title: '订单总数', value: dashboardData.totalOrders, icon: '/assets/admin/icons/total-orders.svg', color: '#fa8c16' },
    { title: '今日订单', value: dashboardData.todayOrders, icon: '/assets/admin/icons/today-orders.svg', color: '#eb2f96' },
    { title: '商品总数', value: dashboardData.totalProducts, icon: '/assets/admin/icons/total-products.svg', color: '#13c2c2' },
    { title: '在售商品', value: dashboardData.onSaleProducts, icon: '/assets/admin/icons/onsale-products.svg', color: '#722ed1' },
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
              <img src={card.icon} alt={card.title} className="stat-icon-img" />
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
                  <td>¥{order.totalAmount}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {['待付款', '待发货', '已发货', '已完成'][order.status]}
                    </span>
                  </td>
                  <td>{order.payMethod}</td>
                  <td>{order.createTime?.split('T')[0] || order.createTime}</td>
                  <td>
                    <button className="btn btn-primary btn-small" onClick={() => fetchOrderDetail(order.id)}>查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetail && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>订单详情</h3>
              <button className="close-btn" onClick={() => setShowDetail(null)}>×</button>
            </div>
            <div className="order-detail">
              <div className="detail-section">
                <h4>基本信息</h4>
                <div className="detail-row">
                  <span className="label">订单号：</span>
                  <span>{showDetail.orderNo}</span>
                </div>
                <div className="detail-row">
                  <span className="label">订单状态：</span>
                  <span className={`status-badge ${getStatusClass(showDetail.status)}`}>
                    {getStatusText(showDetail.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">创建时间：</span>
                  <span>{showDetail.createTime}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>用户信息</h4>
                <div className="detail-row">
                  <span className="label">姓名：</span>
                  <span>{showDetail.userName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">电话：</span>
                  <span>{showDetail.userPhone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>收货信息</h4>
                <div className="detail-row">
                  <span className="label">收货人：</span>
                  <span>{showDetail.receiver}</span>
                </div>
                <div className="detail-row">
                  <span className="label">电话：</span>
                  <span>{showDetail.receiverPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">地址：</span>
                  <span>{showDetail.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>商品信息</h4>
                {showDetail.items?.map((item, index) => (
                  <div className="order-item" key={index}>
                    <img src={item.img} alt={item.name} className="order-item-img" />
                    <div className="order-item-info">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-sku">{item.sku}</div>
                      <div className="order-item-price">
                        ¥{item.unitPrice} × {item.quantity} = ¥{item.subtotal}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="detail-row total-row">
                  <span className="label">订单金额：</span>
                  <span className="price">¥{showDetail.totalAmount}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>支付信息</h4>
                <div className="detail-row">
                  <span className="label">支付方式：</span>
                  <span>{showDetail.payMethod}</span>
                </div>
                {showDetail.payTime && (
                  <div className="detail-row">
                    <span className="label">支付时间：</span>
                    <span>{showDetail.payTime}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowDetail(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHomePage;
