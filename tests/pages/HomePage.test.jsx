import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App as AntdApp } from 'antd';

import HomePage from '../../src/pages/HomePage';
import { ServiceContext } from '../../src/contexts/ServiceContext';

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Carousel: ({ children }) => React.createElement('div', { 'data-testid': 'carousel' }, children),
  };
});

const pageOneGoods = [
  {
    id: 1,
    name: '蓝牙耳机',
    price: 199,
    categoryId: 'digital',
    categoryName: '数码好物',
    description: '降噪耳机',
    img: '/a.png',
    status: 1,
  },
  {
    id: 2,
    name: '宿舍台灯',
    price: 59,
    categoryId: 'life',
    categoryName: '生活日用',
    description: '学习照明',
    img: '/b.png',
    status: 1,
  },
];

const pageTwoGoods = [
  {
    id: 3,
    name: '机械键盘',
    price: 299,
    categoryId: 'digital',
    categoryName: '数码好物',
    description: '办公游戏',
    img: '/c.png',
    status: 1,
  },
];

const categories = [
  { id: 'digital', name: '数码好物', icon: '/digital.svg', status: 1 },
  { id: 'life', name: '生活日用', icon: '/life.svg', status: 1 },
];

const renderHome = services => render(
  <MemoryRouter>
    <AntdApp>
      <ServiceContext.Provider value={services}>
        <HomePage />
      </ServiceContext.Provider>
    </AntdApp>
  </MemoryRouter>
);

describe('HomePage', () => {
  let services;

  beforeEach(() => {
    vi.clearAllMocks();
    services = {
      good: {
        getGoodPage: vi.fn(({ page }) => Promise.resolve(
          page === 1
            ? { list: pageOneGoods, total: 3, page: 1, pageSize: 4, hasMore: true }
            : { list: pageTwoGoods, total: 3, page: 2, pageSize: 4, hasMore: false }
        )),
      },
      cart: {
        getCartCount: vi.fn().mockResolvedValue(0),
        addItem: vi.fn().mockResolvedValue([{ quantity: 1 }]),
      },
      category: {
        getCategoryList: vi.fn().mockResolvedValue(categories),
      },
    };
  });

  it('首次进入首页应按第一页加载商品', async () => {
    renderHome(services);

    expect(await screen.findByText('蓝牙耳机')).toBeInTheDocument();
    expect(screen.getByText('宿舍台灯')).toBeInTheDocument();
    expect(screen.getByText('2 / 3 件')).toBeInTheDocument();
    expect(services.good.getGoodPage).toHaveBeenCalledWith({
      page: 1,
      pageSize: 4,
      keyword: '',
      categoryId: 'all',
    });
  });

  it('点击加载更多应请求下一页并追加商品', async () => {
    renderHome(services);

    expect(await screen.findByText('蓝牙耳机')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '加载更多' }));

    expect(await screen.findByText('机械键盘')).toBeInTheDocument();
    expect(screen.getByText('3 / 3 件')).toBeInTheDocument();
    expect(screen.getByText('已经到底了')).toBeInTheDocument();
    expect(services.good.getGoodPage).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 4,
      keyword: '',
      categoryId: 'all',
    });
  });

  it('滚动接近底部时应自动请求下一页', async () => {
    renderHome(services);

    expect(await screen.findByText('蓝牙耳机')).toBeInTheDocument();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 20,
    });
    fireEvent.scroll(window);

    expect(await screen.findByText('机械键盘')).toBeInTheDocument();
    expect(services.good.getGoodPage).toHaveBeenLastCalledWith({
      page: 2,
      pageSize: 4,
      keyword: '',
      categoryId: 'all',
    });
  });

  it('输入搜索词应使用关键词重新请求第一页', async () => {
    renderHome(services);

    await screen.findByText('蓝牙耳机');
    fireEvent.change(screen.getByPlaceholderText('搜商品 / 店铺 / 优惠'), {
      target: { value: '键盘' },
    });

    await waitFor(() => {
      expect(services.good.getGoodPage).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 4,
        keyword: '键盘',
        categoryId: 'all',
      });
    });
  });

  it('后端返回旧数组格式时仍应正常展示商品', async () => {
    services.good.getGoodPage.mockResolvedValueOnce(pageOneGoods);

    renderHome(services);

    expect(await screen.findByText('蓝牙耳机')).toBeInTheDocument();
    expect(screen.getByText('2 / 2 件')).toBeInTheDocument();
    expect(screen.getByText('已经到底了')).toBeInTheDocument();
  });
});
