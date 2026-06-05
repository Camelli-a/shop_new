import {
  startTransition,
  useContext,
  useDeferredValue,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import {
  AudioOutlined,
  CameraOutlined,
  CloseOutlined,
  PlusOutlined,
  ScanOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { App, Button, Carousel, Empty, Input } from 'antd';

import BottomNav from '../components/BottomNav';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { ServiceContext } from '../contexts/ServiceContext';
import {
  categoryList,
  bannerList,
  promoDockList,
  productImageMap,
  topChannels,
} from '../constants/homeConfig';

const formatPrice = price => Number(price || 0).toFixed(price % 1 ? 1 : 0);

const enrichGood = (good, index) => {
  const fallbackCategory = categoryList[(index % 6) + 1];
  return {
    categoryName: fallbackCategory.label,
    description: '精选校园生活好物，兼顾价格、品质和日常使用频率。',
    image: productImageMap[good.id],
    originalPrice: Math.round(Number(good.price || 0) * 1.28),
    rating: 4.6 + (index % 4) / 10,
    sales: 620 + index * 186,
    tag: index % 2 === 0 ? '推荐' : '低价',
    ...good,
    categoryId: good.categoryId || fallbackCategory.key,
  };
};

const HomePage = () => {
  const navigate = useNavigate();
  const services = useContext(ServiceContext);
  const { message } = App.useApp();
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTopChannel, setActiveTopChannel] = useState('all');
  const [cartCount, setCartCount] = useState(() => {
    const storedCart = localStorage.getItem(STORAGE_KEYS.cart);
    if (!storedCart) return 0;

    try {
      const cartList = JSON.parse(storedCart);
      return Array.isArray(cartList)
        ? cartList.reduce((total, item) => total + (item.count || 1), 0)
        : 0;
    } catch {
      return 0;
    }
  });
  const deferredSearchText = useDeferredValue(searchText.trim().toLowerCase());

  const goods = services.good.getGoodList().map(enrichGood);
  const filteredGoods = goods.filter(good => {
    const categoryMatched =
      activeCategory === 'all' || good.categoryId === activeCategory;
    const searchMatched =
      !deferredSearchText
      || good.name.toLowerCase().includes(deferredSearchText)
      || good.categoryName.toLowerCase().includes(deferredSearchText)
      || good.description.toLowerCase().includes(deferredSearchText);

    return categoryMatched && searchMatched;
  });
  const handleCategoryClick = key => {
    if (['shop', 'coupon', 'nearby'].includes(key)) {
      message.info('该频道为首页展示入口，后续可接入独立模块');
      return;
    }

    startTransition(() => {
      setActiveCategory(key);
      setActiveTopChannel(key === 'all' ? 'all' : key);
    });
    document
      .getElementById('home-products')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTopChannelClick = key => {
    setActiveTopChannel(key);
    if (['all', 'digital', 'food', 'life'].includes(key)) {
      handleCategoryClick(key);
      return;
    }
    message.info('该频道为商城运营入口，后续可接入专题页');
  };

  const handleAddToCart = (event, good) => {
    event.stopPropagation();
    const storedCart = localStorage.getItem(STORAGE_KEYS.cart);
    let cartList;

    try {
      cartList = storedCart ? JSON.parse(storedCart) : [];
    } catch {
      cartList = [];
    }

    const existingItem = cartList.find(item => item.id === good.id);
    if (existingItem) {
      existingItem.count = (existingItem.count || 1) + 1;
    } else {
      cartList.push({ ...good, count: 1 });
    }

    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartList));
    setCartCount(cartList.reduce((total, item) => total + (item.count || 1), 0));
    message.success('已加入购物车');
  };

  const goToDetail = id => {
    navigate(`/detail/${id}`);
  };

  const activeCategoryLabel =
    categoryList.find(item => item.key === activeCategory)?.label || '推荐';

  return (
    <main className="mall-home">
      <section className="phone-app">
        <header className="mall-header">
          <nav className="top-channel-bar" aria-label="顶部频道">
            {topChannels.map(channel => (
              <button
                className={activeTopChannel === channel.key ? 'is-active' : ''}
                key={channel.key}
                type="button"
                onClick={() => handleTopChannelClick(channel.key)}
              >
                {channel.label}
                {channel.key === 'campus' && <span>团</span>}
              </button>
            ))}
          </nav>

          <div className="mall-search-row">
            <div className="mall-search-box">
              <ScanOutlined className="search-scan" />
              <Input
                className="home-search"
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
                allowClear
                bordered={false}
                prefix={<SearchOutlined />}
                placeholder="搜商品 / 店铺 / 优惠"
              />
              <AudioOutlined className="search-voice" />
              <CameraOutlined className="search-camera" />
              <button className="search-submit" type="button">
                搜索
              </button>
            </div>
          </div>
        </header>

        <div className="category-pills" aria-label="分类筛选">
          {categoryList.slice(0, 7).map(category => (
            <button
              className={activeCategory === category.key ? 'is-active' : ''}
              key={category.key}
              type="button"
              onClick={() => handleCategoryClick(category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <section className="quick-grid" aria-label="商品频道">
          {categoryList.map(category => (
            <button
              className={`quick-entry tone-${category.tone}${activeCategory === category.key ? ' is-active' : ''}`}
              key={category.key}
              type="button"
              onClick={() => handleCategoryClick(category.key)}
            >
              <span>
                <img alt="" src={category.iconSrc} />
              </span>
              <em>{category.label}</em>
            </button>
          ))}
        </section>

        <section className="promo-card" aria-label="商城活动轮播">
          <Carousel autoplay autoplaySpeed={3200} dots={{ className: 'home-dots' }}>
            {bannerList.map(slide => (
              <article className="promo-board" key={slide.title}>
                <div className="promo-board-grid">
                  {slide.products.map((product, index) => (
                    <button
                      className="board-product-card"
                      key={product.image}
                      type="button"
                      onClick={() => handleTopChannelClick(slide.theme === 'snack' ? 'food' : slide.theme)}
                    >
                      <div className="board-card-head">
                        <span>{index === 0 ? slide.badge : slide.label}</span>
                        <strong>{index === 0 ? slide.title : slide.action}</strong>
                      </div>
                      <div className="board-card-body">
                        <img alt="" src={product.image} />
                        <div>
                          <em>{product.name}</em>
                          <b>{product.price}</b>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="coupon-board">
                  <div className="coupon-board-title">
                    <strong>618品类周</strong>
                    <span>{slide.desc}</span>
                  </div>
                  <div className="coupon-items">
                    {promoDockList.map(item => (
                      <button
                        className={`coupon-mini-card tone-${item.tone}`}
                        key={`${slide.theme}-${item.key}`}
                        type="button"
                        onClick={() => handleTopChannelClick(item.key)}
                      >
                        <span>{item.label}</span>
                        <strong>{item.desc}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </Carousel>
        </section>

        <section className="product-section" id="home-products" aria-labelledby="product-title">
          <div className="feed-heading">
            <h2 id="product-title">{activeCategoryLabel}好物</h2>
            <span>{filteredGoods.length} 件</span>
          </div>

          {filteredGoods.length > 0 ? (
            <div className="product-grid">
              {filteredGoods.map(good => (
                <article
                  className="product-card"
                  key={good.id}
                  onClick={() => goToDetail(good.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={event => {
                    if (event.key === 'Enter') goToDetail(good.id);
                  }}
                >
                  <div className="product-cover">
                    {good.image ? (
                      <img alt={good.name} src={good.image} />
                    ) : (
                      <strong>{good.name.slice(0, 2)}</strong>
                    )}
                    <button
                      aria-label="不感兴趣"
                      className="hide-product"
                      type="button"
                      onClick={event => event.stopPropagation()}
                    >
                      <CloseOutlined />
                    </button>
                  </div>

                  <div className="product-info">
                    <h3>{good.name}</h3>
                    <div className="product-meta">
                      <span>{good.tag}</span>
                      <em>{Math.round(good.sales / 10000) || 1}万人关注店铺</em>
                    </div>
                    <div className="coupon-line">
                      <span>全网低价</span>
                      <em>政府补贴价</em>
                    </div>
                    <div className="product-footer">
                      <div>
                        <strong>¥{formatPrice(good.price)}</strong>
                        <small>{Number(good.rating).toFixed(1)}分 已售{good.sales}</small>
                      </div>
                      <Button
                        className="add-cart-btn"
                        shape="circle"
                        icon={<PlusOutlined />}
                        aria-label={`加入购物车：${good.name}`}
                        onClick={event => handleAddToCart(event, good)}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty
              className="home-empty"
              description="没有找到匹配的商品，换个关键词试试"
            />
          )}
        </section>
      </section>

      <BottomNav cartCount={cartCount} />
    </main>
  );
};

export default HomePage;
