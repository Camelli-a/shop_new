import { apiRequest } from './apiClient';

class CartService {
  getCartList(userId = 1) {
    return apiRequest(`/api/users/${userId}/cart`);
  }

  addItem(item, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart`, {
      method: 'POST',
      body: JSON.stringify({
        goodId: item.goodId ?? item.id,
        cartKey: item.cartKey,
        sku: item.sku,
        quantity: item.quantity ?? item.count ?? 1,
        selected: item.selected,
      }),
    });
  }

  updateQuantity(cartKey, quantity, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart/${encodeURIComponent(cartKey)}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  removeItem(cartKey, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart/${encodeURIComponent(cartKey)}`, {
      method: 'DELETE',
    });
  }

  removeItems(cartKeys, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart/remove-batch`, {
      method: 'POST',
      body: JSON.stringify({ cartKeys }),
    });
  }

  setSelected(cartKey, selected, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart/selection`, {
      method: 'PUT',
      body: JSON.stringify({ cartKey, selected }),
    });
  }

  setAllSelected(selected, userId = 1) {
    return apiRequest(`/api/users/${userId}/cart/selection`, {
      method: 'PUT',
      body: JSON.stringify({ selected }),
    });
  }

  async getSelectedItems(userId = 1) {
    const list = await this.getCartList(userId);
    return list.filter(item => item.selected);
  }

  async getCartCount(userId = 1) {
    const list = await this.getCartList(userId);
    return list.reduce((total, item) => total + item.quantity, 0);
  }
}

const cartService = new CartService();
export default cartService;
