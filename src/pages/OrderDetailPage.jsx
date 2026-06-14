// React is required by the current Vitest JSX transform.
// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  EnvironmentOutlined,
  LeftOutlined,
  TruckOutlined,
} from '@ant-design/icons';

import {
  formatPaymentCountdown,
  getPaymentRemainingSeconds,
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
} from '../constants/orderStatus';
import { ServiceContext } from '../contexts/ServiceContext';
import '../styles/transaction.css';

const STATUS_COPY = {
  [ORDER_STATUS.unpaid]: '请尽快完成支付，订单才会开始处理',
  [ORDER_STATUS.paid]: '订单已支付，商家正在为你备货',
  [ORDER_STATUS.shipped]: '商品正在运输途中，请留意物流更新',
  [ORDER_STATUS.received]: '订单已经签收，感谢你的购买',
  [ORDER_STATUS.cancelled]: '订单支付超时，库存已自动恢复',
};

const formatTime = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const expiryCheckedRef = useRef(false);
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
          expiryCheckedRef.current = data.status !== ORDER_STATUS.unpaid;
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
    if (
      !order
      || order.status !== ORDER_STATUS.unpaid
      || remainingSeconds !== 0
      || expiryCheckedRef.current
    ) return;
    expiryCheckedRef.current = true;
    let active = true;
    void services.order.getOrderById(order.id).then(data => {
      if (active) {
        setOrder(data);
        setRemainingSeconds(getPaymentRemainingSeconds(data));
      }
    }).catch(error => {
      if (active) setLoadError(error.message);
    });
    return () => {
      active = false;
    };
  }, [order, remainingSeconds, services]);

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
  const isCancelled = order.status === ORDER_STATUS.cancelled;
  const countdown = formatPaymentCountdown(remainingSeconds);
  const logistics = order.logistics;
  const traces = Array.isArray(logistics?.traces) ? logistics.traces : [];
  const StatusIcon = isUnpaid
    ? ClockCircleFilled
    : isCancelled
      ? CloseCircleFilled
      : order.status === ORDER_STATUS.shipped
        ? TruckOutlined
        : CheckCircleFilled;

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
          <StatusIcon />
          <div>
            <strong>{ORDER_STATUS_LABEL[order.status] || '订单处理中'}</strong>
            <span>
              {isUnpaid
                ? `请在 ${countdown} 内完成支付`
                : STATUS_COPY[order.status] || '订单状态正在更新'}
            </span>
          </div>
        </section>

        <section className="transaction-section logistics-card">
          <div className="section-title">
            <TruckOutlined />
            <h2>物流详情</h2>
          </div>
          {logistics ? (
            <>
              <div className="logistics-meta">
                <strong>{logistics.carrier}</strong>
                <span>运单号 {logistics.trackingNo}</span>
              </div>
              <div className="logistics-timeline">
                {traces.map((trace, index) => (
                  <div className={`logistics-trace${index === 0 ? ' is-current' : ''}`} key={`${trace.status}-${trace.time}`}>
                    <i />
                    <div>
                      <strong>{trace.description}</strong>
                      <span>{formatTime(trace.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="logistics-pending">
              <ClockCircleFilled />
              <div>
                <strong>{isCancelled ? '订单已取消' : '商品正在备货'}</strong>
                <span>{isCancelled ? '该订单不会安排发货' : '发货后可在这里查看承运商和运输轨迹'}</span>
              </div>
            </div>
          )}
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
          <div><span>创建时间</span><strong>{formatTime(order.createTime)}</strong></div>
          {order.payMethod && <div><span>支付方式</span><strong>{order.payMethod}</strong></div>}
          {order.payTime && <div><span>支付时间</span><strong>{formatTime(order.payTime)}</strong></div>}
          {order.shipTime && <div><span>发货时间</span><strong>{formatTime(order.shipTime)}</strong></div>}
          {order.receiveTime && <div><span>签收时间</span><strong>{formatTime(order.receiveTime)}</strong></div>}
          {order.cancelTime && <div><span>取消时间</span><strong>{formatTime(order.cancelTime)}</strong></div>}
        </section>

        <section className="transaction-section price-summary">
          <div><span>商品金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
          <div><span>运费</span><strong className="free-shipping">免运费</strong></div>
          <div className="price-summary-total"><span>订单金额</span><strong>¥{Number(order.totalAmount).toFixed(2)}</strong></div>
        </section>
      </section>

      {isUnpaid && (
        <div className="transaction-action-bar">
          <div>
            <span>剩余 {countdown}</span>
            <strong>¥{Number(order.totalAmount).toFixed(2)}</strong>
          </div>
          <button type="button" className="primary-action" onClick={() => navigate(`/pay/${order.id}`)}>
            立即支付
          </button>
        </div>
      )}
    </main>
  );
};

export default OrderDetailPage;
