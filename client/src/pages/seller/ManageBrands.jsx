import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const emptyForm = { name: '', logo: '', isActive: true };

const ManageBrands = () => {
    const { axios } = useAppContext();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');

    const fetchBrands = async () => {
        setLoading(true);
        try {
            // Get ALL brands (including inactive) for management
            const { data } = await axios.get('/api/brand/list');
            if (data.success) setBrands(data.brands);
        } catch {
            toast.error('Không tải được thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (brand) => {
        setEditTarget(brand);
        setForm({ name: brand.name, logo: brand.logo || '', isActive: brand.isActive });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Vui lòng nhập tên thương hiệu');
        setSubmitting(true);
        try {
            let res;
            if (editTarget) {
                res = await axios.put(`/api/brand/update/${editTarget._id}`, form);
            } else {
                res = await axios.post('/api/brand/add', form);
            }
            if (res.data.success) {
                toast.success(res.data.message);
                setShowModal(false);
                fetchBrands();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (brand) => {
        try {
            const { data } = await axios.delete(`/api/brand/delete/${brand._id}`);
            if (data.success) {
                toast.success('Đã xóa thương hiệu');
                setDeleteConfirm(null);
                fetchBrands();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleActive = async (brand) => {
        try {
            const { data } = await axios.put(`/api/brand/update/${brand._id}`, { ...brand, isActive: !brand.isActive });
            if (data.success) {
                toast.success(`Đã ${!brand.isActive ? 'kích hoạt' : 'ẩn'} thương hiệu`);
                fetchBrands();
            }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = brands.filter(b => b.isActive).length;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Thương hiệu</h1>
                    <p className="text-sm text-gray-500 mt-1">{brands.length} thương hiệu · {activeCount} đang hoạt động</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition">
                    <span className="text-lg">+</span> Thêm thương hiệu
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm thương hiệu..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 bg-white shadow-sm" />
            </div>

            {/* Grid Cards */}
            {loading ? (
                <div className="py-20 text-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Đang tải...
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border">
                    <p className="text-4xl mb-3">🏷️</p>
                    <p>Chưa có thương hiệu nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(brand => (
                        <BrandCard key={brand._id} brand={brand} onEdit={openEdit} onDelete={setDeleteConfirm} onToggle={toggleActive} />
                    ))}
                    {/* Quick Add Card */}
                    <button onClick={openAdd}
                        className="border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 min-h-[140px] hover:border-violet-400 hover:bg-violet-50 transition group">
                        <span className="text-3xl text-violet-300 group-hover:text-violet-500 transition">+</span>
                        <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-600 transition">Thêm mới</span>
                    </button>
                </div>
            )}

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editTarget ? '✏️ Chỉnh sửa thương hiệu' : '➕ Thêm thương hiệu mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Logo Preview */}
                            {form.logo && (
                                <div className="flex justify-center">
                                    <img src={form.logo} alt="logo preview"
                                        className="h-16 w-32 object-contain border border-gray-100 rounded-xl p-2 bg-gray-50"
                                        onError={e => { e.target.style.display = 'none'; }} />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên thương hiệu *</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400"
                                    placeholder="VD: Apple, Samsung..." />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">URL Logo (tùy chọn)</label>
                                <input value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-400 text-sm"
                                    placeholder="https://example.com/logo.png" />
                                <p className="text-xs text-gray-400 mt-1">Nhập URL hình ảnh logo thương hiệu</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-700">Hiển thị thương hiệu</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow transition disabled:opacity-50">
                                    {submitting ? 'Đang lưu...' : editTarget ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="text-5xl mb-3">🗑️</div>
                            <h3 className="text-lg font-bold text-gray-800">Xóa thương hiệu?</h3>
                            <p className="text-gray-500 text-sm mt-1">Bạn chắc chắn muốn xóa <strong>"{deleteConfirm.name}"</strong>?</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Hủy</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BrandCard = ({ brand, onEdit, onDelete, onToggle }) => (
    <div className={`relative bg-white rounded-2xl border shadow-sm flex flex-col items-center p-4 group transition hover:shadow-md ${!brand.isActive ? 'opacity-50' : ''}`}>
        {/* Status dot */}
        <div className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${brand.isActive ? 'bg-green-400' : 'bg-gray-300'}`} title={brand.isActive ? 'Đang hoạt động' : 'Đã ẩn'} />

        {/* Logo or placeholder */}
        <div className="w-16 h-16 flex items-center justify-center mb-3 rounded-xl bg-gray-50 border overflow-hidden">
            {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className={`w-full h-full items-center justify-center text-2xl font-bold text-gray-300 ${brand.logo ? 'hidden' : 'flex'}`}>
                {brand.name[0]?.toUpperCase()}
            </div>
        </div>

        <p className="font-bold text-gray-800 text-sm text-center leading-tight">{brand.name}</p>

        {/* Actions - visible on hover */}
        <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(brand)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition text-xs" title="Sửa">✏️</button>
            <button onClick={() => onToggle(brand)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition text-xs" title={brand.isActive ? 'Ẩn' : 'Hiện'}>
                {brand.isActive ? '👁️' : '🙈'}
            </button>
            <button onClick={() => onDelete(brand)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition text-xs" title="Xóa">🗑️</button>
        </div>
    </div>
);

export default ManageBrands;
