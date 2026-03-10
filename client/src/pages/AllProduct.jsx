import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import { filterAndSortProducts } from '../utils/filterUtils';
import { categories } from '../assets/assets';

const AllProduct = () => {

    const { products, searchQuery } = useAppContext();
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        category: 'all',
        price: '',
        rating: 0,
    });

    // Sort State
    const [sort, setSort] = useState('newest');

    const clearFilters = () => {
        setFilters({ category: 'all', price: '', rating: 0 });
        setSort('newest');
    };

    useEffect(() => {
        // First filter by search query
        let result = products || [];
        if (searchQuery && searchQuery.length > 0) {
            result = result.filter(
                product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Then apply categories, filters & sorting
        result = filterAndSortProducts(result, filters.category, filters, sort);

        // Filter out out-of-stock items
        result = result.filter(product => product.inStock);

        setFilteredProducts(result);

    }, [products, searchQuery, filters, sort]);

    return (
        <div className='mt-16 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col items-end w-max mb-6'>
                <p className='text-2xl font-medium uppercase'>Tất cả sản phẩm</p>
                <div className='w-16 h-0.5 bg-[#d70018] rounded-full mt-1'></div>
            </div>

            <ProductFilter
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
                categories={categories}
                isAllProducts={true}
            />

            <ProductGrid products={filteredProducts} />
        </div>
    )
}

export default AllProduct;