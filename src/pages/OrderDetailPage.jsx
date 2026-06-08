import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  EnvironmentOutlined,
  LeftOutlined,
} from '@ant-design/icons';

import { ORDER_STATUS, ORDER_STATUS_LABEL } from '../constants/orderStatus';
import { ServiceContext } from '../contexts/ServiceContext';
import '../styles/transaction.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const data = await services.order.getOrderById(orderId);
        if (active) setOrder(data);
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [orderId, services]);

  if (!order) {
    return (
      <main className="transaction-page">
        <section className="phone-app transaction-empty-page">
          <h1>{loadError || '订单加载中...'}</h1>
          <button type="button" className="primary-action compact" onClick={() => navigate('/orderList')}>返回订单列表</button>
        </section>
      </main>
    );
  }

  const isUnpaid = order.status === ORDER_STATUS.unpaid;

  return (
    <main className={`transaction-page${isUnpaid ? ' has-action-bar' : ''}`}>
      <section className="phone-app">
        <header className="transaction-navbar detail-nav">
          <button type="button" onClick={() => navigate(-1)} aria-label="返回">
            <LeftOutlined />
          </button>
          <h1>订单详情</h1>
          <span />
        </header>

        <section className={`order-status-hero status-${order.status}`}>
          {isUnpaid ? <ClockCircleFilled /> : <CheckCircleFilled />}
          <div>
            <strong>{ORDER_STATUS_LABEL[order.status] || '订单处理中'}</strong>
            <span>{isUnpaid ? '请尽快完成支付，订单才会开始处理' : '感谢购买，我们会及时处理你的订单'}</span>
          </div>
        </section>

        <section className="transaction-section order-address-card">
          <EnvironmentOutlined />
          <div>
            <strong>{order.receiver || '未填写收货人'} <span>{order.receiverPhone}</span></strong>
            <p>{order.address || '暂无收货地址'}</p>
          </div>
        </section>

        <section className="transaction-section">
          <div className="section-title">
            <h2>商品信息</h2>
            <span>{order.items.length} 种</span>
          </div>
          <div className="order-product-list">
            {order.items.map(item => (
              <div className="order-product-row" key={`${item.goodId}-${item.sku}`}>
                <button
                  type="button"
                  className="order-product-image"
                  onClick={() => item.goodId && navigate(`/detail/${item.goodId}`)}
                >
                  {item.img ? <img src={item.img} alt={item.name} /> : <strong>{item.name.slice(0, 2)}</strong>}
                </button>
                <div className="order-product-info">
                  <strong>{item.name}</strong>
                  <span>{item.sku} · x{item.quantity}</span>
                </div>
                <b>¥{Number(item.subtotal).toFixed(2)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="transaction-section detail-info-list">
          <div><span>订单编号</span><strong>{order.orderNo}</strong></div>
          <div><span>创建时间</span><strong>{order.createTime}</strong></div>
          {order.payMethod && <div><span>支付方式</span><strong>{order.payMethod}</strong></div>}
          {order.payTime && <div><span>支付时间</span><strong>{order.payTime}</strong></div>}
        </section>

        <section className="transaction-section price-summary">
          <div><span>商品金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
          <div><span>运费</span><strong className="free-shipping">免运费</strong></div>
          <div className="price-summary-total"><span>订单金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
        </section>
      </section>

      {isUnpaid && (
        <div className="transaction-action-bar">
          <div><span>待支付</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
          <button type="button" className="primary-action" onClick={() => navigate(`/pay/${order.id}`)}>
            立即支付
          </button>
        </div>
      )}
    </main>
  );
};

export default OrderDetailPage;
