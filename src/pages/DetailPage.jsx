import { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  LeftOutlined,
  ShareAltOutlined,
  ShoppingCartOutlined,
  StarFilled,
  MinusOutlined,
  PlusOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  RightOutlined,
  EnvironmentOutlined,
  CarOutlined,
} from '@ant-design/icons';
import { App } from 'antd';

import { ServiceContext } from '../contexts/ServiceContext';
import { STORAGE_KEYS } from '../constants/storageKeys';
import '../styles/detail.css';

const formatPrice = price => Number(price || 0).toFixed(price % 1 ? 1 : 0);

const formatSales = n => {
  const num = Number(n);
  if (num >= 10000) return `${Math.round(num / 10000)}万`;
  return String(num);
};

const SKU_OPTIONS = {
  digital: { label: '版本', options: ['标准版', '进阶版', '旗舰版'] },
  study:   { label: '版本', options: ['平装版', '精装版'] },
  fashion: { label: '颜色', options: ['经典黑', '纯白', '马卡龙粉'] },
  food:    { label: '规格', options: ['小份装', '家庭装', '礼盒装'] },
  life:    { label: '规格', options: ['单件', '双件套', '礼盒装'] },
  sport:   { label: '尺码', options: ['S', 'M', 'L', 'XL'] },
};

const getSkuConfig = categoryId =>
  SKU_OPTIONS[categoryId] || { label: '规格', options: ['标准版'] };

const GUARANTEES = [
  { icon: <SafetyCertificateOutlined />, label: '正品保障' },
  { icon: <SwapOutlined />,             label: '7天退换' },
  { icon: <ThunderboltOutlined />,      label: '极速退款' },
  { icon: <GiftOutlined />,             label: '满99减20' },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    avatar: '👩',
    name: '京*用户',
    rating: 5,
    date: '2025-05-18',
    sku: '标准版',
    content: '质量很好，物流超快，第二天就到了！包装很精美，和图片完全一致，非常满意这次购物体验。',
  },
  {
    id: 2,
    avatar: '👨',
    name: '购*达人',
    rating: 5,
    date: '2025-06-01',
    sku: '进阶版',
    content: '性价比很高，用了一段时间感觉品质不错，做工精良。客服回复也很及时，下次还会来买。',
  },
];

