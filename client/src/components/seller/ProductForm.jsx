import React, { useState, useEffect, useMemo } from 'react';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { useProductDraft } from '../../hooks/useProductDraft';

const emptyVariant = () => ({ 
    sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    attributes: {}, 
    variantLabel: '', 
    price: '', 
    offerPrice: '', 
    inStock: 0,
    images: [] // New for variant-specific formatting
});

const generateVariantsMatrix = (attributesConfig) => {
    // attributesConfig: { 'Color': ['Red', 'Blue'], 'Storage': ['128GB', '256GB'] }
    const keys = Object.keys(attributesConfig).filter(k => attributesConfig[k]?.length > 0);
    if(keys.length === 0) return [emptyVariant()];

    let combinations = [{}];
    for(const key of keys) {
        const values = attributesConfig[key];
        const newCombs = [];
        for(const comb of combinations) {
            for(const val of values) {
                newCombs.push({...comb, [key]: val});
            }
        }
        combinations = newCombs;
    }

    return combinations.map(comb => {
        const v = emptyVariant();
        v.attributes = comb;
        v.variantLabel = Object.values(comb).join(' - ');
        return v;
    });
};

const ProductForm = ({ initialData, onSubmit, loading, onCancel }) => {
    const { axios } = useAppContext();

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const initialState = {
        name: '',
        description: '',
        category: '',
        brand: '',
        tags: [],
        specs: {},
        variants: [emptyVariant()],
        // We do save draft, but image files must be handled via state
    };

    const [draft, setDraft, clearDraft] = useProductDraft(initialState);
    const [formState, setFormState] = useState(draft);

    const [step, setStep] = useState(1);
    
    // Media (Files cannot be serialized to localStorage)
    const [globalFiles, setGlobalFiles] = useState([null, null, null, null]);
    const [globalExistingUrls, setGlobalExistingUrls] = useState(['', '', '', '']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real scenario, check if these exist
                const [brandRes, catRes] = await Promise.all([
                    axios.get('/api/brand/list'),
                    axios.get('/api/category/list')
                ]);
                if(brandRes.data.success) setBrands(brandRes.data.brands);
                if(catRes.data.success) setCategories(catRes.data.categories);
            } catch (error) {
                console.error("Fetch form requirements error:", error);
            }
        };
        fetchData();
    }, []);

    // Load initial data if edit mode
    useEffect(() => {
        if(initialData) {
            setFormState({
                name: initialData.name || '',
                description: Array.isArray(initialData.description) ? initialData.description.join('\n') : '',
                category: typeof initialData.category === 'object' ? initialData.category._id : initialData.category,
                brand: typeof initialData.brand === 'object' ? initialData.brand._id : initialData.brand,
                tags: initialData.tags || [],
                specs: initialData.specs || {},
                variants: initialData.variants || [emptyVariant()]
            });
            
            // Images
            if(initialData.image) {
                setGlobalExistingUrls(
                    [0, 1, 2, 3].map(i => initialData.image[i] || '')
                );
            }
        }
    }, [initialData]);

    // Track state to draft
    useEffect(() => {
        if(!initialData) setDraft(formState);
    }, [formState]);


    // Data Manipulation
    const updateField = (field, value) => setFormState(p => ({...p, [field]: value}));

    // Tag Logic
    const [tagInput, setTagInput] = useState('');
    const handleTagAdd = (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            const tag = tagInput.trim().toLowerCase();
            if(tag && !formState.tags.includes(tag)) {
                updateField('tags', [...formState.tags, tag]);
            }
            setTagInput('');
        }
    }

    // Generator 
    const [generatorConfig, setGeneratorConfig] = useState({}); // { Color: "Red, Blue", Storage: "128, 256" }
    const applyGenerator = () => {
        const parsedConfig = {};
        for(let key in generatorConfig) {
            const vals = generatorConfig[key].split(',').map(s => s.trim()).filter(Boolean);
            if(vals.length > 0) parsedConfig[key] = vals;
        }
        updateField('variants', generateVariantsMatrix(parsedConfig));
    };


    // Submits
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const payload = { ...formState };
        payload.description = payload.description.split('\n').filter(Boolean);

        // Required Validations
        if(!payload.category || !payload.brand) return alert("Vui lòng chọn danh mục và thương hiệu");

        // Calculate min price for root
        const prices = payload.variants.map(v => Number(v.price) || 0);
        const offers = payload.variants.map(v => Number(v.offerPrice) || 0);
        payload.price = Math.min(...prices);
        payload.offerPrice = Math.min(...offers);
        payload.inStock = payload.variants.reduce((a, b) => a + Number(b.inStock || 0), 0) > 0;

        const formData = new FormData();
        formData.append('productData', JSON.stringify(payload));
        
        // Append global images
        globalFiles.forEach((file, idx) => {
            if(file) formData.append(`image_${idx}`, file);
            else if(globalExistingUrls[idx]) formData.append(`existingImage_${idx}`, globalExistingUrls[idx]);
        });

        // (We skip variant-specific files for now to keep form simple, but API supports it)
        
        if (initialData?._id) formData.append('id', initialData._id);
        onSubmit(formData);
        
        if(!initialData) clearDraft();
    }


    const nextStep = () => setStep(p => Math.min(p + 1, 4));
    const prevStep = () => setStep(p => Math.max(p - 1, 1));

    return (
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
            {/* Stepper Header */}
            <div className="flex bg-purple-50 justify-between items-center px-8 py-5 border-b border-purple-100">
                {[
                    {n: 1, label: "Thông tin cơ bản"},
                    {n: 2, label: "Hình ảnh"},
                    {n: 3, label: "Phân loại (Biến thể)"},
                    {n: 4, label: "Xác nhận"}
                ].map((s, idx) => (
                    <div key={s.n} className="flex items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                            ${step === s.n ? 'bg-purple-600 text-white shadow-md' : step > s.n ? 'bg-purple-300 text-purple-800' : 'bg-gray-200 text-gray-500'}`}>
                            {step > s.n ? '✓' : s.n}
                        </div>
                        {idx < 3 && (
                            <div className={`h-1 flex-1 mx-4 rounded-full transition-all duration-500 ${step > s.n ? 'bg-purple-400' : 'bg-gray-200'}`}></div>
                        )}
                        <span className="hidden lg:block text-sm font-medium ml-2 text-gray-600 w-max absolute mt-12">{s.label}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="p-8 font-[Nunito_Sans]">
                
                {/* STEP 1: Basic Info */}
                <div className={step === 1 ? 'block animate-fade-in' : 'hidden'}>
                    <h2 className="text-2xl font-bold font-[Rubik] text-purple-900 mb-6">Thông tin cơ bản</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm *</label>
                                <input required value={formState.name} onChange={e => updateField('name', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục *</label>
                                    <select required value={formState.category} onChange={e => updateField('category', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Thương hiệu *</label>
                                    <select required value={formState.brand} onChange={e => updateField('brand', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none">
                                        <option value="">-- Chọn thương hiệu --</option>
                                        {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tags (Enter để thêm)</label>
                                <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 rounded-lg min-h-[48px]">
                                    {formState.tags.map(t => (
                                        <span key={t} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            {t} <button type="button" onClick={() => updateField('tags', formState.tags.filter(x => x !== t))} className="hover:text-red-500">×</button>
                                        </span>
                                    ))}
                                    <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleTagAdd} 
                                        className="flex-1 outline-none min-w-[100px] text-sm bg-transparent" placeholder="Thêm tag..." />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết *</label>
                            <textarea required rows={10} value={formState.description} onChange={e => updateField('description', e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none resize-none"
                                placeholder="Gõ mỗi ý chính trên 1 dòng..." />
                        </div>
                    </div>
                </div>

                {/* STEP 2: Media */}
                <div className={step === 2 ? 'block animate-fade-in' : 'hidden'}>
                    <h2 className="text-2xl font-bold font-[Rubik] text-purple-900 mb-2">Hình ảnh sản phẩm</h2>
                    <p className="text-gray-500 mb-6">Tải lên ít nhất 1 hình ảnh rõ nét cho sản phẩm này.</p>
                    
                    <div className="flex flex-wrap gap-6">
                        {[0, 1, 2, 3].map(idx => (
                            <label key={idx} className="relative w-32 h-32 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-50 transition group overflow-hidden bg-gray-50">
                                <input type="file" accept="image/*" hidden 
                                    onChange={e => setGlobalFiles(p => { const x=[...p]; x[idx]=e.target.files[0]; return x;})} />
                                
                                {globalFiles[idx] || globalExistingUrls[idx] ? (
                                    <img src={globalFiles[idx] ? URL.createObjectURL(globalFiles[idx]) : globalExistingUrls[idx]} 
                                         className="w-full h-full object-cover" alt="preview" />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-purple-400 text-3xl">+</span>
                                        <p className="text-xs text-purple-600 font-medium">Ảnh {idx+1}</p>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* STEP 3: Variants */}
                <div className={step === 3 ? 'block animate-fade-in' : 'hidden'}>
                    <h2 className="text-2xl font-bold font-[Rubik] text-purple-900 mb-2">Phân loại hàng</h2>
                    
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mb-6 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-purple-800 mb-1">Màu sắc (phân cách bằng dấu phẩy)</label>
                            <input value={generatorConfig['Color'] || ''} onChange={e => setGeneratorConfig(p=>({...p, 'Color': e.target.value}))} 
                                className="w-full px-3 py-2 border rounded outline-none focus:border-purple-500" placeholder="Đen, Trắng, Titanium..." />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-purple-800 mb-1">Dung lượng / Kích thước</label>
                            <input value={generatorConfig['Storage'] || ''} onChange={e => setGeneratorConfig(p=>({...p, 'Storage': e.target.value}))} 
                                className="w-full px-3 py-2 border rounded outline-none focus:border-purple-500" placeholder="128GB, 256GB..." />
                        </div>
                        <button type="button" onClick={applyGenerator} className="bg-purple-600 text-white px-4 py-2 font-bold rounded hover:bg-purple-700 transition">
                            Tạo tổ hợp
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-b">Biến thể</th>
                                    <th className="px-4 py-3 border-b">Tên hiển thị</th>
                                    <th className="px-4 py-3 border-b">SKU</th>
                                    <th className="px-4 py-3 border-b text-right">Giá gốc (₫) *</th>
                                    <th className="px-4 py-3 border-b text-right">Giá KM (₫) *</th>
                                    <th className="px-4 py-3 border-b text-center">Tồn kho</th>
                                    <th className="px-4 py-3 border-b"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formState.variants.map((v, i) => (
                                    <tr key={v.sku || i} className="hover:bg-purple-50 transition border-b last:border-0">
                                        <td className="px-4 py-3 font-medium text-purple-900 border-r w-[200px]">
                                            {/* Attributes Input Editor for manual tuning */}
                                            {Object.entries(v.attributes).length > 0 
                                                ? Object.entries(v.attributes).map(([k, vl]) => <span className="block text-xs text-gray-500" key={k}><b>{k}:</b> {vl}</span>) 
                                                : <span className="text-xs text-gray-400 italic">Mặc định</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required value={v.variantLabel} onChange={e => {
                                                const u = [...formState.variants]; u[i].variantLabel = e.target.value; updateField('variants', u);
                                            }} className="w-full px-2 py-1 border rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required value={v.sku} onChange={e => {
                                                const u = [...formState.variants]; u[i].sku = e.target.value; updateField('variants', u);
                                            }} className="w-[120px] px-2 py-1 border rounded text-xs font-mono" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="number" value={v.price} onChange={e => {
                                                const u = [...formState.variants]; u[i].price = e.target.value; updateField('variants', u);
                                            }} className="w-full px-2 py-1 border rounded text-right" min="0" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="number" value={v.offerPrice} onChange={e => {
                                                const u = [...formState.variants]; u[i].offerPrice = e.target.value; updateField('variants', u);
                                            }} className="w-full px-2 py-1 border rounded text-right" min="0" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input required type="number" value={v.inStock} onChange={e => {
                                                const u = [...formState.variants]; u[i].inStock = e.target.value; updateField('variants', u);
                                            }} className="w-[80px] px-2 py-1 border rounded text-center mx-auto block" min="0" />
                                        </td>
                                        <td className="px-4 py-3 flex justify-center">
                                            <button type="button" onClick={() => updateField('variants', formState.variants.filter((_, idx) => idx !== i))}
                                                className="text-red-400 hover:text-red-600 font-bold" disabled={formState.variants.length===1}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onClick={() => updateField('variants', [...formState.variants, emptyVariant()])}
                        className="mt-4 text-purple-600 font-bold hover:underline text-sm">+ Thêm biến thể trống</button>
                </div>

                {/* STEP 4: Review */}
                <div className={step === 4 ? 'block animate-fade-in' : 'hidden'}>
                    <h2 className="text-2xl font-bold font-[Rubik] text-purple-900 mb-6">Xác nhận xuất bản</h2>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mb-8">
                        <h3 className="font-bold text-orange-900 mb-1">{formState.name || "Chưa có tên"}</h3>
                        <p className="text-orange-700 text-sm mb-4">Bạn đang chuẩn bị đăng sản phẩm với sơ đồ sau:</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-gray-500 text-xs uppercase font-bold">Biến thể</p>
                                <p className="text-3xl font-[Rubik] text-purple-600">{formState.variants.length}</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-gray-500 text-xs uppercase font-bold">Tổng hàng</p>
                                <p className="text-3xl font-[Rubik] text-purple-600">{formState.variants.reduce((a,b)=>a+Number(b.inStock||0),0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="mt-10 flex justify-between items-center border-t border-gray-100 pt-6">
                    <div>
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="px-6 py-2.5 font-bold text-gray-500 hover:text-purple-600 transition">← Quay lại</button>
                        ) : (
                            onCancel && <button type="button" onClick={onCancel} className="px-6 py-2.5 font-bold text-gray-400 hover:text-red-500 transition">Hủy</button>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        {step < 4 && !initialData && (
                            <span className="text-xs font-bold text-green-500 flex items-center gap-1 object-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Draft saved
                            </span>
                        )}
                        {step < 4 ? (
                            <button type="submit" className="px-8 py-2.5 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transition">
                                Tiếp tục
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="px-10 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition disabled:opacity-50">
                                {loading ? "Đang xử lý..." : "🔥 Hoàn tất xuất bản"}
                            </button>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
};

export default ProductForm;
