import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets, dummyOrders } from '../../assets/assets'

const Orders = () => {

    const { curency, axios } = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {
            const {data} = await axios.get('/api/order/seller');
            if(data.success){
                setOrders(data.orders);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className='flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Danh sách đơn hàng</h2>
                {orders.map((order, index) => (
                    <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300"
                    >
                        {/* Sản phẩm */}
                        <div className="flex gap-5 max-w-80">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex flex-col justify-center">
                                        <p className="font-medium">
                                            {item.product.name} 
                                            <span className="text-primary"> x {item.quantity}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="text-sm md:text-base text-black/60">
                            <p className='text-black/80'>{order.address.firstName} {order.address.lastName}</p>
                            <p>{order.address.street}, {order.address.city}</p> 
                            <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                            <p>{order.address.phone}</p>
                        </div>

                        {/* Tổng tiền */}
                        <p className="font-medium text-base text-center md:text-left">
                            {formatCurrency(order.amount)}
                        </p>

                        {/* Thông tin thanh toán */}
                        <div className="flex flex-col text-sm text-black/60">
                            <p>Phương thức: {order.paymentType}</p>
                            <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p>Thanh toán: {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders;