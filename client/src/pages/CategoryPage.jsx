import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import { filterAndSortProducts } from '../utils/filterUtils';

const CategoryPage = () => {
    const { products } = useAppContext();
    const { category } = useParams();

    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        price: '',
        rating: 0,
    });

    // Sort State
    const [sort, setSort] = useState('newest');

    const clearFilters = () => {
        setFilters({ price: '', rating: 0 });
        setSort('newest');
    };

    // Reset filters when crossing category boundaries
    useEffect(() => {
        clearFilters();
    }, [category]);

    useEffect(() => {
        // Apply category, filters & sorting
        let result = products || [];
        result = filterAndSortProducts(result, category, filters, sort);
        result = result.filter(product => product.inStock);
        setFilteredProducts(result);
    }, [products, category, filters, sort]);

    const searchCategory = categories.find(
        (item) => item.path.toLowerCase() === category?.toLowerCase()
    );

    return (
        <div className="mt-16 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {searchCategory && (
                <div className="flex flex-col items-end w-max mb-6">
                    <p className="text-2xl font-medium uppercase">
                        {searchCategory.text}
                    </p>
                    <div className="w-16 h-0.5 bg-[#d70018] rounded-full mt-1" />
                </div>
            )}

            <ProductFilter
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
                clearFilters={clearFilters}
                isAllProducts={false}
            />

            <ProductGrid products={filteredProducts} />
        </div>
    );
};

export default CategoryPage;
