import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { products, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/api/order/seller');
                if (data.success) setOrders(data.orders);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const totalRevenue = orders.filter(o => o.isPaid).reduce((s, o) => s + o.amount, 0);
    const paidOrders = orders.filter(o => o.isPaid).length;
    const outOfStock = products.filter(p => !p.inStock).length;
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const statCards = [
        { label: 'Tổng đơn hàng', value: loading ? '...' : orders.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📦' },
        { label: 'Đã thanh toán', value: loading ? '...' : paidOrders, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
        { label: 'Tổng sản phẩm', value: products.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: '🛍️' },
        { label: 'Hết hàng', value: outOfStock, color: outOfStock > 0 ? 'text-red-600' : 'text-gray-400', bg: outOfStock > 0 ? 'bg-red-50' : 'bg-gray-50', icon: '⚠️' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            {/* Tiêu đề */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">Tổng quan cửa hàng</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {statCards.map((s) => (
                    <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.bg}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                            <span className="text-lg">{s.icon}</span>
                        </div>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Doanh thu */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Doanh thu (đã thanh toán)</p>
                <p className="text-3xl font-bold text-[#d70018]">{loading ? '...' : formatCurrency(totalRevenue)}</p>
            </div>

            {/* Đơn hàng gần đây */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Đơn hàng gần đây</h2>
                    <Link to="/seller/orders" className="text-sm text-blue-600 hover:underline">Xem tất cả →</Link>
                </div>
                {loading ? (
                    <div className="p-5 space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p>Chưa có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recentOrders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <p className="text-sm font-mono text-gray-500">
                                        #{String(order._id).slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {order.items?.length} sản phẩm ·{' '}
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {order.isPaid ? 'Đã TT' : 'Chưa TT'}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {formatCurrency(order.amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cảnh báo hết hàng */}
            {outOfStock > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-semibold text-red-700">Có {outOfStock} sản phẩm hết hàng</p>
                        <Link to="/seller/product-list" className="text-sm text-red-600 hover:underline">
                            Vào danh sách sản phẩm để cập nhật tồn kho →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
