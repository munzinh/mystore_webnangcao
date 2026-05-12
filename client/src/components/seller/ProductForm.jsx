import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

/* ─── Helpers ─────────────────────────────────────────────────── */
const uid = () => `SKU-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

const emptyVariant = () => ({
    sku: uid(),
    variantLabel: '',
    attributes: {},
    price: '',
    offerPrice: '',
    inStock: 0,
});

const generateMatrix = (cfg) => {
    const keys = Object.keys(cfg).filter(k => cfg[k]?.length > 0);
    if (!keys.length) return [emptyVariant()];
    let combos = [{}];
    for (const k of keys) {
        const vals = cfg[k];
        combos = combos.flatMap(c => vals.map(v => ({ ...c, [k]: v })));
    }
    return combos.map(attrs => ({
        ...emptyVariant(),
        sku: uid(),
        attributes: attrs,
        variantLabel: Object.values(attrs).join(' / '),
    }));
};

/* ─── SVG Icons (inline, no emoji) ───────────────────────────── */
const IconPlus = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const IconTrash = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const IconImage = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM2.25 12a9.75 9.75 0 109.75-9.75A9.75 9.75 0 002.25 12z" />
    </svg>
);
const IconTag = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);
const IconSave = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const IconX = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const IconZap = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

/* ─── Section Card wrapper ────────────────────────────────────── */
const Card = ({ title, icon, children, accent = 'blue' }) => {
    const accents = {
        blue:   'border-l-blue-500 bg-blue-50/40',
        violet: 'border-l-violet-500 bg-violet-50/40',
        emerald:'border-l-emerald-500 bg-emerald-50/40',
        amber:  'border-l-amber-500 bg-amber-50/40',
    };
    return (
        <div className={`rounded-xl border border-slate-200 border-l-4 ${accents[accent]} bg-white shadow-sm`}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-200/70">
                <span className="text-slate-500">{icon}</span>
                <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
};

/* ─── Label + Input helpers ───────────────────────────────────── */
const Label = ({ children, required }) => (
    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const inputCls = "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder-slate-400 text-slate-800";
const selectCls = "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all text-slate-800 cursor-pointer";

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                 */
/* ═══════════════════════════════════════════════════════════════ */
const ProductForm = ({ initialData, onSubmit, loading, onCancel }) => {
    const { axios } = useAppContext();

    /* ── Remote data ─────────────────────────────────────────── */
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [bRes, cRes] = await Promise.all([
                    axios.get('/api/brand/list'),
                    axios.get('/api/category/list'),
                ]);
                if (bRes.data.success) setBrands(bRes.data.brands);
                if (cRes.data.success) setCategories(cRes.data.categories);
            } catch (e) {
                console.error('Failed to load brands/categories', e);
            }
        })();
    }, []);

    /* ── Form state ──────────────────────────────────────────── */
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        brand: '',
        tags: [],
        specs: {},
        variants: [emptyVariant()],
    });

    const [imageFiles, setImageFiles] = useState([null, null, null, null]);
    const [imageUrls, setImageUrls] = useState(['', '', '', '']);
    const [tagInput, setTagInput] = useState('');
    const [genCfg, setGenCfg] = useState({ Color: '', Storage: '' });

    /* ── Load edit data ──────────────────────────────────────── */
    useEffect(() => {
        if (!initialData) return;
        setForm({
            name: initialData.name || '',
            description: Array.isArray(initialData.description)
                ? initialData.description.join('\n')
                : (initialData.description || ''),
            category: typeof initialData.category === 'object'
                ? initialData.category?._id
                : (initialData.category || ''),
            brand: typeof initialData.brand === 'object'
                ? initialData.brand?._id
                : (initialData.brand || ''),
            tags: initialData.tags || [],
            specs: initialData.specs || {},
            variants: initialData.variants?.length ? initialData.variants : [emptyVariant()],
        });
        if (initialData.image) {
            setImageUrls([0, 1, 2, 3].map(i => initialData.image[i] || ''));
        }
    }, [initialData]);

    /* ── Field helpers ───────────────────────────────────────── */
    const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

    /* ── Tags ────────────────────────────────────────────────── */
    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
        setTagInput('');
    };

    /* ── Variant generator ───────────────────────────────────── */
    const applyGenerator = () => {
        const cfg = {};
        if (genCfg.Color.trim()) cfg.Color = genCfg.Color.split(',').map(s => s.trim()).filter(Boolean);
        if (genCfg.Storage.trim()) cfg.Storage = genCfg.Storage.split(',').map(s => s.trim()).filter(Boolean);
        set('variants', generateMatrix(cfg));
    };

    const updateVariant = (idx, field, value) => {
        const next = [...form.variants];
        next[idx] = { ...next[idx], [field]: value };
        set('variants', next);
    };

    /* ── Image handlers ──────────────────────────────────────── */
    const handleImageFile = (idx, file) => {
        const next = [...imageFiles];
        next[idx] = file;
        setImageFiles(next);
    };

    const removeImage = (idx) => {
        const f = [...imageFiles]; f[idx] = null; setImageFiles(f);
        const u = [...imageUrls]; u[idx] = ''; setImageUrls(u);
    };

    /* ── Submit ──────────────────────────────────────────────── */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
        if (!form.category) return toast.error('Vui lòng chọn danh mục');
        if (!form.brand) return toast.error('Vui lòng chọn thương hiệu');
        if (!form.description.trim()) return toast.error('Vui lòng nhập mô tả');

        const hasImage = imageFiles.some(Boolean) || imageUrls.some(Boolean);
        if (!hasImage) return toast.error('Vui lòng thêm ít nhất 1 hình ảnh');

        const variantsOk = form.variants.every(v =>
            v.variantLabel.trim() && Number(v.price) > 0 && Number(v.offerPrice) > 0
        );
        if (!variantsOk) return toast.error('Vui lòng điền đầy đủ tên, giá gốc và giá khuyến mãi cho mỗi biến thể');

        const payload = { ...form };
        payload.description = payload.description.split('\n').filter(Boolean);

        const prices = payload.variants.map(v => Number(v.price) || 0);
        const offers = payload.variants.map(v => Number(v.offerPrice) || 0);
        payload.price = Math.min(...prices);
        payload.offerPrice = Math.min(...offers);
        payload.inStock = payload.variants.reduce((s, v) => s + Number(v.inStock || 0), 0) > 0;

        const fd = new FormData();
        fd.append('productData', JSON.stringify(payload));
        imageFiles.forEach((file, i) => {
            if (file) fd.append(`image_${i}`, file);
            else if (imageUrls[i]) fd.append(`existingImage_${i}`, imageUrls[i]);
        });
        if (initialData?._id) fd.append('id', initialData._id);

        onSubmit(fd);
    };

    /* ───────────────────────────────────────────────────────── */
    /*  RENDER                                                   */
    /* ───────────────────────────────────────────────────────── */
    return (
        <form onSubmit={handleSubmit}
            className="max-w-5xl mx-auto font-[Fira_Sans,system-ui,sans-serif] space-y-5 pb-8">

            {/* ── Row 1: Info | Images ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* LEFT: Basic Info */}
                <div className="lg:col-span-3 space-y-5">
                    <Card title="Thông tin sản phẩm" icon={<IconTag className="w-4 h-4" />} accent="blue">
                        <div className="space-y-4">

                            {/* Name */}
                            <div>
                                <Label required>Tên sản phẩm</Label>
                                <input required value={form.name} onChange={e => set('name', e.target.value)}
                                    className={inputCls} placeholder="VD: iPhone 16 Pro Max 256GB" />
                            </div>

                            {/* Category + Brand */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label required>Danh mục</Label>
                                    <select required value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <Label required>Thương hiệu</Label>
                                    <select required value={form.brand} onChange={e => set('brand', e.target.value)} className={selectCls}>
                                        <option value="">-- Chọn thương hiệu --</option>
                                        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <Label required>Mô tả chi tiết</Label>
                                <textarea required rows={6} value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    className={`${inputCls} resize-none`}
                                    placeholder="Mỗi ý chính trên 1 dòng. VD:&#10;Chip A18 Pro mạnh mẽ&#10;Camera 48MP chụp đêm xuất sắc" />
                                <p className="text-xs text-slate-400 mt-1">Mỗi dòng sẽ là một điểm nổi bật</p>
                            </div>

                            {/* Tags */}
                            <div>
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 rounded-lg min-h-[42px] bg-white focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
                                    {form.tags.map(t => (
                                        <span key={t} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {t}
                                            <button type="button" onClick={() => set('tags', form.tags.filter(x => x !== t))}
                                                className="hover:text-red-500 transition-colors cursor-pointer">
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        onBlur={addTag}
                                        className="flex-1 outline-none min-w-[120px] text-sm placeholder-slate-400 bg-transparent"
                                        placeholder="Nhập tag, Enter để thêm..." />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* RIGHT: Images */}
                <div className="lg:col-span-2">
                    <Card title="Hình ảnh sản phẩm" icon={<IconImage className="w-4 h-4" />} accent="violet">
                        <div className="grid grid-cols-2 gap-3">
                            {[0, 1, 2, 3].map(idx => {
                                const preview = imageFiles[idx]
                                    ? URL.createObjectURL(imageFiles[idx])
                                    : imageUrls[idx];
                                return (
                                    <div key={idx} className="relative group">
                                        <label className={`flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
                                            ${preview ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50'}`}>
                                            <input type="file" accept="image/*" className="sr-only"
                                                onChange={e => handleImageFile(idx, e.target.files[0])} />
                                            {preview ? (
                                                <img src={preview} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-3">
                                                    <IconImage className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                                                    <p className="text-xs text-slate-400 font-medium">Ảnh {idx + 1}</p>
                                                    {idx === 0 && <p className="text-[10px] text-violet-400 mt-0.5">Ảnh chính</p>}
                                                </div>
                                            )}
                                        </label>
                                        {preview && (
                                            <button type="button" onClick={() => removeImage(idx)}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow cursor-pointer hover:bg-red-600">
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400 mt-3 text-center">Tối thiểu 1 ảnh · Ảnh đầu tiên là ảnh bìa</p>
                    </Card>
                </div>
            </div>

            {/* ── Row 2: Variants ──────────────────────────────── */}
            <Card title="Phân loại hàng & Giá bán" icon={<IconZap className="w-4 h-4" />} accent="emerald">

                {/* Generator */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <Label>Màu sắc (phân cách bằng dấu phẩy)</Label>
                        <input value={genCfg.Color}
                            onChange={e => setGenCfg(p => ({ ...p, Color: e.target.value }))}
                            className={inputCls} placeholder="Đen, Trắng, Titanium..." />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <Label>Dung lượng / Kích thước</Label>
                        <input value={genCfg.Storage}
                            onChange={e => setGenCfg(p => ({ ...p, Storage: e.target.value }))}
                            className={inputCls} placeholder="128GB, 256GB, 512GB..." />
                    </div>
                    <button type="button" onClick={applyGenerator}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm">
                        <IconZap className="w-4 h-4" />
                        Tạo tổ hợp
                    </button>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-800 text-slate-200">
                                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide w-[180px]">Biến thể</th>
                                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">Tên hiển thị</th>
                                <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide">SKU</th>
                                <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Giá gốc (₫)</th>
                                <th className="px-4 py-3 text-right font-semibold text-xs uppercase tracking-wide">Giá KM (₫)</th>
                                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wide">Tồn kho</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {form.variants.map((v, i) => (
                                <tr key={v.sku || i} className="hover:bg-emerald-50/50 transition-colors">
                                    <td className="px-4 py-3 border-r border-slate-100">
                                        {Object.entries(v.attributes).length > 0 ? (
                                            <div className="space-y-0.5">
                                                {Object.entries(v.attributes).map(([k, val]) => (
                                                    <div key={k} className="text-xs">
                                                        <span className="text-slate-400">{k}: </span>
                                                        <span className="font-semibold text-slate-700">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Mặc định</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input required value={v.variantLabel}
                                            onChange={e => updateVariant(i, 'variantLabel', e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                            placeholder="VD: Đen 128GB" />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input required value={v.sku}
                                            onChange={e => updateVariant(i, 'sku', e.target.value)}
                                            className="w-[130px] px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all" />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input required type="number" min="0" value={v.price}
                                            onChange={e => updateVariant(i, 'price', e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-right"
                                            placeholder="0" />
                                    </td>
                                    <td className="px-3 py-2.5">
                                        <input required type="number" min="0" value={v.offerPrice}
                                            onChange={e => updateVariant(i, 'offerPrice', e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-right"
                                            placeholder="0" />
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <input required type="number" min="0" value={v.inStock}
                                            onChange={e => updateVariant(i, 'inStock', e.target.value)}
                                            className="w-[72px] px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-center mx-auto block" />
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                        <button type="button"
                                            disabled={form.variants.length === 1}
                                            onClick={() => set('variants', form.variants.filter((_, idx) => idx !== i))}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                            <IconTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add variant row */}
                <button type="button"
                    onClick={() => set('variants', [...form.variants, emptyVariant()])}
                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer">
                    <IconPlus className="w-4 h-4" />
                    Thêm biến thể
                </button>

                {/* Summary stats - light theme */}
                {form.variants.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                        <span>
                            <span className="font-semibold text-gray-800">{form.variants.length}</span> biến thể
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>
                            Tồn kho: <span className="font-semibold text-gray-800">
                                {form.variants.reduce((s, v) => s + Number(v.inStock || 0), 0).toLocaleString()}
                            </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>
                            Giá: <span className="font-semibold text-[#d70018]">
                                {form.variants[0]?.offerPrice
                                    ? `${Number(form.variants[0].offerPrice).toLocaleString()}₫`
                                    : '—'}
                            </span>
                        </span>
                        {(() => {
                            const v = form.variants[0];
                            const price = Number(v?.price || 0);
                            const offer = Number(v?.offerPrice || 0);
                            if (price > offer && offer > 0) {
                                const pct = Math.round((1 - offer / price) * 100);
                                return (
                                    <><span className="text-gray-300">|</span>
                                    <span className="text-green-600 font-semibold">Giảm {pct}%</span></>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}
            </Card>

            {/* ── Action Footer ─────────────────────────────────── */}
            <div className="flex items-center justify-between py-4">
                <div>
                    {onCancel && (
                        <button type="button" onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer">
                            Hủy bỏ
                        </button>
                    )}
                </div>
                <button type="submit" disabled={loading}
                    className="flex items-center gap-2.5 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm">
                    <IconSave className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : initialData ? 'Lưu thay đổi' : 'Đăng sản phẩm'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
