import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock('../../src/services/apiClient.js', () => ({
  apiRequest: apiRequestMock,
}));

import cartService from '../../src/services/cartService.js';

describe('cartService', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('gets the cart for the default or specified user', async () => {
    apiRequestMock.mockResolvedValue([]);

    await cartService.getCartList();
    await cartService.getCartList(8);

    expect(apiRequestMock).toHaveBeenNthCalledWith(1, '/api/users/1/cart');
    expect(apiRequestMock).toHaveBeenNthCalledWith(2, '/api/users/8/cart');
  });

  it('adds an item using primary fields', async () => {
    const item = {
      goodId: 12,
      cartKey: '12-large',
      sku: 'large',
      quantity: 3,
      selected: false,
    };
    apiRequestMock.mockResolvedValue(item);

    await cartService.addItem(item, 2);

    expect(apiRequestMock).toHaveBeenCalledWith('/api/users/2/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  });

  it('supports fallback item fields and default quantity', async () => {
    apiRequestMock.mockResolvedValue({});

    await cartService.addItem({ id: 5, count: 2 });
    await cartService.addItem({ id: 6 });

    expect(JSON.parse(apiRequestMock.mock.calls[0][1].body)).toEqual({
      goodId: 5,
      quantity: 2,
    });
    expect(JSON.parse(apiRequestMock.mock.calls[1][1].body)).toEqual({
      goodId: 6,
      quantity: 1,
    });
  });

  it('updates quantity and encodes the cart key', async () => {
    apiRequestMock.mockResolvedValue({});

    await cartService.updateQuantity('12/large size', 4, 3);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/api/users/3/cart/12%2Flarge%20size',
      {
        method: 'PUT',
        body: JSON.stringify({ quantity: 4 }),
      }
    );
  });

  it('removes one encoded cart item', async () => {
    apiRequestMock.mockResolvedValue({});

    await cartService.removeItem('12/large size');

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/api/users/1/cart/12%2Flarge%20size',
      { method: 'DELETE' }
    );
  });

  it('removes multiple cart items', async () => {
    apiRequestMock.mockResolvedValue({});
    const cartKeys = ['1-red', '2-blue'];

    await cartService.removeItems(cartKeys, 7);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/api/users/7/cart/remove-batch',
      {
        method: 'POST',
        body: JSON.stringify({ cartKeys }),
      }
    );
  });

  it('sets one item selection or all item selections', async () => {
    apiRequestMock.mockResolvedValue({});

    await cartService.setSelected('1-red', true, 4);
    await cartService.setAllSelected(false, 4);

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      1,
      '/api/users/4/cart/selection',
      {
        method: 'PUT',
        body: JSON.stringify({ cartKey: '1-red', selected: true }),
      }
    );
    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      '/api/users/4/cart/selection',
      {
        method: 'PUT',
        body: JSON.stringify({ selected: false }),
      }
    );
  });

  it('returns only selected items', async () => {
    apiRequestMock.mockResolvedValue([
      { cartKey: '1', selected: true },
      { cartKey: '2', selected: false },
      { cartKey: '3', selected: true },
    ]);

    await expect(cartService.getSelectedItems(6)).resolves.toEqual([
      { cartKey: '1', selected: true },
      { cartKey: '3', selected: true },
    ]);
    expect(apiRequestMock).toHaveBeenCalledWith('/api/users/6/cart');
  });

  it('sums quantities and handles an empty cart', async () => {
    apiRequestMock
      .mockResolvedValueOnce([{ quantity: 2 }, { quantity: 3 }])
      .mockResolvedValueOnce([]);

    await expect(cartService.getCartCount()).resolves.toBe(5);
    await expect(cartService.getCartCount()).resolves.toBe(0);
  });

  it('propagates API request errors', async () => {
    const error = new Error('request failed');
    apiRequestMock.mockRejectedValue(error);

    await expect(cartService.getCartList()).rejects.toBe(error);
  });
});
