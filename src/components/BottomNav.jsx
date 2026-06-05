import { useLocation, useNavigate } from 'react-router';
import {
  AppstoreOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge } from 'antd';

import { bottomTabs } from '../constants/homeConfig';
import { STORAGE_KEYS } from '../constants/storageKeys';

const tabPathMap = {
  home: '/home',
  category: '/category',
  cart: '/cart',
  profile: '/profile',
};

const bottomIconMap = {
  home: <HomeOutlined />,
  category: <AppstoreOutlined />,
  cart: <ShoppingCartOutlined />,
  profile: <UserOutlined />,
};

const getStoredCartCount = () => {
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
};

const getActiveKey = pathname => {
  if (pathname.startsWith('/category')) return 'category';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home';
};

const BottomNav = ({ cartCount = getStoredCartCount() }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = getActiveKey(location.pathname);

  return (
    <nav className="bottom-nav" aria-label="前台底部导航">
      {bottomTabs.map(tab => (
        <button
          className={tab.key === activeKey ? 'is-active' : ''}
          key={tab.key}
          type="button"
          onClick={() => {
            if (tab.key === activeKey && tab.key === 'home') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            navigate(tabPathMap[tab.key]);
          }}
        >
          {tab.key === 'cart' ? (
            <Badge count={cartCount} size="small">
              {bottomIconMap[tab.icon]}
            </Badge>
          ) : (
            bottomIconMap[tab.icon]
          )}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
