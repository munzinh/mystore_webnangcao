import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const IconSearch  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>;
const IconFolder  = () => <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>;
const IconEdit    = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>;
const IconTrash   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>;
const IconTrashLg = () => <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>;

const SUGGESTED = ['Color', 'Storage', 'RAM', 'CPU', 'Size', 'Connectivity', 'Type', 'Resolution'];

const emptyForm = { name: '', parentId: '', suggestedAttributes: [], isActive: true };

const ManageCategories = () => {
    const { axios } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = add mode
    const [form, setForm] = useState(emptyForm);
    const [attrInput, setAttrInput] = useState('');

    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/category/list');
            if (data.success) setCategories(data.categories);
        } catch {
            toast.error('Không tải được danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setAttrInput('');
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditTarget(cat);
        setForm({
            name: cat.name,
            parentId: cat.parentId?._id || cat.parentId || '',
            suggestedAttributes: cat.suggestedAttributes || [],
            isActive: cat.isActive,
        });
        setAttrInput('');
        setShowModal(true);
    };

    const addAttr = (attr) => {
        const a = (attr || attrInput).trim();
        if (a && !form.suggestedAttributes.includes(a)) {
            setForm(p => ({ ...p, suggestedAttributes: [...p.suggestedAttributes, a] }));
        }
        setAttrInput('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
        setSubmitting(true);
        try {
            const payload = { ...form, parentId: form.parentId || null };
            let res;
            if (editTarget) {
                res = await axios.put(`/api/category/update/${editTarget._id}`, payload);
            } else {
                res = await axios.post('/api/category/add', payload);
            }
            if (res.data.success) {
                toast.success(res.data.message);
                setShowModal(false);
                fetchCategories();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (cat) => {
        try {
            const { data } = await axios.delete(`/api/category/delete/${cat._id}`);
            if (data.success) {
                toast.success('Đã xóa danh mục');
                setDeleteConfirm(null);
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleActive = async (cat) => {
        try {
            const { data } = await axios.put(`/api/category/update/${cat._id}`, { ...cat, isActive: !cat.isActive, parentId: cat.parentId?._id || cat.parentId || null });
            if (data.success) {
                toast.success(`Đã ${!cat.isActive ? 'kích hoạt' : 'ẩn'} danh mục`);
                fetchCategories();
            }
        } catch { toast.error('Có lỗi xảy ra'); }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Group: parents then children
    const roots = filtered.filter(c => !c.parentId);
    const children = filtered.filter(c => c.parentId);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
                    <p className="text-sm text-gray-500 mt-1">{categories.length} danh mục tổng cộng</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition">
                    <span className="text-lg">+</span> Thêm danh mục
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconSearch /></span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Tìm kiếm danh mục..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white shadow-sm" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-gray-400">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Đang tải...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <div className="mb-3 text-gray-300"><IconFolder /></div>
                        <p>Chưa có danh mục nào</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs border-b">
                            <tr>
                                <th className="px-5 py-3 text-left">Tên danh mục</th>
                                <th className="px-5 py-3 text-left">Danh mục cha</th>
                                <th className="px-5 py-3 text-left">Thuộc tính gợi ý</th>
                                <th className="px-5 py-3 text-center">Trạng thái</th>
                                <th className="px-5 py-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {/* Roots first */}
                            {roots.map(cat => <CategoryRow key={cat._id} cat={cat} onEdit={openEdit} onDelete={setDeleteConfirm} onToggle={toggleActive} />)}
                            {/* Children */}
                            {children.map(cat => <CategoryRow key={cat._id} cat={cat} onEdit={openEdit} onDelete={setDeleteConfirm} onToggle={toggleActive} isChild />)}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editTarget ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên danh mục *</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                                    placeholder="VD: Điện thoại" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục cha (để trống nếu là gốc)</label>
                                <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400">
                                    <option value="">-- Không có (danh mục gốc) --</option>
                                    {categories.filter(c => !editTarget || c._id !== editTarget._id).map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Thuộc tính gợi ý cho biến thể</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {SUGGESTED.map(s => (
                                        <button key={s} type="button"
                                            onClick={() => form.suggestedAttributes.includes(s)
                                                ? setForm(p => ({ ...p, suggestedAttributes: p.suggestedAttributes.filter(x => x !== s) }))
                                                : addAttr(s)
                                            }
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition ${form.suggestedAttributes.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={attrInput} onChange={e => setAttrInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttr(); } }}
                                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
                                        placeholder="Thuộc tính khác..." />
                                    <button type="button" onClick={() => addAttr()} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">Thêm</button>
                                </div>
                                {form.suggestedAttributes.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {form.suggestedAttributes.map(a => (
                                            <span key={a} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                {a}
                                                <button type="button" onClick={() => setForm(p => ({ ...p, suggestedAttributes: p.suggestedAttributes.filter(x => x !== a) }))} className="hover:text-red-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition disabled:opacity-50">
                                    {submitting ? 'Đang lưu...' : editTarget ? 'Lưu thay đổi' : 'Tạo danh mục'}
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
                            <h3 className="text-lg font-bold text-gray-800">Xóa danh mục?</h3>
                            <p className="text-gray-500 text-sm mt-1">Bạn chắc chắn muốn xóa <strong>"{deleteConfirm.name}"</strong>? Hành động này không thể hoàn tác.</p>
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

const CategoryRow = ({ cat, onEdit, onDelete, onToggle, isChild }) => (
    <tr className="hover:bg-indigo-50/40 transition">
        <td className="px-5 py-3.5">
            <div className="flex items-center gap-2">
                {isChild && <span className="text-gray-300 text-base">└</span>}
                <span className={`font-semibold ${isChild ? 'text-gray-600 text-xs' : 'text-gray-800'}`}>{cat.name}</span>
            </div>
        </td>
        <td className="px-5 py-3.5 text-gray-500 text-xs">
            {cat.parentId?.name || <span className="text-indigo-400 font-medium">Gốc</span>}
        </td>
        <td className="px-5 py-3.5">
            <div className="flex flex-wrap gap-1">
                {(cat.suggestedAttributes || []).slice(0, 4).map(a => (
                    <span key={a} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{a}</span>
                ))}
                {(cat.suggestedAttributes || []).length > 4 && (
                    <span className="text-gray-400 text-xs">+{cat.suggestedAttributes.length - 4}</span>
                )}
            </div>
        </td>
        <td className="px-5 py-3.5 text-center">
            <button onClick={() => onToggle(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${cat.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {cat.isActive ? '● Hoạt động' : '○ Ẩn'}
            </button>
        </td>
        <td className="px-5 py-3.5">
            <div className="flex items-center justify-center gap-2">
                <button onClick={() => onEdit(cat)} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg transition" title="Sửa"><IconEdit /></button>
                <button onClick={() => onDelete(cat)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Xóa"><IconTrash /></button>
            </div>
        </td>
    </tr>
);

export default ManageCategories;
