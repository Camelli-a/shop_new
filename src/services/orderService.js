import { ORDER_STATUS } from '../constants/orderStatus';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { mockOrders } from '../mocks';

const cloneOrder = order => ({
  ...order,
  items: order.items?.map(item => ({ ...item })) || [],
});

class OrderService {
  list = [];

  constructor() {
    this._loadData();
  }

  createOrder(userId, items, receiverInfo = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('订单中至少需要一件商品');
    }

    const orderItems = items.map(item => {
      const quantity = Math.max(1, Number(item.quantity ?? item.count ?? 1));
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      return {
        cartKey: item.cartKey,
        goodId: Number(item.goodId ?? item.id),
        name: item.name,
        img: item.img || item.image || '',
        sku: item.sku || '默认规格',
        quantity,
        unitPrice,
        subtotal: Number((unitPrice * quantity).toFixed(2)),
      };
    });
    const now = new Date();
    const maxId = this.list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    const order = {
      id: maxId + 1,
      orderNo: `${now.getTime()}${String(maxId + 1).padStart(3, '0')}`,
      userId: Number(userId),
      items: orderItems,
      totalAmount: Number(
        orderItems.reduce((total, item) => total + item.subtotal, 0).toFixed(2)
      ),
      receiver: receiverInfo.receiver || '',
      receiverPhone: receiverInfo.receiverPhone || '',
      address: receiverInfo.address || '',
      status: ORDER_STATUS.unpaid,
      createTime: now.toLocaleString(),
      payMethod: '',
      payTime: '',
    };

    this.list.unshift(order);
    this._saveData();
    return cloneOrder(order);
  }

  payOrder(orderId, payMethod = '微信支付') {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== ORDER_STATUS.unpaid) {
      return false;
    }

    order.status = ORDER_STATUS.paid;
    order.payMethod = payMethod;
    order.payTime = new Date().toLocaleString();
    this._saveData();
    return true;
  }

  getOrderList(userId, status) {
    return this.list
      .filter(order => Number(order.userId) === Number(userId))
      .filter(order => status === undefined || status === null || order.status === Number(status))
      .map(cloneOrder);
  }

  getOrderById(orderId) {
    return this.list.find(item => Number(item.id) === Number(orderId));
  }

  _normalizeOrder(order) {
    if (Array.isArray(order.items) && order.items.length > 0) {
      const items = order.items.map(item => {
        const quantity = Math.max(1, Number(item.quantity ?? item.count ?? 1));
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return {
          ...item,
          goodId: Number(item.goodId ?? item.id),
          quantity,
          unitPrice,
          subtotal: Number(item.subtotal ?? unitPrice * quantity),
        };
      });
      return {
        ...order,
        userId: Number(order.userId || 1),
        items,
        totalAmount: Number(
          order.totalAmount
          ?? items.reduce((total, item) => total + item.subtotal, 0)
        ),
      };
    }

    const price = Number(order.price || 0);
    return {
      ...order,
      userId: Number(order.userId || 1),
      items: [{
        goodId: Number(order.goodId),
        name: `商品 #${order.goodId}`,
        img: '',
        sku: '默认规格',
        quantity: 1,
        unitPrice: price,
        subtotal: price,
      }],
      totalAmount: price,
      receiver: order.receiver || '',
      receiverPhone: order.receiverPhone || '',
      address: order.address || '',
      payMethod: order.payMethod || '',
      payTime: order.payTime || '',
    };
  }

  _saveData() {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(this.list));
  }

  _loadData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.orders);
      const parsed = data ? JSON.parse(data) : mockOrders;
      this.list = (Array.isArray(parsed) ? parsed : mockOrders)
        .map(order => this._normalizeOrder(order));
    } catch {
      this.list = mockOrders.map(order => this._normalizeOrder(order));
    }
    this._saveData();
  }
}

const orderService = new OrderService();
export default orderService;
