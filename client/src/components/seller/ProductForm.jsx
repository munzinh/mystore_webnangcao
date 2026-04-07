import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';

// ─── Default empty variant row ───────────────────────────────────────────────
const emptyVariant = () => ({ color: '', storage: '', price: '', offerPrice: '', inStock: 0 });

const ProductForm = ({ initialData, onSubmit, loading, onCancel }) => {
    // ── Images ────────────────────────────────────────────────────────────────
    const [files, setFiles]         = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    // ── Core fields ───────────────────────────────────────────────────────────
    const [name,        setName]        = useState('');
    const [description, setDescription] = useState('');
    const [category,    setCategory]    = useState('');
    const [brand,       setBrand]       = useState('');

    // ── Tags (chip input) ─────────────────────────────────────────────────────
    const [tags,       setTags]       = useState([]);   // array of strings
    const [tagInput,   setTagInput]   = useState('');

    const addTag = (raw) => {
        const t = raw.trim().toLowerCase();
        if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
        setTagInput('');
    };
    const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
            setTags(prev => prev.slice(0, -1));
        }
    };

    // ── Category dynamic ─────────────────────────────────────────────────────
    const [allCategories,    setAllCategories]    = useState(categories.map(c => c.name || c.path));
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [showNewCategory,  setShowNewCategory]  = useState(false);

    // ── Variants (bắt buộc ≥ 1) ──────────────────────────────────────────────
    const [variants, setVariants] = useState([emptyVariant()]);

    const addVariant    = () => setVariants(prev => [...prev, emptyVariant()]);
    const removeVariant = (idx) => {
        if (variants.length === 1) return; // keep at least 1
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };
    const updateVariant = (idx, field, value) => {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
    };

    // ── Load initialData (edit mode) ─────────────────────────────────────────
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(
                Array.isArray(initialData.description)
                    ? initialData.description.join('\n')
                    : (initialData.description || '')
            );
            setCategory(initialData.category || '');
            setBrand(initialData.brand || '');
            setTags(Array.isArray(initialData.tags) ? initialData.tags : []);
            if (initialData.image) setImageUrls(initialData.image);
            if (initialData.variants && initialData.variants.length > 0) {
                setVariants(initialData.variants.map(v => ({
                    color:      v.color      || '',
                    storage:    v.storage    || '',
                    price:      v.price      ?? '',
                    offerPrice: v.offerPrice ?? '',
                    inStock:    v.inStock    ?? 0,
                })));
            } else {
                // Legacy product — pre-fill 1 variant from global price
                setVariants([{
                    color:      '',
                    storage:    '',
                    price:      initialData.price      || '',
                    offerPrice: initialData.offerPrice || '',
                    inStock:    typeof initialData.inStock === 'number' ? initialData.inStock : 0,
                }]);
            }
        }
    }, [initialData]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate variants
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.price || !v.offerPrice) {
                alert(`Biến thể ${i + 1}: Vui lòng nhập đầy đủ giá gốc và giá ưu đãi.`);
                return;
            }
        }

        // Tính giá/tồn kho global từ variants (lấy giá thấp nhất)
        const prices      = variants.map(v => Number(v.price));
        const offerPrices = variants.map(v => Number(v.offerPrice));
        const globalPrice      = Math.min(...prices);
        const globalOfferPrice = Math.min(...offerPrices);
        const totalStock       = variants.reduce((s, v) => s + Number(v.inStock || 0), 0);

        const parsedVariants = variants.map(v => ({
            color:      v.color,
            storage:    v.storage,
            price:      Number(v.price),
            offerPrice: Number(v.offerPrice),
            inStock:    Number(v.inStock || 0),
        }));

        const productData = {
            name,
            description: description.split('\n').filter(l => l.trim() !== ''),
            category,
            brand,
            tags,
            price:      globalPrice,
            offerPrice: globalOfferPrice,
            inStock:    totalStock > 0,
            variants:   parsedVariants,
        };

        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData));
        for (let i = 0; i < files.length; i++) {
            if (files[i]) formData.append('images', files[i]);
        }
        if (initialData && initialData._id) {
            formData.append('id', initialData._id);
        }
        onSubmit(formData);
    };

    // ─── UI ──────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">

            {/* ── Hình ảnh ── */}
            <div>
                <p className="text-base font-medium mb-2">Hình ảnh sản phẩm</p>
                <div className="flex flex-wrap items-center gap-3">
                    {Array(4).fill('').map((_, index) => (
                        <label key={index} htmlFor={`image${index}`}>
                            <input
                                onChange={(e) => {
                                    const u = [...files];
                                    u[index] = e.target.files[0];
                                    setFiles(u);
                                }}
                                accept="image/*" type="file" id={`image${index}`} hidden
                            />
                            <img
                                className="max-w-24 cursor-pointer object-cover h-24 border border-gray-300 rounded"
                                src={files[index] ? URL.createObjectURL(files[index]) : (imageUrls[index] || assets.upload_area)}
                                alt="upload"
                            />
                        </label>
                    ))}
                </div>
            </div>

            {/* ── Tên + Danh mục ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-name">Tên sản phẩm *</label>
                    <input
                        id="product-name" type="text" placeholder="VD: Samsung Galaxy S25 Ultra"
                        value={name} onChange={e => setName(e.target.value)}
                        className="outline-none py-2 px-3 rounded border border-gray-500/40" required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Danh mục *</label>
                    <div className="flex gap-2">
                        <select
                            id="category" value={category} onChange={e => setCategory(e.target.value)}
                            className="flex-1 outline-none py-2 px-3 rounded border border-gray-500/40" required
                        >
                            <option value="">Chọn danh mục</option>
                            {allCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                        </select>
                        <button type="button"
                            onClick={() => setShowNewCategory(!showNewCategory)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition whitespace-nowrap"
                        >+ Mới</button>
                    </div>
                    {showNewCategory && (
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text" value={newCategoryInput}
                                onChange={e => setNewCategoryInput(e.target.value)}
                                placeholder="Nhập tên danh mục mới..."
                                className="flex-1 outline-none py-2 px-3 rounded border border-blue-400 text-sm"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const t = newCategoryInput.trim();
                                        if (t && !allCategories.includes(t)) setAllCategories(prev => [...prev, t]);
                                        if (t) setCategory(t);
                                        setNewCategoryInput(''); setShowNewCategory(false);
                                    }
                                }}
                            />
                            <button type="button"
                                onClick={() => {
                                    const t = newCategoryInput.trim();
                                    if (t && !allCategories.includes(t)) setAllCategories(prev => [...prev, t]);
                                    if (t) setCategory(t);
                                    setNewCategoryInput(''); setShowNewCategory(false);
                                }}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                            >Thêm</button>
                            <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryInput(''); }}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded transition"
                            >Hủy</button>
                        </div>
                    )}
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="brand">Thương hiệu *</label>
                    <input
                        id="brand" type="text" placeholder="VD: Samsung, Apple, Dell..."
                        value={brand} onChange={e => setBrand(e.target.value)}
                        className="outline-none py-2 px-3 rounded border border-gray-500/40" required
                    />
                </div>

                {/* Tags chip */}
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Tags (AI gợi ý)</label>
                    <div className="flex flex-wrap gap-1.5 py-2 px-3 rounded border border-gray-500/40 min-h-[42px] cursor-text"
                        onClick={() => document.getElementById('tag-input').focus()}
                    >
                        {tags.map(t => (
                            <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {t}
                                <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500 leading-none">×</button>
                            </span>
                        ))}
                        <input
                            id="tag-input" type="text" value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                            placeholder={tags.length === 0 ? "Gõ tag rồi nhấn Enter (VD: 5g, gaming)..." : ''}
                            className="outline-none flex-1 text-sm min-w-[120px] bg-transparent"
                        />
                    </div>
                    <p className="text-xs text-gray-400">Gõ tag + Enter hoặc dấu phẩy. Ví dụ: 5g, fast-charge, gaming</p>
                </div>
            </div>

            {/* ── Mô tả ── */}
            <div className="flex flex-col gap-1">
                <label className="text-base font-medium" htmlFor="product-description">Mô tả sản phẩm</label>
                <textarea
                    id="product-description" rows={4} value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Mỗi dòng 1 đoạn mô tả..."
                />
            </div>

            {/* ── Variants (bắt buộc) ── */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-base font-medium">Biến thể sản phẩm <span className="text-red-500">*</span></p>
                        <p className="text-xs text-gray-400">Mỗi biến thể là 1 phiên bản khác nhau (màu/bộ nhớ). Cần ít nhất 1 biến thể.</p>
                    </div>
                    <button type="button" onClick={addVariant}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    >
                        <span className="text-lg leading-none">+</span> Thêm biến thể
                    </button>
                </div>

                <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold w-32">Màu sắc</th>
                                <th className="px-3 py-2 text-left font-semibold w-32">Bộ nhớ/Size</th>
                                <th className="px-3 py-2 text-left font-semibold w-36">Giá gốc (₫) *</th>
                                <th className="px-3 py-2 text-left font-semibold w-36">Giá ưu đãi (₫) *</th>
                                <th className="px-3 py-2 text-left font-semibold w-28">Tồn kho</th>
                                <th className="px-3 py-2 text-center font-semibold w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {variants.map((v, idx) => (
                                <tr key={idx} className="bg-white hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <input
                                            type="text" placeholder="VD: Đen, Bạc"
                                            value={v.color}
                                            onChange={e => updateVariant(idx, 'color', e.target.value)}
                                            className="w-full outline-none py-1 px-2 rounded border border-gray-300 text-sm"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text" placeholder="VD: 128GB"
                                            value={v.storage}
                                            onChange={e => updateVariant(idx, 'storage', e.target.value)}
                                            className="w-full outline-none py-1 px-2 rounded border border-gray-300 text-sm"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number" placeholder="0" min="0"
                                            value={v.price}
                                            onChange={e => updateVariant(idx, 'price', e.target.value)}
                                            className="w-full outline-none py-1 px-2 rounded border border-gray-300 text-sm"
                                            required
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number" placeholder="0" min="0"
                                            value={v.offerPrice}
                                            onChange={e => updateVariant(idx, 'offerPrice', e.target.value)}
                                            className="w-full outline-none py-1 px-2 rounded border border-gray-300 text-sm"
                                            required
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number" placeholder="0" min="0"
                                            value={v.inStock}
                                            onChange={e => updateVariant(idx, 'inStock', e.target.value)}
                                            className="w-full outline-none py-1 px-2 rounded border border-gray-300 text-sm"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            disabled={variants.length === 1}
                                            className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                                            title="Xóa biến thể"
                                        >×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary preview */}
                {variants.some(v => v.offerPrice) && (
                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                        <span>💰 Giá hiển thị:&nbsp;
                            <strong className="text-red-600">
                                Từ {new Intl.NumberFormat('vi-VN').format(
                                    Math.min(...variants.filter(v => v.offerPrice).map(v => Number(v.offerPrice)))
                                )}₫
                            </strong>
                        </span>
                        <span>📦 Tổng tồn kho:&nbsp;
                            <strong>{variants.reduce((s, v) => s + Number(v.inStock || 0), 0)}</strong>
                        </span>
                    </div>
                )}
            </div>

            {/* ── Submit ── */}
            <div className="flex gap-4 pt-2">
                <button
                    type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded cursor-pointer disabled:bg-gray-400"
                >
                    {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 transition text-gray-800 font-medium rounded cursor-pointer"
                    >Hủy</button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;
