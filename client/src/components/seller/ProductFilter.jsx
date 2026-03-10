import React from 'react';
import { categories } from '../../assets/assets';

const ProductFilter = ({
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterStatus, setFilterStatus,
    sortBy, setSortBy
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between w-full">
            <div className="flex-1 w-full md:max-w-xs relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full outline-none py-2.5 ps-10 pe-3 rounded-lg border border-gray-300 focus:border-blue-500 transition text-sm"
                />
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 text-sm flex-1 md:flex-none"
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((item, index) => (
                        <option key={index} value={item.name || item.path}>{item.name || item.path}</option>
                    ))}
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 text-sm flex-1 md:flex-none"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="inStock">Còn hàng</option>
                    <option value="outOfStock">Hết hàng</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="outline-none py-2.5 px-3 rounded-lg border border-gray-300 text-sm flex-1 md:flex-none bg-gray-50"
                >
                    <option value="date-desc">Mới nhất</option>
                    <option value="date-asc">Cũ nhất</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                </select>
            </div>
        </div>
    );
};

export default ProductFilter;
