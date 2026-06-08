import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircleFilled,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { App, Empty, Modal } from 'antd';

import BottomNav from '../components/BottomNav';
import { ServiceContext } from '../contexts/ServiceContext';
import '../styles/transaction.css';

const CartPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const list = await services.cart.getCartList();
      setCartList(list);
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [services]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);
  const selectedItems = cartList.filter(item => item.selected);
  const allSelected = cartList.length > 0 && selectedItems.length === cartList.length;
  const totalAmount = selectedItems.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  );

  const updateQuantity = async (cartKey, quantity) => {
    try {
      await services.cart.updateQuantity(cartKey, quantity);
      await refresh();
    } catch (error) {
      message.error(error.message);
    }
  };

  const removeItem = item => {
    Modal.confirm({
      title: '移除商品',
      content: `确定从购物车移除“${item.name}”吗？`,
      okText: '移除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await services.cart.removeItem(item.cartKey);
          await refresh();
        } catch (error) {
          message.error(error.message);
        }
      },
    });
  };

  return (
    <main className="transaction-page has-bottom-nav">
      <section className="phone-app">
        <header className="transaction-header">
          <div>
            <span className="transaction-eyebrow">SHOPPING BAG</span>
            <h1>购物车</h1>
          </div>
          <span className="transaction-count">{cartList.length} 种商品</span>
        </header>

        {loading ? (
          <div className="transaction-empty">购物车加载中...</div>
        ) : loadError ? (
          <div className="transaction-empty">
            <strong>{loadError}</strong>
            <button type="button" className="primary-action compact" onClick={refresh}>重新加载</button>
          </div>
        ) : cartList.length === 0 ? (
          <div className="transaction-empty">
            <Empty
              image={<ShoppingCartOutlined className="transaction-empty-icon" />}
              description="购物车还是空的"
            />
            <button type="button" className="primary-action compact" onClick={() => navigate('/home')}>
              去逛逛
            </button>
          </div>
        ) : (
          <div className="cart-list">
            {cartList.map(item => (
              <article className={`cart-item${item.selected ? ' is-selected' : ''}`} key={item.cartKey}>
                <button
                  type="button"
                  className="select-button"
                  aria-label={item.selected ? '取消选择' : '选择商品'}
                  onClick={async () => {
                    try {
                      const list = await services.cart.setSelected(item.cartKey, !item.selected);
                      setCartList(list);
                    } catch (error) {
                      message.error(error.message);
                    }
                  }}
                >
                  <CheckCircleFilled />
                </button>
                <button
                  type="button"
                  className="cart-product-image"
                  onClick={() => navigate(`/detail/${item.id}`)}
                  aria-label={`查看${item.name}`}
                >
                  {item.img ? <img src={item.img} alt={item.name} /> : <strong>{item.name.slice(0, 2)}</strong>}
                </button>
                <div className="cart-item-content">
                  <button
                    type="button"
                    className="plain-product-name"
                    onClick={() => navigate(`/detail/${item.id}`)}
                  >
                    {item.name}
                  </button>
                  <span className="sku-chip">{item.sku}</span>
                  <div className="cart-item-bottom">
                    <strong className="transaction-price">¥{Number(item.price).toFixed(2)}</strong>
                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="减少数量"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                      >
                        <MinusOutlined />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="增加数量"
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-button"
                  aria-label="删除商品"
                  onClick={() => removeItem(item)}
                >
                  <DeleteOutlined />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {cartList.length > 0 && (
        <div className="cart-checkout-bar">
          <button
            type="button"
            className={`select-all-button${allSelected ? ' is-selected' : ''}`}
            onClick={async () => {
              try {
                const list = await services.cart.setAllSelected(!allSelected);
                setCartList(list);
              } catch (error) {
                message.error(error.message);
              }
            }}
          >
            <CheckCircleFilled />
            全选
          </button>
          <div className="checkout-total">
            <span>合计</span>
            <strong>¥{totalAmount.toFixed(2)}</strong>
          </div>
          <button
            type="button"
            className="primary-action checkout-button"
            disabled={selectedItems.length === 0}
            onClick={() => navigate('/createOrder')}
          >
            结算 ({selectedItems.length})
          </button>
        </div>
      )}

      <BottomNav cartCount={cartList.reduce((total, item) => total + item.quantity, 0)} />
    </main>
  );
};

export default CartPage;
