import React, { useState, useEffect } from 'react';
import { assets, categories } from '../../assets/assets';

const ProductForm = ({ initialData, onSubmit, loading, onCancel }) => {
    const [files, setFiles] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [inStock, setInStock] = useState(true);
    // Dynamic categories - start with static list + allow adding new
    const [allCategories, setAllCategories] = useState(categories.map(c => c.name || c.path));
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(Array.isArray(initialData.description) ? initialData.description.join('\n') : (initialData.description || ''));
            setCategory(initialData.category || '');
            setPrice(initialData.price || '');
            setOfferPrice(initialData.offerPrice || '');
            setInStock(initialData.inStock !== undefined ? initialData.inStock : true);
            if (initialData.image) {
                setImageUrls(initialData.image);
            }
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const productData = {
            name,
            description: description.split('\n').filter(l => l.trim() !== ''),
            category,
            price,
            offerPrice,
            inStock
        };

        const formData = new FormData();
        formData.append('productData', JSON.stringify(productData));
        for (let i = 0; i < files.length; i++) {
            if (files[i]) {
                formData.append('images', files[i]);
            }
        }

        if (initialData && initialData._id) {
            formData.append('id', initialData._id);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
                <p className="text-base font-medium">Hình ảnh sản phẩm</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    {Array(4).fill('').map((_, index) => (
                        <label key={index} htmlFor={`image${index}`}>
                            <input onChange={(e) => {
                                const updateFiles = [...files];
                                updateFiles[index] = e.target.files[0];
                                setFiles(updateFiles);
                            }} accept="image/*" type="file" id={`image${index}`} hidden />
                            <img className="max-w-24 cursor-pointer object-cover h-24 border border-gray-300 rounded"
                                src={files[index] ? URL.createObjectURL(files[index]) : (imageUrls[index] || assets.upload_area)}
                                alt="uploadArea" />
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-name">Tên sản phẩm</label>
                    <input onChange={(e) => setName(e.target.value)} value={name}
                        id="product-name" type="text" placeholder="Nhập tên" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Danh mục</label>
                    <div className="flex gap-2">
                        <select onChange={(e) => setCategory(e.target.value)} value={category}
                            id="category" className="flex-1 outline-none py-2 px-3 rounded border border-gray-500/40" required>
                            <option value="">Chọn danh mục</option>
                            {allCategories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <button type="button"
                            onClick={() => setShowNewCategory(!showNewCategory)}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition whitespace-nowrap"
                            title="Thêm danh mục mới"
                        >+ Mới</button>
                    </div>
                    {showNewCategory && (
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                placeholder="Nhập tên danh mục mới..."
                                className="flex-1 outline-none py-2 px-3 rounded border border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const trimmed = newCategoryInput.trim();
                                        if (trimmed && !allCategories.includes(trimmed)) {
                                            setAllCategories([...allCategories, trimmed]);
                                            setCategory(trimmed);
                                        } else if (trimmed) {
                                            setCategory(trimmed);
                                        }
                                        setNewCategoryInput('');
                                        setShowNewCategory(false);
                                    }
                                }}
                            />
                            <button type="button"
                                onClick={() => {
                                    const trimmed = newCategoryInput.trim();
                                    if (trimmed && !allCategories.includes(trimmed)) {
                                        setAllCategories([...allCategories, trimmed]);
                                    }
                                    if (trimmed) setCategory(trimmed);
                                    setNewCategoryInput('');
                                    setShowNewCategory(false);
                                }}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                            >Thêm</button>
                            <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryInput(''); }}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded transition">Hủy</button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-price">Giá gốc</label>
                    <input onChange={(e) => setPrice(e.target.value)} value={price}
                        id="product-price" type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="offer-price">Giá ưu đãi</label>
                    <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice}
                        id="offer-price" type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" />
                </div>

                <div className="flex flex-col gap-1 justify-center">
                    <label className="text-base font-medium mb-1">Trạng thái</label>
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                        <input onChange={(e) => setInStock(e.target.checked)} checked={inStock} type="checkbox" className="sr-only peer" />
                        <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                        <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        <span className="text-sm">{inStock ? 'Còn hàng' : 'Hết hàng'}</span>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-base font-medium" htmlFor="product-description">Mô tả sản phẩm</label>
                <textarea onChange={(e) => setDescription(e.target.value)} value={description}
                    id="product-description" rows={4} className="outline-none py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Mỗi dòng 1 đoạn mô tả..."></textarea>
            </div>

            <div className="flex gap-4">
                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded cursor-pointer disabled:bg-gray-400">
                    {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm')}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 transition text-gray-800 font-medium rounded cursor-pointer">
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;
