export const ORDER_STATUS = {
  unpaid: 0,
  paid: 1,
  shipped: 2,
  received: 3,
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.unpaid]: '未支付',
  [ORDER_STATUS.paid]: '已支付',
  [ORDER_STATUS.shipped]: '已发货',
  [ORDER_STATUS.received]: '已收货',
};
