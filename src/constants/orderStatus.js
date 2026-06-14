export const ORDER_STATUS = {
  unpaid: 0,
  paid: 1,
  shipped: 2,
  received: 3,
  cancelled: 4,
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.unpaid]: '未支付',
  [ORDER_STATUS.paid]: '已支付',
  [ORDER_STATUS.shipped]: '已发货',
  [ORDER_STATUS.received]: '已收货',
  [ORDER_STATUS.cancelled]: '已取消',
};

export const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

export const getPaymentDeadline = order => {
  const expiresAt = new Date(order?.expiresAt).getTime();
  if (Number.isFinite(expiresAt)) return expiresAt;

  const createTime = new Date(order?.createTime).getTime();
  return Number.isFinite(createTime) ? createTime + PAYMENT_WINDOW_MS : Date.now();
};

export const getPaymentRemainingSeconds = order => Math.max(
  0,
  Math.ceil((getPaymentDeadline(order) - Date.now()) / 1000)
);

export const formatPaymentCountdown = seconds => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};
