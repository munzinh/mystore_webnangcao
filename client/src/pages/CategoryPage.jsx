import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import ProductFilter from '../components/ProductFilter';
import ProductGrid from '../components/ProductGrid';
import { filterAndSortProducts } from '../utils/filterUtils';

const CategoryPage = () => {
    const { products, categories } = useAppContext();
    const { category } = useParams();

    const [filteredProducts, setFilteredProducts] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        price: '',
        rating: 0,
    });

    // Sort State
    const [sort, setSort] = useState('recommended');

    const clearFilters = () => {
        setFilters({ price: '', rating: 0 });
        setSort('recommended');
    };

    // Reset filters when crossing category boundaries
    useEffect(() => {
        clearFilters();
    }, [category]);

    const searchCategory = categories.find(
        (item) =>
            item.slug?.toLowerCase() === category?.toLowerCase() ||
            item.name?.toLowerCase() === category?.toLowerCase()
    );

    const categoryScope = useMemo(() => {
        if (!searchCategory) return category;

        const categoryMap = new Map(categories.map((item) => [item._id, item]));
        const scopedCategories = [];
        const stack = [searchCategory];

        while (stack.length) {
            const current = stack.pop();
            if (!current || scopedCategories.some(item => item._id === current._id)) continue;

            scopedCategories.push(current);

            categories.forEach((item) => {
                const parentId = typeof item.parentId === 'object' ? item.parentId?._id : item.parentId;
                if (parentId === current._id) {
                    stack.push(categoryMap.get(item._id) || item);
                }
            });
        }

        return scopedCategories.flatMap((item) => [
            item.slug,
            item._id,
            item.name,
        ]).filter(Boolean);
    }, [categories, category, searchCategory]);

    useEffect(() => {
        // Apply category, child categories, filters & sorting
        let result = products || [];
        result = filterAndSortProducts(result, categoryScope, filters, sort);
        result = result.filter(product => product.inStock);
        setFilteredProducts(result);
    }, [products, categoryScope, filters, sort]);

    return (
        <div className="mt-16 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {searchCategory && (
                <div className="flex flex-col items-end w-max mb-6">
                    <p className="text-2xl font-medium uppercase">
                        {searchCategory.name}
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
