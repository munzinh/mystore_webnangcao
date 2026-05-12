import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const IconSearch = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>;
const IconTag    = () => <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>;
const IconEdit   = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>;
const IconEye    = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconEyeOff = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>;
const IconTrash  = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>;
const IconTrashLg= () => <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>;

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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
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
                    <div className="mb-3 text-gray-300"><IconTag /></div>
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
                                {editTarget ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
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
                            <div className="mb-3"><IconTrashLg /></div>
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
            <button onClick={() => onEdit(brand)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Sửa"><IconEdit /></button>
            <button onClick={() => onToggle(brand)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition" title={brand.isActive ? 'Ẩn' : 'Hiện'}>
                {brand.isActive ? <IconEye /> : <IconEyeOff />}
            </button>
            <button onClick={() => onDelete(brand)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Xóa"><IconTrash /></button>
        </div>
    </div>
);

export default ManageBrands;
