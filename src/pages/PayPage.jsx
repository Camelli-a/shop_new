import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlipayCircleFilled,
  CheckCircleFilled,
  LeftOutlined,
  SafetyCertificateOutlined,
  WechatFilled,
} from '@ant-design/icons';
import { App } from 'antd';

import { ORDER_STATUS } from '../constants/orderStatus';
import { ServiceContext } from '../contexts/ServiceContext';
import '../styles/transaction.css';

const PAYMENT_METHODS = [
  { key: '微信支付', label: '微信支付', desc: '推荐使用', icon: <WechatFilled /> },
  { key: '支付宝', label: '支付宝', desc: '安全快捷', icon: <AlipayCircleFilled /> },
];

const PayPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0].key);
  const [paying, setPaying] = useState(false);
  const order = services.order.getOrderById(orderId);

  if (!order) {
    return (
      <main className="transaction-page">
        <section className="phone-app transaction-empty-page">
          <h1>订单不存在</h1>
          <button type="button" className="primary-action compact" onClick={() => navigate('/orderList')}>返回订单列表</button>
        </section>
      </main>
    );
  }

  const handlePay = () => {
    if (order.status !== ORDER_STATUS.unpaid) {
      message.info('该订单已经支付');
      navigate(`/orderDetail/${order.id}`, { replace: true });
      return;
    }

    setPaying(true);
    const success = services.order.payOrder(order.id, payMethod);
    if (!success) {
      message.error('支付失败，请稍后重试');
      setPaying(false);
      return;
    }
    message.success('支付成功');
    navigate(`/orderDetail/${order.id}`, { replace: true });
  };

  return (
    <main className="transaction-page has-action-bar">
      <section className="phone-app">
        <header className="transaction-navbar">
          <button type="button" onClick={() => navigate(-1)} aria-label="返回">
            <LeftOutlined />
          </button>
          <h1>订单支付</h1>
          <span />
        </header>

        <section className="payment-hero">
          <span>待支付金额</span>
          <strong><small>¥</small>{Number(order.totalAmount).toFixed(2)}</strong>
          <p>订单号 {order.orderNo}</p>
        </section>

        <section className="transaction-section">
          <div className="section-title">
            <SafetyCertificateOutlined />
            <h2>支付方式</h2>
          </div>
          <div className="payment-methods">
            {PAYMENT_METHODS.map(method => (
              <button
                type="button"
                key={method.key}
                className={`payment-method${payMethod === method.key ? ' is-selected' : ''}`}
                onClick={() => setPayMethod(method.key)}
              >
                <span className={`payment-icon ${method.key === '微信支付' ? 'wechat' : 'alipay'}`}>
                  {method.icon}
                </span>
                <span className="payment-copy">
                  <strong>{method.label}</strong>
                  <small>{method.desc}</small>
                </span>
                <CheckCircleFilled className="payment-check" />
              </button>
            ))}
          </div>
        </section>

        <section className="transaction-section payment-order-summary">
          <div className="section-title">
            <h2>订单摘要</h2>
            <span>{order.items.length} 种商品</span>
          </div>
          {order.items.slice(0, 3).map(item => (
            <div key={`${item.goodId}-${item.sku}`} className="payment-summary-row">
              <span>{item.name} × {item.quantity}</span>
              <strong>¥{item.subtotal.toFixed(2)}</strong>
            </div>
          ))}
        </section>
      </section>

      <div className="transaction-action-bar">
        <div><span>支付金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
        <button type="button" className="primary-action" disabled={paying} onClick={handlePay}>
          {paying ? '支付中...' : '确认支付'}
        </button>
      </div>
    </main>
  );
};

export default PayPage;
