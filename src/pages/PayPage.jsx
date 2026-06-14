// React is required by the current Vitest JSX transform.
// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlipayCircleFilled,
  CheckCircleFilled,
  ClockCircleOutlined,
  LeftOutlined,
  SafetyCertificateOutlined,
  WechatFilled,
} from '@ant-design/icons';
import { App, QRCode } from 'antd';

import {
  formatPaymentCountdown,
  getPaymentRemainingSeconds,
  ORDER_STATUS,
} from '../constants/orderStatus';
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
  const [order, setOrder] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const data = await services.order.getOrderById(orderId);
        if (active) {
          setOrder(data);
          setRemainingSeconds(getPaymentRemainingSeconds(data));
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [orderId, services]);

  useEffect(() => {
    if (!order || order.status !== ORDER_STATUS.unpaid || remainingSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds(getPaymentRemainingSeconds(order));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [order, remainingSeconds]);

  useEffect(() => {
    if (!order || order.status !== ORDER_STATUS.unpaid || remainingSeconds !== 0) return;
    let active = true;
    void services.order.getOrderById(order.id).then(data => {
      if (active) setOrder(data);
    }).catch(error => {
      if (active) setLoadError(error.message);
    });
    return () => {
      active = false;
    };
  }, [order, remainingSeconds, services]);

  const qrValue = useMemo(() => order ? JSON.stringify({
    type: 'mall-payment',
    orderNo: order.orderNo,
    amount: order.totalAmount,
    payMethod,
  }) : '', [order, payMethod]);

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
  const isExpired = order.status === ORDER_STATUS.cancelled || remainingSeconds <= 0;

  const handlePay = async () => {
    if (!isUnpaid || isExpired) {
      message.info(isExpired ? '订单已超时取消' : '该订单已经支付');
      navigate(`/orderDetail/${order.id}`, { replace: true });
      return;
    }

    setPaying(true);
    try {
      await services.order.payOrder(order.id, payMethod);
      message.success('支付成功');
      navigate(`/orderDetail/${order.id}`, { replace: true });
    } catch (error) {
      message.error(error.message);
      setPaying(false);
    }
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
          <div className={`payment-countdown${isExpired ? ' is-expired' : ''}`}>
            <ClockCircleOutlined />
            <span>{isExpired ? '订单已超时取消' : `支付剩余 ${formatPaymentCountdown(remainingSeconds)}`}</span>
          </div>
        </section>

        <section className="transaction-section payment-qr-section">
          <div className="section-title">
            <h2>扫码支付</h2>
            <span>{payMethod}</span>
          </div>
          <QRCode
            value={qrValue}
            status={isExpired ? 'expired' : 'active'}
            size={168}
            color="#1f8f78"
            bordered={false}
          />
          <p>请使用{payMethod === '微信支付' ? '微信' : '支付宝'}扫码完成模拟支付</p>
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
                disabled={isExpired}
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
              <span>{item.name} x {item.quantity}</span>
              <strong>¥{Number(item.subtotal).toFixed(2)}</strong>
            </div>
          ))}
        </section>
      </section>

      <div className="transaction-action-bar">
        <div><span>支付金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
        <button type="button" className="primary-action" disabled={paying || isExpired} onClick={handlePay}>
          {isExpired ? '订单已取消' : paying ? '支付中...' : '确认支付'}
        </button>
      </div>
    </main>
  );
};

export default PayPage;
