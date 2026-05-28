import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'
import { SkeletonProductCard } from './Skeleton'

const BestSeller = () => {
  const { products, isProductsLoading } = useAppContext();
  const sliderRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const displayedProducts = useMemo(() => products
    .filter((product) => product.inStock)
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 8), [products]);
  const canSlide = displayedProducts.length > 5;

  const scrollProducts = useCallback((direction) => {
    if (!sliderRef.current) return;

    const firstProduct = sliderRef.current.firstElementChild;
    const gap = parseFloat(getComputedStyle(sliderRef.current).columnGap) || 0;
    const scrollAmount = firstProduct
      ? firstProduct.getBoundingClientRect().width + gap
      : sliderRef.current.clientWidth;

    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (!canSlide || isPaused || isProductsLoading) return undefined;

    const slider = sliderRef.current;
    if (!slider) return undefined;

    const timer = setInterval(() => {
      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      if (maxScrollLeft <= 0) return;

      if (slider.scrollLeft >= maxScrollLeft - 4) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollProducts('right');
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [canSlide, displayedProducts.length, isPaused, isProductsLoading, scrollProducts]);

  return (
    <div className='bg-white rounded-xl shadow-sm p-3 md:p-5 w-full mb-6'>
      <div className='max-w-[1200px] mx-auto'>
        <div className='flex items-center justify-between gap-3 mb-4'>
          <p className='text-xl md:text-2xl font-bold text-gray-800 uppercase'>Sản phẩm bán chạy</p>

          {!isProductsLoading && canSlide && (
            <div className='hidden sm:flex items-center gap-2'>
              <button
                type='button'
                onClick={() => scrollProducts('left')}
                className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#d70018] hover:text-[#d70018] transition-colors'
                aria-label='Xem sản phẩm trước'
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                type='button'
                onClick={() => scrollProducts('right')}
                className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#d70018] hover:text-[#d70018] transition-colors'
                aria-label='Xem sản phẩm tiếp theo'
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {isProductsLoading ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'>
            {Array(5).fill(0).map((_, index) => <SkeletonProductCard key={index} />)}
          </div>
        ) : (
          <div
            ref={sliderRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className='flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          >
            {displayedProducts.map((product, index) => (
              <div
                key={product._id || index}
                className='shrink-0 basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-1.5rem)/3)] md:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-4rem)/5)]'
              >
                  <ProductCard key={index} product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSeller;
