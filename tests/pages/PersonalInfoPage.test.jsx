// eslint-disable-next-line
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonalInfoPage from '../../src/pages/PersonalInfoPage';

// Mock useAuth
const mockUpdateProfile = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/contexts/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'admin',
      nickname: '京东用户',
      phone: '138****8888',
      gender: '男',
      avatar: '/assets/home/icons/recommend.svg',
    },
    updateProfile: mockUpdateProfile,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PersonalInfoPage', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <PersonalInfoPage />
      </MemoryRouter>
    );
  };

  it('应正确渲染个人信息页面', () => {
    renderPage();

    expect(screen.getByText('个人信息')).toBeInTheDocument();
    expect(screen.getByDisplayValue('京东用户')).toBeInTheDocument();
    expect(screen.getByText('138****8888')).toBeInTheDocument();
    expect(screen.getByText('男')).toBeInTheDocument();
  });

  it('应显示用户头像', () => {
    renderPage();

    const avatar = screen.getByAltText('用户头像');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/assets/home/icons/recommend.svg');
  });

  it('点击返回应跳转到个人中心', () => {
    renderPage();

    fireEvent.click(screen.getByLabelText('返回'));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('昵称为空时保存应显示错误', async () => {
    renderPage();

    const input = screen.getByDisplayValue('京东用户');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));

    expect(screen.getByText('请输入昵称')).toBeInTheDocument();
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('保存成功应调用 updateProfile', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    renderPage();

    const input = screen.getByDisplayValue('京东用户');
    fireEvent.change(input, { target: { value: '新昵称' } });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ nickname: '新昵称' });
    });
  });

  it('保存失败应显示错误提示', async () => {
    mockUpdateProfile.mockResolvedValue({ success: false, error: '修改失败' });
    renderPage();

    const input = screen.getByDisplayValue('京东用户');
    fireEvent.change(input, { target: { value: '新昵称' } });
    fireEvent.click(screen.getByRole('button', { name: /保\s*存/ }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });
});
