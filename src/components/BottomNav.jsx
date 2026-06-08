import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  AppstoreOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge } from 'antd';

import { bottomTabs } from '../constants/homeConfig';
import { ServiceContext } from '../contexts/ServiceContext';

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

const getActiveKey = pathname => {
  if (pathname.startsWith('/category')) return 'category';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'home';
};

const BottomNav = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const services = useContext(ServiceContext);
  const activeKey = getActiveKey(location.pathname);
  const displayedCartCount = cartCount ?? services.cart.getCartCount();

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
            <Badge count={displayedCartCount} size="small">
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
