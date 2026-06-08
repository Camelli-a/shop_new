import { apiRequest } from './apiClient';

class OrderService {
  createOrder(userId, items, receiverInfo = {}) {
    return apiRequest(`/api/users/${userId}/orders`, {
      method: 'POST',
      body: JSON.stringify({
        items: items.map(item => ({
          cartKey: item.cartKey,
          goodId: item.goodId ?? item.id,
          sku: item.sku,
          quantity: item.quantity ?? item.count ?? 1,
        })),
        ...receiverInfo,
      }),
    });
  }

  payOrder(orderId, payMethod = '微信支付') {
    return apiRequest(`/api/orders/${orderId}/pay`, {
      method: 'PUT',
      body: JSON.stringify({ payMethod }),
    });
  }

  getOrderList(userId, status) {
    const params = new URLSearchParams();
    if (status !== undefined && status !== null) params.set('status', status);
    const query = params.toString();
    return apiRequest(`/api/users/${userId}/orders${query ? `?${query}` : ''}`);
  }

  getOrderById(orderId) {
    return apiRequest(`/api/orders/${orderId}`);
  }
}

const orderService = new OrderService();
export default orderService;
