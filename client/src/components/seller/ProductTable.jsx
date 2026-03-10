import React from 'react';

const ProductTable = ({ products, onEdit, onDelete, onToggleStock }) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left table-auto">
                <thead className="text-gray-700 bg-gray-50 text-sm border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold w-16">Hình ảnh</th>
                        <th className="px-4 py-3 font-semibold">Tên sản phẩm</th>
                        <th className="px-4 py-3 font-semibold w-32">Danh mục</th>
                        <th className="px-4 py-3 font-semibold w-36">Giá gốc</th>
                        <th className="px-4 py-3 font-semibold w-36">Giá ưu đãi</th>
                        <th className="px-4 py-3 font-semibold text-center w-28">Kho hàng</th>
                        <th className="px-4 py-3 font-semibold text-center w-28">Trạng thái</th>
                        <th className="px-4 py-3 font-semibold text-center w-28">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-600 divide-y divide-gray-200">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                                Không tìm thấy sản phẩm nào phù hợp với bộ lọc
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition items-center">
                                <td className="px-4 py-3">
                                    <div className="w-12 h-12 border border-gray-200 rounded flex items-center justify-center overflow-hidden bg-white">
                                        <img src={product.image && product.image.length > 0 ? product.image[0] : ''} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    <div className="line-clamp-2" title={product.name}>{product.name}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{product.category}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                                    {new Intl.NumberFormat('vi-VN').format(product.price)}₫
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-red-600 font-medium">
                                    {new Intl.NumberFormat('vi-VN').format(product.offerPrice)}₫
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            onChange={() => onToggleStock(product._id, !product.inStock)}
                                            checked={product.inStock}
                                            type="checkbox"
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                                            title="Sửa"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(product._id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Xóa"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
