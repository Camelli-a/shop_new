import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock('../../src/services/apiClient.js', () => ({
  apiRequest: apiRequestMock,
}));

import orderService from '../../src/services/orderService.js';

describe('orderService', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('creates a multi-item order with receiver information', async () => {
    apiRequestMock.mockResolvedValue({ id: 20 });
    const items = [
      {
        cartKey: '1-red',
        goodId: 1,
        sku: 'red',
        quantity: 2,
      },
      {
        cartKey: '2-default',
        id: 2,
        sku: 'default',
        count: 3,
      },
      { id: 3 },
    ];
    const receiverInfo = {
      receiverName: 'Test User',
      receiverPhone: '13800000000',
      receiverAddress: 'Test Address',
    };

    await orderService.createOrder(6, items, receiverInfo);

    expect(apiRequestMock).toHaveBeenCalledWith('/api/users/6/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { cartKey: '1-red', goodId: 1, sku: 'red', quantity: 2 },
          { cartKey: '2-default', goodId: 2, sku: 'default', quantity: 3 },
          { goodId: 3, quantity: 1 },
        ],
        ...receiverInfo,
      }),
    });
  });

  it('uses the default payment method', async () => {
    apiRequestMock.mockResolvedValue({});

    await orderService.payOrder(18);

    const [path, options] = apiRequestMock.mock.calls[0];
    expect(path).toBe('/api/orders/18/pay');
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({
      payMethod: '\u5fae\u4fe1\u652f\u4ed8',
    });
  });

  it('uses a specified payment method', async () => {
    apiRequestMock.mockResolvedValue({});

    await orderService.payOrder(19, 'Alipay');

    expect(apiRequestMock).toHaveBeenCalledWith('/api/orders/19/pay', {
      method: 'PUT',
      body: JSON.stringify({ payMethod: 'Alipay' }),
    });
  });

  it('gets orders without a status filter', async () => {
    apiRequestMock.mockResolvedValue([]);

    await orderService.getOrderList(2);
    await orderService.getOrderList(2, null);

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/api/users/2/orders');
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/api/users/2/orders');
  });

  it('keeps zero and other status filters', async () => {
    apiRequestMock.mockResolvedValue([]);

    await orderService.getOrderList(3, 0);
    await orderService.getOrderList(3, 4);

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      1,
      '/api/users/3/orders?status=0'
    );
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      '/api/users/3/orders?status=4'
    );
  });

  it('gets an order by id', async () => {
    apiRequestMock.mockResolvedValue({ id: 22 });

    await expect(orderService.getOrderById(22)).resolves.toEqual({ id: 22 });
    expect(apiRequestMock).toHaveBeenCalledWith('/api/orders/22');
  });

  it('propagates API request errors', async () => {
    const error = new Error('request failed');
    apiRequestMock.mockRejectedValue(error);

    await expect(orderService.getOrderById(99)).rejects.toBe(error);
  });
});
