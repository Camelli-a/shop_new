import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { ServiceContext } from '../../src/contexts/ServiceContext';
import OrderDetailPage from '../../src/pages/OrderDetailPage';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ orderId: '1' }),
}));

const createOrder = (overrides = {}) => ({
  id: 1,
  orderNo: '20260613001',
  status: 1,
  totalAmount: 99,
  receiver: '测试用户',
  receiverPhone: '13800000000',
  address: '测试地址',
  createTime: '2026-06-13T10:00:00.000Z',
  items: [{ goodId: 1, name: '测试商品', sku: '默认', quantity: 1, subtotal: 99 }],
  logistics: null,
  ...overrides,
});

const renderPage = (order, getOrderById = vi.fn().mockResolvedValue(order)) => {
  render(
    <ServiceContext.Provider value={{ order: { getOrderById } }}>
      <OrderDetailPage />
    </ServiceContext.Provider>
  );
  return getOrderById;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OrderDetailPage', () => {
  it('shows payment countdown for unpaid order', async () => {
    renderPage(createOrder({
      status: 0,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }));

    expect(await screen.findByText(/请在 (15:00|14:59) 内完成支付/)).toBeInTheDocument();
    expect(screen.getByText(/剩余 (15:00|14:59)/)).toBeInTheDocument();
  });

  it('uses create time for legacy unpaid order without expiry time', async () => {
    renderPage(createOrder({
      status: 0,
      expiresAt: undefined,
      createTime: new Date().toISOString(),
    }));

    expect(await screen.findByText(/请在 (15:00|14:59) 内完成支付/)).toBeInTheDocument();
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('refreshes order once when payment countdown expires', async () => {
    const unpaidOrder = createOrder({
      status: 0,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const cancelledOrder = createOrder({ status: 4 });
    const getOrderById = vi.fn()
      .mockResolvedValueOnce(unpaidOrder)
      .mockResolvedValueOnce(cancelledOrder);

    renderPage(unpaidOrder, getOrderById);

    await waitFor(() => expect(getOrderById).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('已取消')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '立即支付' })).not.toBeInTheDocument();
  });

  it('shows preparing message before shipment', async () => {
    renderPage(createOrder());

    expect(await screen.findByText('商品正在备货')).toBeInTheDocument();
    expect(screen.getByText('发货后可在这里查看承运商和运输轨迹')).toBeInTheDocument();
  });

  it('shows carrier, tracking number and logistics traces', async () => {
    renderPage(createOrder({
      status: 2,
      logistics: {
        carrier: '顺丰速运',
        trackingNo: 'SF20260613001',
        traces: [{
          status: 'shipped',
          description: '商品已由商家发出，等待快递揽收',
          time: '2026-06-13T11:00:00.000Z',
        }],
      },
    }));

    expect(await screen.findByText('顺丰速运')).toBeInTheDocument();
    expect(screen.getByText('运单号 SF20260613001')).toBeInTheDocument();
    expect(screen.getByText('商品已由商家发出，等待快递揽收')).toBeInTheDocument();
  });

  it('shows cancelled status without payment action', async () => {
    renderPage(createOrder({ status: 4 }));

    expect(await screen.findByText('已取消')).toBeInTheDocument();
    expect(screen.getByText('该订单不会安排发货')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '立即支付' })).not.toBeInTheDocument();
  });

  it('does not show countdown for paid order', async () => {
    renderPage(createOrder({ status: 1 }));

    expect(await screen.findByText('商品正在备货')).toBeInTheDocument();
    expect(screen.queryByText(/请在 \d{2}:\d{2} 内完成支付/)).not.toBeInTheDocument();
    expect(screen.queryByText(/剩余 \d{2}:\d{2}/)).not.toBeInTheDocument();
  });
});
