import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';

// Mock useAuth
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/contexts/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: mockLogin,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  it('应正确渲染登录表单', () => {
    renderLogin();

    expect(screen.getByText('用户登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登\s*录/ })).toBeInTheDocument();
  });

  it('应显示"去注册"链接', () => {
    renderLogin();

    expect(screen.getByText('还没有账号？')).toBeInTheDocument();
    expect(screen.getByText('去注册')).toBeInTheDocument();
  });

  it('点击去注册应跳转到注册页', () => {
    renderLogin();

    fireEvent.click(screen.getByText('去注册'));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('提交空表单应显示验证错误', async () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
    });
  });

  it('登录成功应跳转到首页', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('请输入用户名'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  it('登录失败应显示错误信息', async () => {
    mockLogin.mockResolvedValue({ success: false, error: '用户名或密码错误' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('请输入用户名'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
    });
  });
});
