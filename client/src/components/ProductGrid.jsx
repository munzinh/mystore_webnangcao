import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => {
    return (
        <div className="w-full">
            {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {products.map((product, index) => (
                        <ProductCard key={product._id || index} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-lg font-medium text-gray-600 mb-2">
                        Không tìm thấy sản phẩm nào
                    </p>
                    <p className="text-sm text-gray-500 text-center max-w-sm">
                        Thử điều chỉnh lại bộ lọc hoặc điều kiện tìm kiếm để xem thêm nhiều sản phẩm khác.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
