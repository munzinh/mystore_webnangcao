import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'
import { SkeletonProductCard } from './Skeleton'

const BestSeller = () => {
  const { products, isProductsLoading } = useAppContext();

  return (
    <div className='bg-white rounded-xl shadow-sm p-3 md:p-5 w-full mb-6'>
      <div className='max-w-[1200px] mx-auto'>
        <p className='text-xl md:text-2xl font-bold text-gray-800 uppercase mb-4'>Sản phẩm nổi bật</p>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'>
          {isProductsLoading
            ? Array(5).fill(0).map((_, index) => <SkeletonProductCard key={index} />)
            : products
                .filter((product) => product.inStock)
                .slice(0, 5)
                .map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))
          }
        </div>
      </div>
    </div>
  );
};

export default BestSeller;
