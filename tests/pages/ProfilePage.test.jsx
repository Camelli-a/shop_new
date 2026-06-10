import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../../src/pages/ProfilePage';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

// 默认已登录的 mock
let mockIsAuthenticated = true;
const mockUser = {
  id: 1,
  username: 'admin',
  nickname: '京东用户',
  phone: '138****8888',
  avatar: '/assets/home/icons/recommend.svg',
};

vi.mock('../../src/contexts/useAuth', () => ({
  useAuth: () => ({
    user: mockIsAuthenticated ? mockUser : null,
    isAuthenticated: mockIsAuthenticated,
    logout: mockLogout,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock BottomNav 组件
vi.mock('../../src/components/BottomNav', () => ({
  default: () => <nav data-testid="bottom-nav" />,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockIsAuthenticated = true;
});

describe('ProfilePage - 已登录状态', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );
  };

  it('应显示用户昵称和手机号', () => {
    renderPage();

    expect(screen.getByText('京东用户')).toBeInTheDocument();
    expect(screen.getByText('138****8888')).toBeInTheDocument();
  });

  it('应显示我的订单区域', () => {
    renderPage();

    expect(screen.getAllByText('我的订单').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('全部')).toBeInTheDocument();
    expect(screen.getByText('待付款')).toBeInTheDocument();
    expect(screen.getByText('已付款')).toBeInTheDocument();
  });

  it('应显示个人信息和我的订单入口', () => {
    renderPage();

    expect(screen.getByText('个人信息')).toBeInTheDocument();
  });

  it('点击个人信息应跳转', () => {
    renderPage();

    fireEvent.click(screen.getByText('个人信息'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile/info');
  });

  it('点击全部订单应跳转到订单列表', () => {
    renderPage();

    fireEvent.click(screen.getByText('全部订单'));
    expect(mockNavigate).toHaveBeenCalledWith('/orderList');
  });

  it('应显示退出登录按钮', () => {
    renderPage();

    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });
});

describe('ProfilePage - 未登录状态', () => {
  it('未登录应显示去登录按钮', () => {
    mockIsAuthenticated = false;

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText('未登录')).toBeInTheDocument();
    expect(screen.getByText('去登录')).toBeInTheDocument();
  });

  it('点击去登录应跳转到登录页', () => {
    mockIsAuthenticated = false;

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('去登录'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
