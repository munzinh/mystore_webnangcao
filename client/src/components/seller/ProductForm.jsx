import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';

// ─── Tạo hàng variant rỗng ───────────────────────────────────────────────────
const emptyVariant = () => ({ attributes: {}, variantLabel: '', price: '', offerPrice: '', inStock: 0 });

// ─── Helper: tự ghép label từ attributes ────────────────────────────────────
const autoLabel = (attrs) => Object.values(attrs).filter(Boolean).join(' - ');

// ─── Gợi ý attribute keys theo category ─────────────────────────────────────
const ATTR_SUGGESTIONS = {
    'mobile':    ['Màu sắc', 'ROM'],
    'tablet':    ['Màu sắc', 'ROM'],
    'laptop':    ['RAM', 'SSD', 'Màu sắc'],
    'monitor':   ['Kích thước', 'Tần số làm mới'],
    'headphone': ['Màu sắc'],
    'accessory': ['Màu sắc', 'Size'],
    'default':   ['Màu sắc', 'Dung lượng'],
};

const getSuggestions = (category) =>
    ATTR_SUGGESTIONS[category?.toLowerCase()] || ATTR_SUGGESTIONS['default'];

// ─────────────────────────────────────────────────────────────────────────────
const ProductForm = ({ initialData, onSubmit, loading, onCancel }) => {
    const [files,     setFiles]     = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    const [name,        setName]        = useState('');
    const [description, setDescription] = useState('');
    const [category,    setCategory]    = useState('');
    const [brand,       setBrand]       = useState('');

    // Tags chip
    const [tags,     setTags]     = useState([]);
    const [tagInput, setTagInput] = useState('');

    const addTag = (raw) => {
        const t = raw.trim().toLowerCase();
        if (t && !tags.includes(t)) setTags(p => [...p, t]);
        setTagInput('');
    };
    const removeTag = (t) => setTags(p => p.filter(x => x !== t));
    const handleTagKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
        else if (e.key === 'Backspace' && tagInput === '' && tags.length) setTags(p => p.slice(0, -1));
    };

    // Category dynamic
    const [allCategories,    setAllCategories]    = useState(categories.map(c => c.name || c.path));
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [showNewCategory,  setShowNewCategory]  = useState(false);

    // Variants
    const [variants, setVariants] = useState([emptyVariant()]);

    const addVariant    = () => setVariants(p => [...p, emptyVariant()]);
    const removeVariant = (idx) => { if (variants.length > 1) setVariants(p => p.filter((_, i) => i !== idx)); };

    const updateVariant = (idx, field, value) =>
        setVariants(p => p.map((v, i) => i === idx ? { ...v, [field]: value } : v));

    // Cập nhật 1 attribute key-value trong variant
    const updateAttr = (varIdx, key, value) => {
        setVariants(p => p.map((v, i) => {
            if (i !== varIdx) return v;
            const newAttrs = { ...v.attributes, [key]: value };
            // Tự cập nhật variantLabel nếu seller chưa tự nhập
            const currentLabel = v.variantLabel;
            const wasAuto = !currentLabel || currentLabel === autoLabel(v.attributes);
            return { ...v, attributes: newAttrs, variantLabel: wasAuto ? autoLabel(newAttrs) : currentLabel };
        }));
    };

    // Thêm/đổi tên attribute key
    const renameAttrKey = (varIdx, oldKey, newKey) => {
        setVariants(p => p.map((v, i) => {
            if (i !== varIdx) return v;
            const newAttrs = {};
            Object.entries(v.attributes).forEach(([k, val]) => { newAttrs[k === oldKey ? newKey : k] = val; });
            return { ...v, attributes: newAttrs, variantLabel: autoLabel(newAttrs) };
        }));
    };

    const addAttrToVariant = (varIdx, key) => {
        setVariants(p => p.map((v, i) => {
            if (i !== varIdx || (key in v.attributes)) return v;
            return { ...v, attributes: { ...v.attributes, [key]: '' } };
        }));
    };

    const removeAttr = (varIdx, key) => {
        setVariants(p => p.map((v, i) => {
            if (i !== varIdx) return v;
            const { [key]: _, ...rest } = v.attributes;
            return { ...v, attributes: rest, variantLabel: autoLabel(rest) };
        }));
    };

    // Bulk: áp dụng cùng attribute keys cho tất cả variants
    const applyKeysToAll = (keys) => {
        setVariants(p => p.map(v => {
            const newAttrs = {};
            keys.forEach(k => { newAttrs[k] = v.attributes[k] || ''; });
            return { ...v, attributes: newAttrs, variantLabel: autoLabel(newAttrs) };
        }));
    };

    // Gợi ý keys của category hiện tại
    const suggestions = getSuggestions(category);

    // Load initialData (edit mode)
    useEffect(() => {
        if (!initialData) return;
        setName(initialData.name || '');
        setDescription(Array.isArray(initialData.description) ? initialData.description.join('\n') : (initialData.description || ''));
        setCategory(initialData.category || '');
        setBrand(initialData.brand || '');
        setTags(Array.isArray(initialData.tags) ? initialData.tags : []);
        if (initialData.image) setImageUrls(initialData.image);

        if (initialData.variants?.length > 0) {
            setVariants(initialData.variants.map(v => ({
                attributes:   v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {}),
                variantLabel: v.variantLabel || autoLabel(v.attributes || {}),
                price:        v.price       ?? '',
                offerPrice:   v.offerPrice  ?? '',
                inStock:      v.inStock     ?? 0,
            })));
        } else {
            // Legacy: data cũ dùng color + storage
            const legacyAttrs = {};
            if (initialData.color)   legacyAttrs['Màu sắc'] = initialData.color;
            if (initialData.storage) legacyAttrs['ROM']      = initialData.storage;
            setVariants([{
                attributes:   legacyAttrs,
                variantLabel: autoLabel(legacyAttrs),
                price:        initialData.price      || '',
                offerPrice:   initialData.offerPrice || '',
                inStock:      typeof initialData.inStock === 'number' ? initialData.inStock : 0,
            }]);
        }
    }, [initialData]);

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.price || !v.offerPrice) {
                alert(`Biến thể ${i + 1}: Vui lòng nhập đầy đủ giá gốc và giá ưu đãi.`);
                return;
            }
        }

        const parsedVariants = variants.map(v => ({
            attributes:   v.attributes,
            variantLabel: v.variantLabel || autoLabel(v.attributes),
            price:        Number(v.price),
            offerPrice:   Number(v.offerPrice),
            inStock:      Number(v.inStock || 0),
        }));

        const prices      = parsedVariants.map(v => v.price);
        const offerPrices = parsedVariants.map(v => v.offerPrice);

        const productData = {
            name,
            description: description.split('\n').filter(l => l.trim() !== ''),
            category,
            brand,
            tags,
            price:      Math.min(...prices),
            offerPrice: Math.min(...offerPrices),
            inStock:    parsedVariants.reduce((s, v) => s + v.inStock, 0) > 0,
            variants:   parsedVariants,
        };

        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData));
        for (let i = 0; i < files.length; i++) {
            if (files[i]) formData.append('images', files[i]);
        }
        if (initialData?._id) formData.append('id', initialData._id);
        onSubmit(formData);
    };

    // Preview min price
    const filledVariants = variants.filter(v => v.offerPrice);
    const minOfferPrice  = filledVariants.length ? Math.min(...filledVariants.map(v => Number(v.offerPrice))) : 0;
    const totalStock     = variants.reduce((s, v) => s + Number(v.inStock || 0), 0);

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">

            {/* ── Hình ảnh ── */}
            <div>
                <p className="text-base font-medium mb-2">Hình ảnh sản phẩm</p>
                <div className="flex flex-wrap gap-3">
                    {Array(4).fill('').map((_, idx) => (
                        <label key={idx} htmlFor={`img-${idx}`}>
                            <input onChange={e => { const u = [...files]; u[idx] = e.target.files[0]; setFiles(u); }}
                                accept="image/*" type="file" id={`img-${idx}`} hidden />
                            <img className="w-24 h-24 object-cover border border-gray-300 rounded cursor-pointer"
                                src={files[idx] ? URL.createObjectURL(files[idx]) : (imageUrls[idx] || assets.upload_area)}
                                alt="upload" />
                        </label>
                    ))}
                </div>
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mt-2 inline-block">
                    💡 <strong>Lưu ý thứ tự ảnh:</strong> Ảnh 1 → Biến thể 1, Ảnh 2 → Biến thể 2, ...
                    Upload ảnh đúng thứ tự để khách hàng thấy đúng ảnh khi chọn phiên bản.
                </p>
            </div>


            {/* ── Tên + Danh mục + Brand + Tags ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="pname">Tên sản phẩm *</label>
                    <input id="pname" type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="VD: Samsung Galaxy S25 Ultra"
                        className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="cat">Danh mục *</label>
                    <div className="flex gap-2">
                        <select id="cat" value={category} onChange={e => setCategory(e.target.value)}
                            className="flex-1 outline-none py-2 px-3 rounded border border-gray-500/40" required>
                            <option value="">Chọn danh mục</option>
                            {allCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                        <button type="button" onClick={() => setShowNewCategory(s => !s)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition">
                            + Mới</button>
                    </div>
                    {showNewCategory && (
                        <div className="flex gap-2 mt-1">
                            <input type="text" value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)}
                                placeholder="Tên danh mục mới..."
                                className="flex-1 outline-none py-2 px-3 rounded border border-blue-400 text-sm"
                                onKeyDown={e => {
                                    if (e.key !== 'Enter') return; e.preventDefault();
                                    const t = newCategoryInput.trim();
                                    if (t && !allCategories.includes(t)) setAllCategories(p => [...p, t]);
                                    if (t) setCategory(t);
                                    setNewCategoryInput(''); setShowNewCategory(false);
                                }} />
                            <button type="button" onClick={() => {
                                const t = newCategoryInput.trim();
                                if (t && !allCategories.includes(t)) setAllCategories(p => [...p, t]);
                                if (t) setCategory(t);
                                setNewCategoryInput(''); setShowNewCategory(false);
                            }} className="px-3 py-2 bg-blue-600 text-white text-sm rounded">Thêm</button>
                            <button type="button" onClick={() => setShowNewCategory(false)}
                                className="px-3 py-2 bg-gray-200 text-sm rounded">Hủy</button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="brand">Thương hiệu *</label>
                    <input id="brand" type="text" value={brand} onChange={e => setBrand(e.target.value)}
                        placeholder="VD: Samsung, Apple, Dell..."
                        className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Tags (AI gợi ý)</label>
                    <div className="flex flex-wrap gap-1.5 py-2 px-3 rounded border border-gray-500/40 min-h-[42px] cursor-text"
                        onClick={() => document.getElementById('tag-input').focus()}>
                        {tags.map(t => (
                            <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                {t}<button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">×</button>
                            </span>
                        ))}
                        <input id="tag-input" type="text" value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKey}
                            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                            placeholder={tags.length === 0 ? 'Gõ + Enter (VD: 5g, gaming)...' : ''}
                            className="outline-none flex-1 text-sm min-w-[120px] bg-transparent" />
                    </div>
                </div>
            </div>

            {/* ── Mô tả ── */}
            <div className="flex flex-col gap-1">
                <label className="text-base font-medium" htmlFor="desc">Mô tả sản phẩm</label>
                <textarea id="desc" rows={4} value={description} onChange={e => setDescription(e.target.value)}
                    className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-none"
                    placeholder="Mỗi dòng 1 đặc điểm..." />
            </div>

            {/* ── Variants ── */}
            <div>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <p className="text-base font-medium">
                            Biến thể sản phẩm <span className="text-red-500">*</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Thêm từng phiên bản (màu, ROM, RAM…). Mỗi biến thể có giá và kho riêng.
                        </p>

                        {/* Gợi ý attribute keys theo category */}
                        {category && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="text-xs text-gray-500 mr-1">Gợi ý cho {category}:</span>
                                {suggestions.map(key => (
                                    <button key={key} type="button"
                                        onClick={() => applyKeysToAll([...new Set([...Object.keys(variants[0].attributes), key])])}
                                        className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition">
                                        + {key}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={addVariant}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition ml-4 shrink-0">
                        <span className="text-lg leading-none">+</span> Thêm biến thể
                    </button>
                </div>

                <div className="space-y-3">
                    {variants.map((v, varIdx) => (
                        <div key={varIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                            {/* Xóa biến thể */}
                            <button type="button" onClick={() => removeVariant(varIdx)}
                                disabled={variants.length === 1}
                                className="absolute top-3 right-3 text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none">×</button>

                            <p className="text-xs font-semibold text-gray-500 mb-3">
                                Biến thể {varIdx + 1}
                                {v.variantLabel && (
                                    <span className="ml-2 text-blue-600 font-normal">— {v.variantLabel}</span>
                                )}
                            </p>

                            {/* Attributes linh hoạt */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {Object.entries(v.attributes).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                                        {/* Tên thuộc tính */}
                                        <input
                                            type="text" value={key}
                                            onChange={e => renameAttrKey(varIdx, key, e.target.value)}
                                            className="outline-none w-24 text-xs text-gray-500 font-medium bg-transparent"
                                            placeholder="Tên (VD: Màu)"
                                        />
                                        <span className="text-gray-300">:</span>
                                        {/* Giá trị */}
                                        <input
                                            type="text" value={val}
                                            onChange={e => updateAttr(varIdx, key, e.target.value)}
                                            className="outline-none w-24 text-xs text-gray-800 bg-transparent"
                                            placeholder="Giá trị"
                                        />
                                        <button type="button" onClick={() => removeAttr(varIdx, key)}
                                            className="text-gray-300 hover:text-red-500 ml-1 leading-none">×</button>
                                    </div>
                                ))}

                                {/* Thêm attribute mới */}
                                <button type="button"
                                    onClick={() => {
                                        const key = `Thuộc tính ${Object.keys(v.attributes).length + 1}`;
                                        addAttrToVariant(varIdx, key);
                                    }}
                                    className="flex items-center gap-1 text-xs px-2 py-1 bg-white border border-dashed border-gray-300 text-gray-400 rounded hover:border-blue-400 hover:text-blue-500 transition">
                                    <span>+</span> Thêm thuộc tính
                                </button>
                            </div>

                            {/* Label hiển thị cho khách */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-500 shrink-0">Hiển thị với khách:</span>
                                <input
                                    type="text" value={v.variantLabel}
                                    onChange={e => updateVariant(varIdx, 'variantLabel', e.target.value)}
                                    className="flex-1 outline-none py-1 px-2 text-sm border border-gray-300 rounded bg-white"
                                    placeholder="VD: Đen - 256GB (tự động từ thuộc tính)"
                                />
                            </div>

                            {/* Giá + Kho */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Giá gốc (₫) *</label>
                                    <input type="number" min="0" value={v.price}
                                        onChange={e => updateVariant(varIdx, 'price', e.target.value)}
                                        className="w-full outline-none py-1.5 px-2 border border-gray-300 rounded text-sm bg-white" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Giá ưu đãi (₫) *</label>
                                    <input type="number" min="0" value={v.offerPrice}
                                        onChange={e => updateVariant(varIdx, 'offerPrice', e.target.value)}
                                        className="w-full outline-none py-1.5 px-2 border border-gray-300 rounded text-sm bg-white" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Tồn kho</label>
                                    <input type="number" min="0" value={v.inStock}
                                        onChange={e => updateVariant(varIdx, 'inStock', e.target.value)}
                                        className="w-full outline-none py-1.5 px-2 border border-gray-300 rounded text-sm bg-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview tổng */}
                {minOfferPrice > 0 && (
                    <div className="mt-3 text-xs text-gray-500 flex gap-4 bg-blue-50 border border-blue-100 rounded px-3 py-2">
                        <span>💰 Giá hiển thị: <strong className="text-red-600">
                            {variants.length > 1 ? 'Từ ' : ''}
                            {new Intl.NumberFormat('vi-VN').format(minOfferPrice)}₫
                        </strong></span>
                        <span>📦 Tổng tồn kho: <strong>{totalStock}</strong></span>
                        <span>🏷️ {variants.length} biến thể</span>
                    </div>
                )}
            </div>

            {/* ── Submit ── */}
            <div className="flex gap-4 pt-2">
                <button type="submit" disabled={loading}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:bg-gray-400">
                    {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition">
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;
