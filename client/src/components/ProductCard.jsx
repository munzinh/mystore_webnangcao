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

    return product && (
        <div
            onClick={() => {
                navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                scrollTo(0, 0);
            }}
            className="border border-gray-300 rounded-md p-3 bg-white w-full hover:shadow-md transition"
        >
            {/* Hình ảnh */}
            <div className="group cursor-pointer flex items-center justify-center h-32 mb-3">
                <img className="group-hover:scale-105 transition h-full object-contain" src={product.image[0]} alt={product.name} />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="text-gray-500/70 text-sm flex flex-col gap-1">
                <p className="truncate">{product.category}</p>
                <p className="text-gray-800 font-semibold text-base truncate">{product.name}</p>

                {/* Giá */}
                <p className="text-lg font-semibold text-[#d70018]">
                    {formatCurrency(product.offerPrice)}{" "}
                    <span className="text-gray-500/60 text-sm line-through">
                        {formatCurrency(product.price)}
                    </span>
                </p>

                {/* Đánh giá và nút Add */}
                <div className="flex items-center justify-between mt-2">
                    {/* Đánh giá */}
                    <div className="flex items-center gap-0.5">
                        {Array(5).fill('').map((_, i) => (
                            <img key={i} className='w-3.5' src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" />
                        ))}
                        <p className="ml-1 text-xs text-gray-600">(4)</p>
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
                                Add
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