const DetailPage = () => {
  const { goodId } = useParams();
  const parsedGoodId = parseInt(goodId, 10);
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [sheetMode, setSheetMode] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const good = services.good.getGoodById(parsedGoodId);

  if (!good) {
    navigate('/home');
    return null;
  }

  const originalPrice = Math.round(Number(good.price) * 1.28);
  const discountPct = Math.round((1 - good.price / originalPrice) * 100);
  const skuConfig = getSkuConfig(good.categoryId);
  const totalPrice = (Number(good.price) * quantity).toFixed(2);

  const allGoods = services.good.getGoodList();
  const relatedGoods = allGoods
    .filter(g => g.categoryId === good.categoryId && g.id !== good.id)
    .slice(0, 6);

  const openSheet = mode => {
    setSheetMode(mode);
    setSelectedSku(skuConfig.options[0]);
    setQuantity(1);
  };

  const closeSheet = () => setSheetMode(null);

  const confirmSheet = () => {
    if (!selectedSku) {
      message.warning('请选择规格');
      return;
    }
    if (sheetMode === 'cart') {
      const storedCart = localStorage.getItem(STORAGE_KEYS.cart);
      let cartList;
      try {
        cartList = storedCart ? JSON.parse(storedCart) : [];
      } catch {
        cartList = [];
      }
      const key = `${good.id}-${selectedSku}`;
      const existing = cartList.find(item => item.cartKey === key);
      if (existing) {
        existing.count = (existing.count || 1) + quantity;
      } else {
        cartList.push({ ...good, cartKey: key, sku: selectedSku, count: quantity });
      }
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartList));
      message.success('已加入购物车');
      closeSheet();
    } else {
      closeSheet();
      navigate(`/createOrder/${goodId}`);
    }
  };

  return (
    <main className="detail-page">
      <div className="detail-inner">

        <nav className="detail-navbar" aria-label="商品详情导航">
          <button
            className="detail-navbar-back"
            type="button"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            <LeftOutlined />
            返回
          </button>
          <div className="detail-navbar-actions">
            <button
              className="detail-navbar-action"
              type="button"
              aria-label="分享"
              onClick={() => message.info('链接已复制，快去分享给好友吧')}
            >
              <ShareAltOutlined />
            </button>
          </div>
        </nav>

        <div className="detail-cover">
          {good.img
            ? <img src={good.img} alt={good.name} />
            : <div className="detail-cover-placeholder" aria-hidden="true">{good.name.slice(0, 2)}</div>
          }
          <div className="detail-badge-row">
            <span className="detail-badge">{good.tag}</span>
          </div>
        </div>

        <div className="detail-price-card">
          <div className="detail-price-row">
            <div className="detail-price-main">
              <sup>¥</sup>{formatPrice(good.price)}
            </div>
            <div className="detail-price-original">¥{originalPrice}</div>
            <div className="detail-price-discount">省 {discountPct}%</div>
          </div>
          <h1 className="detail-name">{good.name}</h1>
          <div className="detail-meta-row">
            <div className="detail-rating" aria-label={`评分 ${Number(good.rating).toFixed(1)} 分`}>
              <StarFilled />
              {Number(good.rating).toFixed(1)}
            </div>
            <div className="detail-sales">{formatSales(good.sales)} 人付款</div>
            <span className="detail-category-tag">{good.categoryName}</span>
          </div>
          <div className="detail-coupon-row" aria-label="优惠信息">
            <span className="detail-coupon-tag">全网低价</span>
            <span className="detail-coupon-tag">政府补贴</span>
            <span className="detail-coupon-tag">满99减20</span>
          </div>
        </div>

        <div className="detail-guarantee-bar" aria-label="服务保障">
          {GUARANTEES.map(g => (
            <div className="detail-guarantee-item" key={g.label}>
              {g.icon}
              <span>{g.label}</span>
            </div>
          ))}
        </div>

        <div className="detail-info-card">
          <div className="detail-info-row">
            <span className="detail-info-label"><EnvironmentOutlined /> 发货地</span>
            <span className="detail-info-value">北京仓 · 自营</span>
          </div>
          <div className="detail-info-divider" />
          <div className="detail-info-row">
            <span className="detail-info-label"><CarOutlined /> 配送</span>
            <span className="detail-info-value">预计明日送达 · 免运费</span>
          </div>
          <div className="detail-info-divider" />
          <button
            className="detail-info-row detail-sku-row"
            type="button"
            onClick={() => openSheet('cart')}
            aria-label="选择规格"
          >
            <span className="detail-info-label">规格</span>
            <span className="detail-info-value detail-sku-hint">
              {skuConfig.options[0]} 等{skuConfig.options.length}种
              <RightOutlined className="detail-info-arrow" />
            </span>
          </button>
        </div>

        <div className="detail-section">
          <p className="detail-desc">{good.description}</p>
        </div>

        <section className="detail-review-section" aria-labelledby="review-title">
          <div className="detail-review-header">
            <h2 className="detail-section-title" id="review-title">买家评价</h2>
            <span className="detail-review-score">
              <StarFilled />
              {Number(good.rating).toFixed(1)} 分 · {formatSales(good.sales)}人评价
            </span>
          </div>
          <div className="detail-review-list">
            {MOCK_REVIEWS.map(review => (
              <div className="detail-review-card" key={review.id}>
                <div className="detail-review-top">
                  <span className="detail-review-avatar">{review.avatar}</span>
                  <div className="detail-review-meta">
                    <span className="detail-review-name">{review.name}</span>
                    <span className="detail-review-date">{review.date}</span>
                  </div>
                  <div className="detail-review-stars" aria-label={`${review.rating}星`}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <StarFilled key={i} />
                    ))}
                  </div>
                </div>
                <div className="detail-review-sku">{review.sku}</div>
                <p className="detail-review-content">{review.content}</p>
              </div>
            ))}
          </div>
        </section>

        {relatedGoods.length > 0 && (
          <section className="detail-related-section" aria-labelledby="related-title">
            <h2 className="detail-section-title" id="related-title">同类好物</h2>
            <div className="detail-related-scroll">
              {relatedGoods.map(g => (
                <button
                  key={g.id}
                  className="detail-related-card"
                  type="button"
                  onClick={() => navigate(`/detail/${g.id}`)}
                >
                  <div className="detail-related-img">
                    {g.img
                      ? <img src={g.img} alt={g.name} />
                      : <strong>{g.name.slice(0, 2)}</strong>
                    }
                  </div>
                  <div className="detail-related-name">{g.name}</div>
                  <div className="detail-related-price">¥{formatPrice(g.price)}</div>
                </button>
              ))}
            </div>
          </section>
        )}

      </div>

      <div className="detail-bottom-bar">
        <button
          className="detail-bottom-icon-btn"
          type="button"
          aria-label="购物车"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCartOutlined />
          购物车
        </button>
        <button className="detail-add-cart-btn" type="button" onClick={() => openSheet('cart')}>
          加入购物车
        </button>
        <button className="detail-buy-btn" type="button" onClick={() => openSheet('buy')}>
          立即购买
        </button>
      </div>

      {sheetMode && (
        <div
          className="sku-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="选择规格"
          onClick={closeSheet}
        >
          <div className="sku-sheet" onClick={e => e.stopPropagation()}>
            <div className="sku-sheet-header">
              <div className="sku-sheet-good">
                <div className="sku-sheet-img">
                  {good.img
                    ? <img src={good.img} alt={good.name} />
                    : <strong>{good.name.slice(0, 2)}</strong>
                  }
                </div>
                <div className="sku-sheet-info">
                  <div className="sku-sheet-price-row">
                    <div className="sku-sheet-price">
                      <sup>¥</sup>{formatPrice(good.price)}
                    </div>
                    {quantity > 1 && (
                      <div className="sku-sheet-subtotal">
                        合计 <strong>¥{totalPrice}</strong>
                      </div>
                    )}
                  </div>
                  <div className="sku-sheet-name">{good.name}</div>
                  {selectedSku && (
                    <div className="sku-sheet-selected">已选：{selectedSku} · {quantity}件</div>
                  )}
                </div>
              </div>
              <button
                className="sku-sheet-close"
                type="button"
                aria-label="关闭"
                onClick={closeSheet}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="sku-group">
              <div className="sku-group-label">{skuConfig.label}</div>
              <div className="sku-options">
                {skuConfig.options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    className={`sku-option${selectedSku === opt ? ' is-selected' : ''}`}
                    onClick={() => setSelectedSku(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="sku-quantity-row">
              <span className="sku-quantity-label">数量</span>
              <div className="sku-quantity-ctrl">
                <button
                  type="button"
                  className="sku-qty-btn"
                  aria-label="减少数量"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <MinusOutlined />
                </button>
                <span className="sku-qty-num">{quantity}</span>
                <button
                  type="button"
                  className="sku-qty-btn"
                  aria-label="增加数量"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <PlusOutlined />
                </button>
              </div>
            </div>

            <button
              className={`sku-confirm-btn${sheetMode === 'buy' ? ' is-buy' : ''}`}
              type="button"
              onClick={confirmSheet}
            >
              {sheetMode === 'buy' ? '立即购买' : '加入购物车'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DetailPage;
