import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import RecommendationSection from "../components/RecommendationSection";
import ReviewSection from "../components/ReviewSection";
import axios from "axios";

const ProductDetails = () => {
    const { products, addToCart, user, trackBehavior } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const product = products.find((item) => item._id === id);

    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        if (id) {
            const fetchRecommendations = async () => {
                setRelatedLoading(true);
                try {
                    const { data } = await axios.get(`/api/recommendations/product/${id}`);
                    if (data.success) {
                        setRelatedProducts(data.recommendations);
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setRelatedLoading(false);
                }
            };

            const fetchAvgRating = async () => {
                try {
                    const { data } = await axios.get(`/api/review/${id}`);
                    if (data.success) {
                        setAvgRating(data.avgRating);
                        setTotalReviews(data.totalReviews);
                    }
                } catch (error) {
                    console.log(error);
                }
            };

            fetchRecommendations();
            fetchAvgRating();
            if (user) trackBehavior(id, 'view');
        }
    }, [id, user]);

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
                                <svg key={i} className={`md:w-4 w-3.5 h-3.5 md:h-4 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <p className="text-sm ml-2 text-gray-500">{avgRating > 0 ? `${avgRating}/5 (${totalReviews} đánh giá)` : 'Chưa có đánh giá'}</p>
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

                <ReviewSection productId={id} />

                {/* Related Products */}
                <RecommendationSection
                    title="Sản phẩm tương tự"
                    subtitle="Dựa trên danh mục và đặc điểm sản phẩm"
                    products={relatedProducts}
                    loading={relatedLoading}
                    badge="Similar"
                    badgeColor="bg-gray-100 text-gray-600"
                />

            </div>
        </div>
    );
};

export default ProductDetails;