import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { dummyOrders } from '../assets/assets';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency } = useAppContext();

  const fetchMyOrders = async () => {
    setMyOrders(dummyOrders);
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="mt-16 pb-16 px-4 max-w-[1280px] mx-auto">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">Đơn hàng của tôi</p>
        <div className="w-16 h-0.5 bg-red rounded-full"></div>
      </div>

      {myOrders.map((order, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-lg p-4 py-5 mb-10"
        >
          <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col gap-2">
            <span>OrderId: {order._id}</span>
            <span>Thanh toán: {order.paymentType}</span>
            <span>Tổng tiền: {formatCurrency(order.amount)}</span>
          </p>

          {order.items.map((item, idx) => (
            <div
              key={idx}
              className={`relative bg-white text-gray-500/70 ${
                order.items.length !== idx + 1 ? 'border-b' : ''
              } border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full`}
            >
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <img
                    src={item.product.image[0]}
                    alt=""
                    className="w-16 h-16 object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-800">
                    {item.product.name}
                  </h2>
                  <p>Loại: {item.product.category}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                <p>Số lượng: {item.quantity || '1'}</p>
                <p>Trạng thái: {order.status}</p>
                <p>Ngày: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>

              <p className="text-primary text-lg font-medium">
                Amount: {formatCurrency(item.product.offerPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;