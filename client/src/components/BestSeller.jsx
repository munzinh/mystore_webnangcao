import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
  const { products } = useAppContext();

  return (
    <div className='mt-16 px-0'>
      <div className='max-w-[1280px] mx-auto'>
        <p className='text-2xl md:text-3xl font-medium'>Sản phẩm nổi bật</p>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6'>
          {products
            .filter((product) => product.inStock)
            .slice(0, 5)
            .map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default BestSeller;
