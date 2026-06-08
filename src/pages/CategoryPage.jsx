import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { App } from 'antd';

import BottomNav from '../components/BottomNav';
import { ServiceContext } from '../contexts/ServiceContext';
import { categoryList } from '../constants/homeConfig';
import '../styles/category.css';

const SORT_OPTIONS = [
  { key: 'default', label: '综合' },
  { key: 'price_asc', label: '价格↑' },
  { key: 'price_desc', label: '价格↓' },
  { key: 'sales', label: '销量' },
];

const formatPrice = price => Number(price || 0).toFixed(price % 1 ? 1 : 0);

const formatSales = n => {
  const num = Number(n);
  if (num >= 10000) return `${Math.round(num / 10000)}万`;
  return String(num);
};

const sortGoods = (goods, sortKey) => {
  const list = [...goods];
  if (sortKey === 'price_asc') return list.sort((a, b) => a.price - b.price);
  if (sortKey === 'price_desc') return list.sort((a, b) => b.price - a.price);
  if (sortKey === 'sales') return list.sort((a, b) => b.sales - a.sales);
  return list;
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const services = useContext(ServiceContext);
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('tab') || 'all';
  const [sortKey, setSortKey] = useState('default');
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [allGoods, setAllGoods] = useState([]);
  const [displayCategories, setDisplayCategories] = useState(
    categoryList.filter(c => !['shop', 'coupon', 'nearby'].includes(c.key))
  );
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const [goods, count, backendCategories] = await Promise.all([
          services.good.getGoodList(),
          services.cart.getCartCount(),
          services.category.getCategoryList(),
        ]);
        if (active) {
          setAllGoods(goods);
          setCartCount(count);
          const configMap = Object.fromEntries(categoryList.map(item => [item.key, item]));
          setDisplayCategories([
            configMap.all,
            ...backendCategories.map((item, index) => ({
              key: item.id,
              label: item.name,
              iconSrc: item.icon || configMap[item.id]?.iconSrc || '/assets/home/icons/recommend.svg',
              tone: configMap[item.id]?.tone || ['red', 'blue', 'green', 'yellow'][index % 4],
            })),
          ].filter(Boolean));
          setLoadError('');
        }
      } catch (error) {
        if (active) setLoadError(error.message);
      }
    });
    return () => {
      active = false;
    };
  }, [services]);

  const filteredGoods = sortGoods(
    allGoods.filter(good => {
      const categoryMatched =
        activeCategory === 'all' || good.categoryId === activeCategory;
      const searchMatched =
        !searchText.trim() ||
        good.name.toLowerCase().includes(searchText.trim().toLowerCase());
      return categoryMatched && searchMatched;
    }),
    sortKey
  );

  const handleAddToCart = async (e, good) => {
    e.stopPropagation();
    try {
      const cart = await services.cart.addItem({ ...good, sku: '默认规格', quantity: 1 });
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
      message.success('已加入购物车');
    } catch (error) {
      message.error(error.message);
    }
  };

  const activeCategoryLabel =
    displayCategories.find(c => c.key === activeCategory)?.label || '全部';

  return (
    <div className="category-page">
      <div className="category-layout">
        <aside className="category-sidebar" aria-label="商品分类">
          {displayCategories.map(cat => (
            <button
              key={cat.key}
              type="button"
              className={`category-sidebar-item${activeCategory === cat.key ? ' is-active' : ''}`}
              onClick={() => {
                setSearchParams({ tab: cat.key });
                setSortKey('default');
                setSearchText('');
              }}
              aria-current={activeCategory === cat.key ? 'true' : undefined}
            >
              <span className="category-sidebar-icon">
                <img src={cat.iconSrc} alt="" aria-hidden="true" />
              </span>
              <span className="category-sidebar-label">{cat.label}</span>
            </button>
          ))}
        </aside>

        <main className="category-main">
          <div className="category-search-bar">
            <div className="category-search-box">
              <SearchOutlined className="category-search-icon" />
              <input
                className="category-search-input"
                type="search"
                placeholder={`搜索${activeCategoryLabel}商品`}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                aria-label="搜索商品"
              />
              {searchText && (
                <button
                  className="category-search-clear"
                  type="button"
                  onClick={() => setSearchText('')}
                  aria-label="清除搜索"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="category-sort-bar" role="group" aria-label="排序方式">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                className={`category-sort-btn${sortKey === opt.key ? ' is-active' : ''}`}
                onClick={() => setSortKey(opt.key)}
              >
                {opt.label}
              </button>
            ))}
            <span className="category-count">{filteredGoods.length} 件</span>
          </div>

          {loadError ? (
            <div className="category-empty"><p>加载失败</p><span>{loadError}</span></div>
          ) : filteredGoods.length > 0 ? (
            <div className="category-goods-grid">
              {filteredGoods.map(good => (
                <article
                  key={good.id}
                  className="category-good-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/detail/${good.id}`)}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(`/detail/${good.id}`); }}
                >
                  <div className="category-good-img">
                    {good.img
                      ? <img src={good.img} alt={good.name} />
                      : <strong aria-hidden="true">{good.name.slice(0, 2)}</strong>
                    }
                    {good.tag && <span className="category-good-tag">{good.tag}</span>}
                  </div>
                  <div className="category-good-info">
                    <h3 className="category-good-name">{good.name}</h3>
                    <div className="category-good-sales">{formatSales(good.sales)}人付款</div>
                    <div className="category-good-footer">
                      <span className="category-good-price">
                        <sup>¥</sup>{formatPrice(good.price)}
                      </span>
                      <button
                        type="button"
                        className="category-add-btn"
                        aria-label={`加入购物车：${good.name}`}
                        onClick={e => handleAddToCart(e, good)}
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="category-empty">
              <p>暂无商品</p>
              <span>换个分类或关键词试试</span>
            </div>
          )}
        </main>
      </div>

      <BottomNav cartCount={cartCount} />
    </div>
  );
};

export default CategoryPage;
