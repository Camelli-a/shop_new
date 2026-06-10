// eslint-disable-next-line
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute';

let mockIsAuthenticated = false;

vi.mock('../../src/contexts/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
  }),
}));

describe('ProtectedRoute - 登录拦截', () => {
  it('未登录时应重定向到登录页', () => {
    mockIsAuthenticated = false;

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/login" element={<div>登录页面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>个人中心</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('登录页面')).toBeInTheDocument();
    expect(screen.queryByText('个人中心')).not.toBeInTheDocument();
  });

  it('已登录时应正常渲染子页面', () => {
    mockIsAuthenticated = true;

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/login" element={<div>登录页面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<div>个人中心</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('个人中心')).toBeInTheDocument();
    expect(screen.queryByText('登录页面')).not.toBeInTheDocument();
  });

  it('未登录访问订单页应重定向到登录页', () => {
    mockIsAuthenticated = false;

    render(
      <MemoryRouter initialEntries={['/orderList']}>
        <Routes>
          <Route path="/login" element={<div>登录页面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/orderList" element={<div>订单列表</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('登录页面')).toBeInTheDocument();
    expect(screen.queryByText('订单列表')).not.toBeInTheDocument();
  });

  it('未登录访问个人信息页应重定向到登录页', () => {
    mockIsAuthenticated = false;

    render(
      <MemoryRouter initialEntries={['/profile/info']}>
        <Routes>
          <Route path="/login" element={<div>登录页面</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/info" element={<div>个人信息</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('登录页面')).toBeInTheDocument();
    expect(screen.queryByText('个人信息')).not.toBeInTheDocument();
  });
});
