import { useState } from "react";

const ProductOptions = ({ product }) => {
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [selectedStorage, setSelectedStorage] = useState(product.storage[0]);

    // Tính giá theo dung lượng
    const getPrice = () => {
        return selectedStorage.price;
    };

    return (
        <div className="mt-6 space-y-6">

            {/* Chọn màu */}
            <div>
                <h3 className="font-semibold mb-2">Màu sắc:</h3>
                <div className="flex gap-3">
                    {product.colors.map((color, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 border rounded-full text-sm transition 
                                ${selectedColor.name === color.name 
                                    ? "border-red-500 bg-red-50 text-red-600" 
                                    : "border-gray-300 hover:border-red-400"
                                }`}
                        >
                            {color.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chọn dung lượng */}
            <div>
                <h3 className="font-semibold mb-2">Dung lượng:</h3>
                <div className="flex gap-3">
                    {product.storage.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedStorage(item)}
                            className={`px-4 py-2 border rounded-lg text-sm transition 
                                ${selectedStorage.size === item.size 
                                    ? "border-red-500 bg-red-50 text-red-600" 
                                    : "border-gray-300 hover:border-red-400"
                                }`}
                        >
                            {item.size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Giá */}
            <div className="text-2xl font-bold text-red-600">
                {getPrice().toLocaleString()} đ
            </div>

            {/* Nút */}
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Thêm vào giỏ
                </button>
                <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Mua ngay
                </button>
            </div>
        </div>
    );
};

export default ProductOptions;