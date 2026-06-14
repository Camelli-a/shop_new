import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ServiceContext } from '../../src/contexts/ServiceContext';
import PayPage from '../../src/pages/PayPage';

const mockNavigate = vi.fn();
const mockMessage = {
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ orderId: '1' }),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  const MockApp = ({ children }) => children;
  MockApp.useApp = () => ({ message: mockMessage });
  return {
    ...actual,
    App: MockApp,
    QRCode: ({ value, status }) => (
      <div data-testid="payment-qrcode" data-value={value} data-status={status} />
    ),
  };
});

const createOrder = (overrides = {}) => ({
  id: 1,
  orderNo: '20260613001',
  status: 0,
  totalAmount: 99,
  expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  items: [{ goodId: 1, name: '测试商品', sku: '默认', quantity: 1, subtotal: 99 }],
  ...overrides,
});

const renderPage = order => {
  const orderService = {
    getOrderById: vi.fn().mockResolvedValue(order),
    payOrder: vi.fn().mockResolvedValue({ ...order, status: 1 }),
  };
  render(
    <ServiceContext.Provider value={{ order: orderService }}>
      <PayPage />
    </ServiceContext.Provider>
  );
  return orderService;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PayPage', () => {
  it('shows persistent countdown and payment QR code', async () => {
    renderPage(createOrder());

    expect(await screen.findByText(/支付剩余 15:00|支付剩余 14:59/)).toBeInTheDocument();
    expect(screen.getByTestId('payment-qrcode')).toHaveAttribute('data-status', 'active');
  });

  it('updates QR code when payment method changes', async () => {
    renderPage(createOrder());
    await screen.findByText(/支付剩余/);

    fireEvent.click(screen.getByRole('button', { name: /支付宝/ }));

    expect(screen.getByText('请使用支付宝扫码完成模拟支付')).toBeInTheDocument();
    expect(screen.getByTestId('payment-qrcode').dataset.value).toContain('支付宝');
  });

  it('uses create time when legacy order has no expiry time', async () => {
    const order = createOrder({
      expiresAt: undefined,
      createTime: new Date().toISOString(),
    });
    renderPage(order);

    expect(await screen.findByText(/支付剩余 15:00|支付剩余 14:59/)).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('disables payment for cancelled order', async () => {
    renderPage(createOrder({
      status: 4,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }));

    await waitFor(() => {
      expect(screen.getAllByText('订单已超时取消').length).toBeGreaterThan(0);
    });
    expect(screen.getByRole('button', { name: '订单已取消' })).toBeDisabled();
    expect(screen.getByTestId('payment-qrcode')).toHaveAttribute('data-status', 'expired');
  });
});
