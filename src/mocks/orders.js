import { ORDER_STATUS } from '../constants/orderStatus';

export const mockOrders = [
  {
    id: 1,
    userId: 1,
    orderNo: '201801010001',
    createTime: '2018-01-01 00:00:00',
    payTime: '2018-01-01 00:00:00',
    status: ORDER_STATUS.paid,
    price: 100,
    goodId: 1,
  },
];
