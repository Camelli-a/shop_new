import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { EnvironmentOutlined, LeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { App, Input } from 'antd';

import { ServiceContext } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/useAuth';
import '../styles/transaction.css';

const CreateOrderPage = () => {
  const { goodId } = useParams();
  const [searchParams] = useSearchParams();
  const services = useContext(ServiceContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [receiver, setReceiver] = useState(user?.nickname || '');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone?.includes('*') ? '' : user?.phone || '');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        let nextItems;
        if (!goodId) {
          nextItems = await services.cart.getSelectedItems(user?.id || 1);
        } else {
          const good = await services.good.getGoodById(Number(goodId));
          nextItems = [{
            ...good,
            sku: searchParams.get('sku') || '默认规格',
            quantity: Math.max(1, Number(searchParams.get('quantity')) || 1),
          }];
        }
        if (active) {
          setItems(nextItems);
          setLoadError('');
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [goodId, searchParams, services, user?.id]);

  const totalAmount = items.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  );

  const submitOrder = async () => {
    if (!items.length) {
      message.warning('没有可结算的商品');
      navigate('/cart');
      return;
    }
    if (!receiver.trim() || !/^1\d{10}$/.test(receiverPhone) || !address.trim()) {
      message.warning('请填写完整、有效的收货信息');
      return;
    }

    setSubmitting(true);
    try {
      const order = await services.order.createOrder(user?.id || 1, items, {
        receiver: receiver.trim(),
        receiverPhone,
        address: address.trim(),
        userName: user?.nickname,
        userPhone: receiverPhone,
      });
      message.success('订单创建成功');
      navigate(`/pay/${order.id}`, { replace: true });
    } catch (error) {
      message.error(error.message || '创建订单失败');
      setSubmitting(false);
    }
  };

  return (
    <main className="transaction-page has-action-bar">
      <section className="phone-app">
        <header className="transaction-navbar">
          <button type="button" onClick={() => navigate(-1)} aria-label="返回">
            <LeftOutlined />
          </button>
          <h1>确认订单</h1>
          <span />
        </header>

        {loadError && <section className="transaction-section">{loadError}</section>}

        <section className="transaction-section address-section">
          <div className="section-title">
            <EnvironmentOutlined />
            <h2>收货信息</h2>
          </div>
          <div className="address-grid">
            <Input value={receiver} onChange={event => setReceiver(event.target.value)} placeholder="收货人" maxLength={20} />
            <Input value={receiverPhone} onChange={event => setReceiverPhone(event.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11 位手机号" inputMode="numeric" />
            <Input.TextArea value={address} onChange={event => setAddress(event.target.value)} placeholder="详细收货地址" maxLength={80} autoSize={{ minRows: 2, maxRows: 3 }} />
          </div>
        </section>

        <section className="transaction-section">
          <div className="section-title">
            <SafetyCertificateOutlined />
            <h2>商品清单</h2>
            <span>{items.length} 种</span>
          </div>
          <div className="order-product-list">
            {items.map(item => (
              <div className="order-product-row" key={item.cartKey || `${item.id}-${item.sku}`}>
                <div className="order-product-image">
                  {item.img ? <img src={item.img} alt={item.name} /> : <strong>{item.name.slice(0, 2)}</strong>}
                </div>
                <div className="order-product-info">
                  <strong>{item.name}</strong>
                  <span>{item.sku} · x{item.quantity}</span>
                </div>
                <b>¥{(Number(item.price) * item.quantity).toFixed(2)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="transaction-section price-summary">
          <div><span>商品金额</span><strong>¥{totalAmount.toFixed(2)}</strong></div>
          <div><span>运费</span><strong className="free-shipping">免运费</strong></div>
          <div className="price-summary-total"><span>应付金额</span><strong>¥{totalAmount.toFixed(2)}</strong></div>
        </section>
      </section>

      <div className="transaction-action-bar">
        <div><span>应付</span><strong>¥{totalAmount.toFixed(2)}</strong></div>
        <button type="button" className="primary-action" disabled={submitting || !items.length} onClick={submitOrder}>
          {submitting ? '提交中...' : '提交订单'}
        </button>
      </div>
    </main>
  );
};

export default CreateOrderPage;
