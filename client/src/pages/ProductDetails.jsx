import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
    const { products, addToCart } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item) => item._id === id);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        if (products.length > 0 && product) {
            const productsCopy = products.filter((item) => item.category === product.category && item._id !== id);
            setRelatedProducts(productsCopy.slice(0, 5));
        }
    }, [products, product, id]);

    useEffect(() => {
        setThumbnail(product?.image?.[0] || null);
    }, [product]);

    return product && (
        <div className="mt-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl mx-auto">

                {/* Breadcrumb */}
                <p className="text-sm text-gray-600">
                    <Link to="/">Home</Link> / 
                    <Link to="/products"> Products</Link> / 
                    <Link to={`/products/${product.category.toLowerCase()}`}> {product.category}</Link> / 
                    <span className="text-[#d70018]"> {product.name}</span>
                </p>

                {/* Product Detail */}
                <div className="flex flex-col md:flex-row gap-10 mt-4">
                    <div className="flex gap-3">
                        {/* Thumbnails */}
                        <div className="flex flex-col gap-3">
                            {product.image.map((image, index) => (
                                <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-300 rounded overflow-hidden cursor-pointer">
                                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="border border-gray-300 rounded overflow-hidden max-w-[400px] w-full">
                            <img src={thumbnail} alt="Selected product" className="w-full" />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="text-sm w-full md:w-1/2">
                        <h1 className="text-3xl font-medium">{product.name}</h1>

                        <div className="flex items-center gap-0.5 mt-1">
                            {Array(5).fill('').map((_, i) => (
                                <img key={i} src={i < 4 ? assets.star_icon : assets.star_dull_icon} alt="" className="md:w-4 w-3.5" />
                            ))}
                            <p className="text-base ml-2">(4)</p>
                        </div>

                        <div className="mt-6">
                            <p className="text-gray-500/70 line-through">Giá gốc:{formatVND(product.price)}</p>
                            <p className="text-2xl font-medium">Giá ưu đãi: <span className="text-[#d70018]">{formatVND(product.offerPrice)}</span></p>
                            <span className="text-gray-500/70">(Đã bao gồm phí VAT)</span>
                        </div>

                        <p className="text-base font-medium mt-6">Mô tả</p>
                        <ul className="list-disc ml-4 text-gray-500/70">
                            {product.description.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>

                        <div className="flex flex-col sm:flex-row items-center mt-10 gap-4 text-base">
                            <button
                                onClick={() => addToCart(product._id)}
                                className="w-full py-3.5 font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
                            >
                                Thêm vào giỏ hàng
                            </button>
                            <button
                                onClick={() => { addToCart(product._id); navigate("/cart"); }}
                                className="w-full py-3.5 font-medium bg-[#d70018] text-white hover:bg-[#a7091a] transition"
                            >
                                Mua hàng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="flex flex-col items-center mt-20">
                    <div className="flex flex-col items-center w-max">
                        <p className="text-3xl font-medium">Sản phẩm liên quan</p>
                        <div className="w-20 h-0.5 bg-[#d70018] rounded-full mt-2"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6 w-full">
                        {relatedProducts.filter((p) => p.inStock).map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>

                    <button
                        onClick={() => { navigate('/products'); scrollTo(0, 0); }}
                        className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-[#d70018] hover:bg-[#a7091a] hover:text-white transition"
                    >
                        Xem tất cả
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;