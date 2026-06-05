import { ORDER_STATUS } from '../constants/orderStatus';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { mockOrders } from '../mocks';

const cloneOrders = () => mockOrders.map(item => ({ ...item }));

class OrderService {
  list = [];

  constructor() {
    this._loadData();
  }

  createOrder(userId, goodId, price) {
    const orderNo = new Date().getTime();
    const maxId = this.list.reduce((max, item) => {
      return item.id > max ? item.id : max;
    }, 0);

    const order = {
      id: maxId + 1,
      userId,
      goodId,
      orderNo,
      createTime: new Date().toLocaleString(),
      status: ORDER_STATUS.unpaid,
      price,
    };
    this.list.push(order);
    this._saveData();
    return order;
  }

  payOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order) {
      return false;
    }

    order.status = ORDER_STATUS.paid;
    order.payTime = new Date().toLocaleString();
    this._saveData();
    return true;
  }

  getOrderById(orderId) {
    return this.list.find(item => item.id === orderId);
  }

  _saveData() {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(this.list));
  }

  _loadData() {
    const list = localStorage.getItem(STORAGE_KEYS.orders);
    if (!list) {
      this._resetToMockData();
      return;
    }

    try {
      const parsedList = JSON.parse(list);
      this.list = Array.isArray(parsedList) ? parsedList : cloneOrders();
    } catch {
      this._resetToMockData();
    }
  }

  _resetToMockData() {
    this.list = cloneOrders();
    this._saveData();
  }
}

const orderService = new OrderService();
export default orderService;
