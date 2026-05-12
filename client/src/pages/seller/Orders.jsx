import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const IconRefresh = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>;
const IconDoc     = () => <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>;

const Orders = () => {
    const { axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bộ lọc
    const [search, setSearch] = useState('');
    const [filterPayment, setFilterPayment] = useState('');  // '' | 'COD' | 'Online'
    const [filterPaid, setFilterPaid] = useState('');        // '' | 'paid' | 'unpaid'
    const [sortOrder, setSortOrder] = useState('newest');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/order/seller');
            if (data.success) {
                setOrders(data.orders);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Lấy địa chỉ đúng field — hỗ trợ cả shippingAddress (mới) và address (cũ)
    const getAddress = (order) => {
        const s = order.shippingAddress;
        const a = order.address;
        if (s && (s.name || s.phone || s.street)) return s;
        if (!a) return null;
        // Fallback cho data cũ lưu dạng object
        return {
            name: `${a.firstName || a.firstname || ''} ${a.lastName || a.lastname || ''}`.trim() || a.name || '',
            phone: a.phone || '',
            street: a.street || '',
            city: a.city || '',
            state: a.state || '',
            zipcode: a.zipcode || '',
            country: a.country || '',
        };
    };

    // Thống kê
    const stats = useMemo(() => {
        const total = orders.length;
        const paid = orders.filter(o => o.isPaid).length;
        const revenue = orders.filter(o => o.isPaid).reduce((s, o) => s + o.amount, 0);
        const cod = orders.filter(o => o.paymentType === 'COD').length;
        return { total, paid, revenue, cod };
    }, [orders]);

    // Lọc + Tìm kiếm
    const filtered = useMemo(() => {
        return orders
            .filter(order => {
                const addr = getAddress(order);
                const customerName = addr?.name?.toLowerCase() || '';
                const productNames = order.items?.map(i => i.product?.name?.toLowerCase() || '').join(' ') || '';
                const q = search.toLowerCase();
                const matchSearch = !q || customerName.includes(q) || productNames.includes(q);
                const matchPayment = !filterPayment || order.paymentType === filterPayment;
                const matchPaid = !filterPaid
                    || (filterPaid === 'paid' && order.isPaid)
                    || (filterPaid === 'unpaid' && !order.isPaid);
                return matchSearch && matchPayment && matchPaid;
            })
            .sort((a, b) => sortOrder === 'newest'
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt));
    }, [orders, search, filterPayment, filterPaid, sortOrder]);

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Tiêu đề */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">Quản lý đơn hàng</h1>
                <p className="text-sm text-gray-500 mt-0.5">Xem và theo dõi tất cả đơn hàng của cửa hàng</p>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng đơn</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đã thanh toán</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đơn COD</p>
                    <p className="text-2xl font-bold text-orange-500 mt-1">{stats.cod}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Doanh thu</p>
                    <p className="text-lg font-bold text-[#d70018] mt-1">{formatCurrency(stats.revenue)}</p>
                </div>
            </div>

            {/* Bộ lọc & Tìm kiếm */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo tên khách hoặc sản phẩm..."
                        className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                    <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                        <option value="">Tất cả phương thức</option>
                        <option value="COD">COD</option>
                        <option value="Online">Thanh toán Online</option>
                    </select>
                    <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                        <option value="">Tất cả trạng thái</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="unpaid">Chưa thanh toán</option>
                    </select>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                        <option value="newest">Mới nhất trước</option>
                        <option value="oldest">Cũ nhất trước</option>
                    </select>
                    <button onClick={fetchOrders}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        <IconRefresh />
                        Làm mới
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Hiển thị {filtered.length} / {orders.length} đơn hàng
                </p>
            </div>

            {/* Danh sách đơn hàng */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="mb-3 text-gray-300"><IconDoc /></div>
                    <p className="font-medium">Không có đơn hàng nào</p>
                    <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order, index) => {
                        const addr = getAddress(order);
                        return (
                            <div key={order._id || index}
                                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                                {/* Header row */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400">
                                            #{String(order._id).slice(-8).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                            order.paymentType === 'COD'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.paymentType === 'COD' ? 'COD' : 'Online'}
                                        </span>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                            order.isPaid
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {order.isPaid ? 'Đã thanh toán' : 'Chưa TT'}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex flex-col md:flex-row gap-4 px-5 py-4">
                                    {/* Sản phẩm */}
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sản phẩm</p>
                                        <div className="space-y-1">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    {item.product?.image?.[0] && (
                                                        <img src={item.product.image[0]} alt=""
                                                            className="w-8 h-8 object-cover rounded border border-gray-100" />
                                                    )}
                                                    <p className="text-sm text-gray-700">
                                                        {item.product?.name || 'Sản phẩm đã bị xóa'}
                                                        <span className="text-gray-400 ml-1">x{item.quantity}</span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Địa chỉ */}
                                    <div className="md:w-52">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Giao đến</p>
                                        {addr ? (
                                            <div className="text-sm text-gray-600 space-y-0.5">
                                                <p className="font-medium text-gray-800">{addr.name || '—'}</p>
                                                <p>{addr.phone || ''}</p>
                                                {addr.street && <p className="text-xs text-gray-500">{addr.street}{addr.city ? `, ${addr.city}` : ''}</p>}
                                                {addr.state && <p className="text-xs text-gray-500">{addr.state}{addr.country ? `, ${addr.country}` : ''}</p>}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Không có địa chỉ</p>
                                        )}
                                    </div>

                                    {/* Tổng tiền */}
                                    <div className="md:w-36 text-right">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tổng tiền</p>
                                        <p className="text-lg font-bold text-[#d70018]">{formatCurrency(order.amount)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;