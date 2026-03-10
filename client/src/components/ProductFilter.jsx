import React from 'react';

const ProductFilter = ({ filters, setFilters, sort, setSort, clearFilters, categories, isAllProducts }) => {

    const priceOptions = [
        { label: 'Dưới 5 triệu', value: 'under_5' },
        { label: '5 - 10 triệu', value: '5_10' },
        { label: '10 - 20 triệu', value: '10_20' },
        { label: 'Trên 20 triệu', value: 'over_20' },
    ];

    const ratingOptions = [
        { label: 'Từ 5 sao', value: 5 },
        { label: 'Từ 4 sao', value: 4 },
        { label: 'Từ 3 sao', value: 3 },
        { label: 'Từ 2 sao', value: 2 },
        { label: 'Từ 1 sao', value: 1 },
    ];

    const sortOptions = [
        { label: 'Mới nhất', value: 'newest' },
        { label: 'Giá thấp → cao', value: 'price_asc' },
        { label: 'Giá cao → thấp', value: 'price_desc' },
        { label: 'Bán chạy', value: 'best_selling' },
        { label: 'Đánh giá cao', value: 'top_rated' },
    ];

    const handlePriceChange = (e) => {
        setFilters({ ...filters, price: e.target.value });
    };

    const handleRatingChange = (e) => {
        setFilters({ ...filters, rating: Number(e.target.value) });
    };

    const handleCategoryChange = (e) => {
        setFilters({ ...filters, category: e.target.value });
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const hasActiveFilters = filters.price || filters.rating > 0 || (isAllProducts && filters.category !== 'all');

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <span className="font-medium text-gray-700 mr-1 hidden md:inline-block">Bộ lọc:</span>

                {isAllProducts && categories && (
                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-[#d70018] focus:border-[#d70018] block px-4 py-2 cursor-pointer outline-none transition-colors"
                        value={filters.category}
                        onChange={handleCategoryChange}
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat.path.toLowerCase()}>{cat.text}</option>
                        ))}
                    </select>
                )}

                <select
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-[#d70018] focus:border-[#d70018] block px-4 py-2 cursor-pointer outline-none transition-colors"
                    value={filters.price}
                    onChange={handlePriceChange}
                >
                    <option value="">Mức giá</option>
                    {priceOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <select
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-[#d70018] focus:border-[#d70018] block px-4 py-2 cursor-pointer outline-none transition-colors"
                    value={filters.rating}
                    onChange={handleRatingChange}
                >
                    <option value={0}>Đánh giá</option>
                    {ratingOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-red-500 hover:text-white hover:bg-red-500 border border-red-500 rounded-full font-medium px-4 py-1.5 transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto md:justify-end border-t border-gray-100 md:border-none pt-4 md:pt-0">
                <span className="font-medium text-gray-700 hidden md:inline-block">Sắp xếp:</span>
                <select
                    className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-[#d70018] focus:border-[#d70018] block px-4 py-2 cursor-pointer outline-none transition-colors w-full md:w-auto"
                    value={sort}
                    onChange={handleSortChange}
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ProductFilter;
