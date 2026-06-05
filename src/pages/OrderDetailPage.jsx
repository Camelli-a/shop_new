import { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ORDER_STATUS_LABEL } from '../constants/orderStatus';
import { ServiceContext } from '../contexts/ServiceContext';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();

  const parsedOrderId = parseInt(orderId, 10);
  const order = services.order.getOrderById(parsedOrderId);
  if (!order) {
    alert('订单不存在');
    navigate('/home');
    return;
  }

  return (
    <div>
      <h1>OrderDetail Page</h1>
      <p>orderId: {orderId}</p>
      <p>orderNo: {order.orderNo}</p>
      <p>createTime: {order.createTime}</p>
      <p>price: {order.price}</p>
      <p>goodId: {order.goodId}</p>
      <p>status: {ORDER_STATUS_LABEL[order.status] || '未知状态'}</p>
    </div>
  );
}

export default OrderDetailPage;
