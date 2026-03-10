import React from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ product }) => {
    const { addToCart, removeFromCart, cartItems, navigate } = useAppContext();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const calculateDiscount = (price, offerPrice) => {
        if (!price || !offerPrice || price <= offerPrice) return 0;
        return Math.round(((price - offerPrice) / price) * 100);
    };

    const discountPercent = calculateDiscount(product.price, product.offerPrice);

    return product && (
        <div
            onClick={() => {
                navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                scrollTo(0, 0);
            }}
            className="relative border border-gray-300 rounded-md p-3 bg-white w-full hover:shadow-md transition overflow-hidden flex flex-col h-full"
        >
            {/* Tag giảm giá */}
            {discountPercent > 0 && (
                <div className="absolute top-0 left-0 bg-[#d70018] text-white text-[11px] font-bold px-2.5 py-1 rounded-br-lg z-10">
                    Giảm {discountPercent}%
                </div>
            )}

            {/* Hình ảnh */}
            <div className="group cursor-pointer flex items-center justify-center h-32 mb-3 mt-2">
                <img className="group-hover:scale-105 transition h-full object-contain" src={product.image[0]} alt={product.name} />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="text-gray-500/70 text-sm flex flex-col gap-1 flex-grow">
                <p className="truncate">{product.category}</p>
                <p className="text-gray-800 font-semibold text-base truncate">{product.name}</p>

                {/* Giá */}
                <div className="flex flex-col mt-1">
                    <p className="text-lg font-semibold text-[#d70018] leading-tight">
                        {formatCurrency(product.offerPrice)}
                    </p>
                    <p className="text-gray-500/60 text-sm line-through leading-tight">
                        {product.price > product.offerPrice ? formatCurrency(product.price) : '\u00A0'}
                    </p>
                </div>

                {/* Đánh giá và nút Add */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    {/* Đánh giá sao động */}
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                            const avg = product.avgRating || 0;
                            const filled = avg >= star;
                            const half = !filled && avg >= star - 0.5;
                            const gradId = `hg-${product._id}-${star}`;
                            return (
                                <svg key={star} className="w-3.5 h-3.5" viewBox="0 0 20 20">
                                    {half ? (
                                        <>
                                            <defs>
                                                <linearGradient id={gradId}>
                                                    <stop offset="50%" stopColor="#facc15" />
                                                    <stop offset="50%" stopColor="#d1d5db" />
                                                </linearGradient>
                                            </defs>
                                            <path fill={`url(#${gradId})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </>
                                    ) : (
                                        <path fill={filled ? '#facc15' : '#d1d5db'} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    )}
                                </svg>
                            );
                        })}
                        <p className="ml-1 text-xs text-gray-600">
                            {product.totalReviews > 0 ? `(${product.totalReviews})` : ''}
                        </p>
                    </div>

                    {/* Nút Thêm/giảm */}
                    <div
                        onClick={(e) => { e.stopPropagation(); }}
                        className="text-[#d70018] text-sm"
                    >
                        {!cartItems[product._id] ? (
                            <button
                                onClick={() => addToCart(product._id)}
                                className="flex items-center justify-center gap-1 bg-[#d70018] border border-[#d70018] w-[70px] h-[30px] rounded text-white text-sm"
                            >
                                <FaShoppingCart size={14} />
                                Thêm
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 w-[70px] h-[30px] bg-[#d70018]/25 rounded select-none">
                                <button onClick={() => removeFromCart(product._id)} className="px-1">-</button>
                                <span>{cartItems[product._id]}</span>
                                <button onClick={() => addToCart(product._id)} className="px-1">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;