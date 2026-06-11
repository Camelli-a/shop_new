import React from 'react';
import { useContext, useEffect, useState } from 'react';
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
  home: React.createElement(HomeOutlined),
  category: React.createElement(AppstoreOutlined),
  cart: React.createElement(ShoppingCartOutlined),
  profile: React.createElement(UserOutlined),
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
  const [storedCartCount, setStoredCartCount] = useState(0);
  const displayedCartCount = cartCount ?? storedCartCount;

  useEffect(() => {
    if (cartCount !== undefined) return undefined;
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const count = await services.cart.getCartCount();
        if (active) setStoredCartCount(count);
      } catch {
        if (active) setStoredCartCount(0);
      }
    });
    return () => {
      active = false;
    };
  }, [cartCount, services]);

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
