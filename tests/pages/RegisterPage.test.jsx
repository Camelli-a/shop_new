import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../src/pages/RegisterPage';

// Mock useAuth
const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/contexts/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    register: mockRegister,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RegisterPage', () => {
  const renderRegister = () => {
    return render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
  };

  it('应正确渲染注册表单', () => {
    renderRegister();

    expect(screen.getByText('用户注册')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名（3-20个字符）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码（6-32个字符）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请再次输入密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入昵称（选填）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入手机号（选填）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /注册/ })).toBeInTheDocument();
  });

  it('应显示"去登录"链接', () => {
    renderRegister();

    expect(screen.getByText('已有账号？')).toBeInTheDocument();
    expect(screen.getByText('去登录')).toBeInTheDocument();
  });

  it('点击去登录应跳转到登录页', () => {
    renderRegister();

    fireEvent.click(screen.getByText('去登录'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('提交空表单应显示验证错误', async () => {
    renderRegister();

    fireEvent.click(screen.getByRole('button', { name: /注册/ }));

    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
    });
  });

  it('两次密码不一致应显示错误', async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('请输入用户名（3-20个字符）'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码（6-32个字符）'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('请再次输入密码'), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: /注册/ }));

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });
  });

  it('注册成功应跳转到首页', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('请输入用户名（3-20个字符）'), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码（6-32个字符）'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('请再次输入密码'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /注册/ }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser', '123456', {
        nickname: undefined,
        phone: undefined,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  it('注册失败应显示错误信息', async () => {
    mockRegister.mockResolvedValue({ success: false, error: '用户名已存在' });
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('请输入用户名（3-20个字符）'), {
      target: { value: 'admin' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码（6-32个字符）'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('请再次输入密码'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /注册/ }));

    await waitFor(() => {
      expect(screen.getByText('用户名已存在')).toBeInTheDocument();
    });
  });
});
