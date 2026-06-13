import {
  default as React,
  startTransition,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useRef,
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
import { ServiceContext } from '../contexts/ServiceContext';
import {
  categoryList,
  bannerList,
  promoDockList,
  productImageMap,
  topChannels,
} from '../constants/homeConfig';

void React.createElement;
const formatPrice = price => Number(price || 0).toFixed(price % 1 ? 1 : 0);

const HOME_PAGE_SIZE = 4;

const normalizeGoodPageResult = (result, fallbackPage) => {
  if (Array.isArray(result)) {
    return {
      list: result,
      total: result.length,
      page: fallbackPage,
      hasMore: false,
    };
  }

  const list = Array.isArray(result?.list) ? result.list : [];
  const total = Number(result?.total ?? list.length);

  return {
    list,
    total,
    page: Number(result?.page ?? fallbackPage),
    hasMore: Boolean(result?.hasMore),
  };
};

const enrichGood = (good, index, offset = 0) => {
  const fallbackCategory = categoryList[((index + offset) % 6) + 1];
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
  const [goods, setGoods] = useState([]);
  const [displayCategories, setDisplayCategories] = useState(categoryList);
  const [cartCount, setCartCount] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const deferredSearchText = useDeferredValue(searchText.trim().toLowerCase());
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const [count, backendCategories] = await Promise.all([
          services.cart.getCartCount(),
          services.category.getCategoryList(),
        ]);
        if (active) {
          setCartCount(count);
          const configMap = Object.fromEntries(categoryList.map(item => [item.key, item]));
          const businessCategories = backendCategories.map((item, index) => ({
            key: item.id,
            label: item.name,
            iconSrc: item.icon || configMap[item.id]?.iconSrc || '/assets/home/icons/recommend.svg',
            tone: configMap[item.id]?.tone || ['red', 'blue', 'green', 'yellow'][index % 4],
          }));
          setDisplayCategories([
            configMap.all,
            ...businessCategories,
            ...categoryList.filter(item => ['shop', 'coupon', 'nearby'].includes(item.key)),
          ].filter(Boolean));
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [services]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      setIsInitialLoading(true);
      setLoadError('');
      setLoadMoreError('');
      try {
        const result = normalizeGoodPageResult(await services.good.getGoodPage({
          page: 1,
          pageSize: HOME_PAGE_SIZE,
          keyword: deferredSearchText,
          categoryId: activeCategory,
        }), 1);
        if (!active) return;

        setGoods(result.list.map((good, index) => enrichGood(good, index)));
        setPage(1);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        if (active) {
          setGoods([]);
          setTotal(0);
          setHasMore(false);
          setLoadError(error.message);
        }
      } finally {
        if (active) setIsInitialLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [activeCategory, deferredSearchText, services]);

  const loadNextPage = useCallback(async () => {
    if (isInitialLoading || isLoadingMoreRef.current || !hasMore) return;

    const nextPage = page + 1;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    try {
      const result = normalizeGoodPageResult(await services.good.getGoodPage({
        page: nextPage,
        pageSize: HOME_PAGE_SIZE,
        keyword: deferredSearchText,
        categoryId: activeCategory,
      }), nextPage);
      setGoods(currentGoods => [
        ...currentGoods,
        ...result.list.map((good, index) =>
          enrichGood(good, index, currentGoods.length)
        ),
      ]);
      setPage(result.page);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setLoadError('');
      setLoadMoreError('');
    } catch (error) {
      setLoadMoreError(error.message);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [
    activeCategory,
    deferredSearchText,
    hasMore,
    isInitialLoading,
    page,
    services,
  ]);

  useEffect(() => {
    if (!hasMore) return undefined;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        ticking = false;
        const distanceToBottom =
          document.documentElement.scrollHeight -
          (window.scrollY + window.innerHeight);

        if (distanceToBottom <= 120) {
          void loadNextPage();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loadNextPage]);

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

  const handleQuickEntryClick = key => {
    if (['shop', 'coupon', 'nearby'].includes(key)) {
      message.info('该频道为首页展示入口，后续可接入独立模块');
      return;
    }
    navigate(`/category?tab=${key}`);
  };

  const handleTopChannelClick = key => {
    setActiveTopChannel(key);
    if (['all', 'digital', 'food', 'life'].includes(key)) {
      handleCategoryClick(key);
      return;
    }
    message.info('该频道为商城运营入口，后续可接入专题页');
  };

  const handleAddToCart = async (event, good) => {
    event.stopPropagation();
    try {
      const cart = await services.cart.addItem({ ...good, sku: '默认规格', quantity: 1 });
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
      message.success('已加入购物车');
    } catch (error) {
      message.error(error.message);
    }
  };

  const goToDetail = id => {
    navigate(`/detail/${id}`);
  };

  const activeCategoryLabel =
    displayCategories.find(item => item.key === activeCategory)?.label || '推荐';

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
                variant="borderless"
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
          {displayCategories.slice(0, 7).map(category => (
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
          {displayCategories.map(category => (
            <button
              className={`quick-entry tone-${category.tone}${activeCategory === category.key ? ' is-active' : ''}`}
              key={category.key}
              type="button"
              onClick={() => handleQuickEntryClick(category.key)}
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
            <span>{goods.length} / {total} 件</span>
          </div>

          {loadError ? (
            <Empty className="home-empty" description={loadError} />
          ) : goods.length > 0 ? (
            <div className="product-grid">
              {goods.map(good => (
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
          ) : isInitialLoading ? (
            <div className="home-load-more">商品加载中...</div>
          ) : (
            <Empty
              className="home-empty"
              description="没有找到匹配的商品，换个关键词试试"
            />
          )}

          {goods.length > 0 && (
            <div className="home-load-more">
              {loadMoreError && <span>{loadMoreError}</span>}
              {hasMore ? (
                <Button
                  className="load-more-btn"
                  htmlType="button"
                  loading={isLoadingMore}
                  onClick={loadNextPage}
                >
                  {isLoadingMore ? '加载中' : '加载更多'}
                </Button>
              ) : (
                <span>已经到底了</span>
              )}
            </div>
          )}
        </section>
      </section>

      <BottomNav cartCount={cartCount} />
    </main>
  );
};

export default HomePage;
