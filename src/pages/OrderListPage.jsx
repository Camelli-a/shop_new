import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FileTextOutlined, RightOutlined } from '@ant-design/icons';
import { Empty } from 'antd';

import BottomNav from '../components/BottomNav';
import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../constants/orderStatus';
import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/useAuth';
import '../styles/transaction.css';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: String(ORDER_STATUS.unpaid), label: '待付款' },
  { key: String(ORDER_STATUS.paid), label: '已付款' },
];

const OrderListPage = () => {
  const services = useContext(ServiceContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') ?? 'all';
  const status = activeStatus === 'all' ? undefined : Number(activeStatus);
  const [orders, setOrders] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const list = await services.order.getOrderList(user?.id || 1, status);
        if (active) {
          setOrders(list);
          setLoadError('');
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [services, status, user?.id]);

  return (
    <main className="transaction-page has-bottom-nav">
      <section className="phone-app">
        <header className="transaction-header order-list-header">
          <div>
            <span className="transaction-eyebrow">MY ORDERS</span>
            <h1>我的订单</h1>
          </div>
          <span className="transaction-count">{orders.length} 笔</span>
        </header>

        <div className="order-filter-tabs" role="tablist" aria-label="订单筛选">
          {FILTERS.map(filter => (
            <button
              type="button"
              role="tab"
              aria-selected={activeStatus === filter.key}
              className={activeStatus === filter.key ? 'is-active' : ''}
              key={filter.key}
              onClick={() => {
                if (filter.key === 'all') setSearchParams({});
                else setSearchParams({ status: filter.key });
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loadError ? (
          <div className="transaction-empty"><strong>{loadError}</strong></div>
        ) : orders.length === 0 ? (
          <div className="transaction-empty">
            <Empty
              image={<FileTextOutlined className="transaction-empty-icon" />}
              description="这里还没有订单"
            />
            <button type="button" className="primary-action compact" onClick={() => navigate('/home')}>
              去选购
            </button>
          </div>
        ) : (
          <div className="order-card-list">
            {orders.map(order => (
              <article className="order-card" key={order.id}>
                <button
                  type="button"
                  className="order-card-head"
                  onClick={() => navigate(`/orderDetail/${order.id}`)}
                >
                  <span>订单号 {order.orderNo}</span>
                  <strong className={`order-status status-${order.status}`}>
                    {ORDER_STATUS_LABEL[order.status] || '未知状态'}
                  </strong>
                  <RightOutlined />
                </button>
                <div className="order-card-products">
                  {order.items.slice(0, 3).map(item => (
                    <div className="order-mini-product" key={`${item.goodId}-${item.sku}`}>
                      <div>
                        {item.img ? <img src={item.img} alt={item.name} /> : <strong>{item.name.slice(0, 2)}</strong>}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="order-card-summary">
                  <span>共 {order.items.reduce((total, item) => total + item.quantity, 0)} 件</span>
                  <span>实付 <strong>¥{Number(order.totalAmount).toFixed(2)}</strong></span>
                </div>
                <div className="order-card-actions">
                  <button type="button" onClick={() => navigate(`/orderDetail/${order.id}`)}>查看详情</button>
                  {order.status === ORDER_STATUS.unpaid && (
                    <button type="button" className="primary-outline" onClick={() => navigate(`/pay/${order.id}`)}>
                      立即支付
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
};

export default OrderListPage;
