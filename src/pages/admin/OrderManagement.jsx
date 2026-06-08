import { useCallback, useEffect, useState } from 'react';
import './OrderManagement.css';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...(statusFilter !== '' && { status: statusFilter })
      });
      const response = await fetch(`http://localhost:5000/api/admin/orders?${params}`);
      const result = await response.json();
      if (result.code === 200) {
        setOrders(result.data.list);
        setPagination(prev => ({ ...prev, total: result.data.total }));
      }
    } catch (err) {
      console.error('获取订单失败', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, statusFilter]);

  useEffect(() => {
    void Promise.resolve().then(fetchOrders);
  }, [fetchOrders]);

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.code === 200) {
        fetchOrders();
        if (showDetail?.id === orderId) {
          fetchOrderDetail(orderId);
        }
      }
    } catch (err) {
      console.error('更新订单状态失败', err);
    }
  };

  const getStatusText = (status) => ['待付款', '待发货', '已发货', '已完成'][status];
  const getStatusClass = (status) => `status-${status}`;
  const getNextStatusText = (status) => {
    const nextMap = { 0: '付款', 1: '发货', 2: '收货' };
    return nextMap[status];
  };

  return (
    <div className="order-management">
      <div className="page-header">
        <div className="filter-bar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">全部状态</option>
            <option value="0">待付款</option>
            <option value="1">待发货</option>
            <option value="2">已发货</option>
            <option value="3">已完成</option>
          </select>
          <button className="btn btn-primary" onClick={fetchOrders}>
            搜索
          </button>
        </div>
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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNo}</td>
                  <td>
                    <div>{order.userName}</div>
                    <div className="small-text">{order.userPhone}</div>
                  </td>
                  <td>¥{order.totalAmount}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>{order.payMethod}</td>
                  <td>{order.createTime?.split('T')[0] || order.createTime}</td>
                  <td>
                    <button className="btn btn-primary btn-small" onClick={() => fetchOrderDetail(order.id)}>
                      查看
                    </button>
                    {order.status < 3 && order.status > 0 && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleUpdateStatus(order.id, order.status + 1)}
                      >
                        {getNextStatusText(order.status)}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <span>共 {pagination.total} 条记录</span>
        <button
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          上一页
        </button>
        <span>第 {pagination.page} 页 / 共 {Math.ceil(pagination.total / pagination.pageSize)} 页</span>
        <button
          disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          下一页
        </button>
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
                {showDetail.items?.map((item) => (
                  <div className="detail-row" key={`${item.goodId}-${item.sku}`}>
                    <span className="label">{item.name}：</span>
                    <span>{item.sku} × {item.quantity}，¥{item.subtotal}</span>
                  </div>
                ))}
                <div className="detail-row">
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

              <div className="detail-section status-actions">
                {showDetail.status < 3 && showDetail.status > 0 && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleUpdateStatus(showDetail.id, showDetail.status + 1);
                    }}
                  >
                    {getNextStatusText(showDetail.status)}
                  </button>
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

export default OrderManagement;
