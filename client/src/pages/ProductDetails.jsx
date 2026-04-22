import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import RecommendationSection from "../components/RecommendationSection";
import ReviewSection from "../components/ReviewSection";
import { SkeletonProductDetails } from "../components/Skeleton";
import axios from "axios";

const ProductDetails = () => {
    const { products, isProductsLoading, addToCart, user, trackBehavior } = useAppContext();
    const navigate = useNavigate();
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    const product = products.find((item) => item._id === id);

    const formatVND = (amount) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    // ── Fetch recommendations + ratings ──────────────────────────────────────
    useEffect(() => {
        if (!id) return;

        const fetchRecommendations = async () => {
            setRelatedLoading(true);
            try {
                const { data } = await axios.get(`/api/recommendations/product/${id}`);
                if (data.success) setRelatedProducts(data.recommendations);
            } catch (error) {
                console.error(error);
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
                console.error(error);
            }
        };

        fetchRecommendations();
        fetchAvgRating();
        if (user) trackBehavior(id, "view");
    }, [id, user]);

    // ── Variant state ─────────────────────────────────────────────────────────
    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

    // Reset khi chuyển sang product khác
    useEffect(() => {
        setSelectedVariantIdx(0);
        setThumbnail(product?.image?.[0] ?? null);
    }, [product]);

    const hasVariants = (product?.variants?.length ?? 0) > 0;
    const selectedVariant = hasVariants ? product.variants[selectedVariantIdx] : null;

    // Mỗi màu / dung lượng / phiên bản có giá và tồn kho riêng
    const displayPrice      = selectedVariant?.price      ?? product?.price;
    const displayOfferPrice = selectedVariant?.offerPrice ?? product?.offerPrice;
    // inStock của variant là Number (số lượng), 0 = hết hàng
    const variantStock  = selectedVariant != null ? (selectedVariant.inStock ?? 0) : (product?.inStock ? 1 : 0);
    const isOutOfStock  = variantStock === 0;

    // ── Thumbnail refs (scroll-into-view) ─────────────────────────────────────
    // Dùng array bình thường, không cần useRef wrapper
    const thumbEls = [];
    const setThumbRef = (el, idx) => { thumbEls[idx] = el; };

    // Chọn variant → đổi ảnh + scroll thumb + highlight
    const handleVariantSelect = (idx) => {
        if (product.variants[idx]?.inStock === 0) return; // guard
        setSelectedVariantIdx(idx);
        const targetImg = product.image[idx] ?? product.image[0] ?? null;
        setThumbnail(targetImg);
        thumbEls[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    };

    // Click thủ công vào thumbnail → chỉ đổi ảnh, giữ nguyên variant
    const handleThumbnailClick = (image) => setThumbnail(image);

    // ── Pre-render checks ────────────────────────────────────────────────────
    if (isProductsLoading) {
        return <SkeletonProductDetails />;
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="text-xl text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
                <Link to="/" className="text-[#d70018] font-medium hover:underline">Quay về trang chủ</Link>
            </div>
        );
    }

    return (
        <div className="mt-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-xl mx-auto">

                {/* Breadcrumb */}
                <p className="text-sm text-gray-600">
                    <Link to="/">Home</Link>{" "}/{" "}
                    <Link to="/products">Products</Link>{" "}/{" "}
                    <Link to={`/products/${product.category.toLowerCase()}`}>{product.category}</Link>{" "}/{" "}
                    <span className="text-[#d70018]">{product.name}</span>
                </p>

                {/* ── Main layout ── */}
                <div className="flex flex-col md:flex-row gap-10 mt-4">

                    {/* ── Gallery ─────────────────────────────────────────── */}
                    <div className="flex gap-3 shrink-0">

                        {/* Vertical thumbnail strip */}
                        <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto no-scrollbar">
                            {product.image.map((image, index) => {
                                const isActive      = image === thumbnail;
                                const isVariantThumb = hasVariants && index === selectedVariantIdx;

                                return (
                                    <div
                                        key={index}
                                        ref={(el) => setThumbRef(el, index)}
                                        onClick={() => handleThumbnailClick(image)}
                                        className={[
                                            "border max-w-24 rounded overflow-hidden cursor-pointer transition-all duration-200",
                                            isActive
                                                ? "border-[#d70018] ring-1 ring-[#d70018]"
                                                : isVariantThumb
                                                    ? "border-[#d70018]/40"
                                                    : "border-gray-300 hover:border-gray-400",
                                        ].join(" ")}
                                    >
                                        <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full object-cover" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Main image — key thay đổi để trigger CSS fade animation */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden max-w-[400px] w-full bg-white">
                            <img
                                key={thumbnail}
                                src={thumbnail}
                                alt="Ảnh sản phẩm"
                                className="w-full object-contain product-image-fade"
                            />
                        </div>
                    </div>

                    {/* ── Product info ─────────────────────────────────────── */}
                    <div className="text-sm w-full md:w-1/2">
                        <h1 className="text-3xl font-medium">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-0.5 mt-1">
                            {Array(5).fill("").map((_, i) => (
                                <svg
                                    key={i}
                                    className={`md:w-4 w-3.5 h-3.5 md:h-4 ${i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`}
                                    fill="currentColor" viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <p className="text-sm ml-2 text-gray-500">
                                {avgRating > 0
                                    ? `${avgRating}/5 (${totalReviews} đánh giá)`
                                    : "Chưa có đánh giá"}
                            </p>
                        </div>

                        {/* ── Variant selector ─────────────────────────────── */}
                        {/* Chỉ hiển thị khi có ít nhất 2 variants */}
                        {hasVariants && product.variants.length > 1 && (
                            <div className="mt-5">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Phiên bản:{" "}
                                    <span className="text-[#d70018] font-semibold">
                                        {product.variants[selectedVariantIdx]?.variantLabel
                                            || `Phiên bản ${selectedVariantIdx + 1}`}
                                    </span>
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v, idx) => {
                                        // Mỗi variant có tồn kho riêng (inStock là Number)
                                        const outOfStock = (v.inStock ?? 0) === 0;
                                        const isSelected = selectedVariantIdx === idx;

                                        return (
                                            <button
                                                key={idx}
                                                id={`variant-btn-${idx}`}
                                                onClick={() => handleVariantSelect(idx)}
                                                disabled={outOfStock}
                                                title={outOfStock ? "Hết hàng" : `Còn ${v.inStock} sản phẩm`}
                                                className={[
                                                    "relative px-3 py-1.5 text-sm rounded-md border transition-all duration-200 select-none",
                                                    isSelected
                                                        ? "border-[#d70018] bg-[#d70018]/5 text-[#d70018] font-semibold ring-1 ring-[#d70018]"
                                                        : outOfStock
                                                            ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                                            : "border-gray-300 text-gray-700 hover:border-[#d70018]/60 hover:text-[#d70018] cursor-pointer",
                                                ].join(" ")}
                                            >
                                                {/* Gạch chéo overlay khi hết hàng */}
                                                {outOfStock && (
                                                    <span className="absolute inset-0 flex items-center pointer-events-none overflow-hidden rounded-md">
                                                        <span className="w-full h-px bg-gray-300 rotate-[-14deg]" />
                                                    </span>
                                                )}
                                                {v.variantLabel || `Phiên bản ${idx + 1}`}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tồn kho của variant đang chọn */}
                                <p className="mt-2 text-xs">
                                    {isOutOfStock
                                        ? <span className="text-red-500 font-medium">⚠ Phiên bản này đã hết hàng</span>
                                        : <span className="text-green-600">✓ Còn {variantStock} sản phẩm</span>
                                    }
                                </p>
                            </div>
                        )}

                        {/* ── Giá (per-variant: mỗi màu/dung lượng giá khác nhau) ── */}
                        <div className="mt-6">
                            <p className="text-gray-500/70 line-through">
                                Giá gốc: {formatVND(displayPrice)}
                            </p>
                            <p className="text-2xl font-medium">
                                Giá ưu đãi:{" "}
                                <span className="text-[#d70018]">{formatVND(displayOfferPrice)}</span>
                            </p>
                            <span className="text-gray-500/70">(Đã bao gồm phí VAT)</span>

                            {/* Số tiền tiết kiệm */}
                            {displayPrice > displayOfferPrice && (
                                <p className="mt-1 text-xs text-green-600 font-medium">
                                    Tiết kiệm: {formatVND(displayPrice - displayOfferPrice)}{" "}
                                    ({Math.round((1 - displayOfferPrice / displayPrice) * 100)}%)
                                </p>
                            )}
                        </div>

                        {/* Mô tả */}
                        <p className="text-base font-medium mt-6">Mô tả</p>
                        <ul className="list-disc ml-4 text-gray-500/70">
                            {product.description.map((desc, index) => (
                                <li key={index}>{desc}</li>
                            ))}
                        </ul>

                        {/* ── Actions ──────────────────────────────────────── */}
                        <div className="flex flex-col sm:flex-row items-center mt-10 gap-4 text-base">
                            <button
                                id="add-to-cart-btn"
                                onClick={() => addToCart(product._id)}
                                disabled={isOutOfStock}
                                className={[
                                    "w-full py-3.5 font-medium transition",
                                    isOutOfStock
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-gray-100 text-gray-800/80 hover:bg-gray-200",
                                ].join(" ")}
                            >
                                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                            </button>
                            <button
                                id="buy-now-btn"
                                onClick={() => {
                                    if (!isOutOfStock) {
                                        addToCart(product._id);
                                        navigate("/cart");
                                    }
                                }}
                                disabled={isOutOfStock}
                                className={[
                                    "w-full py-3.5 font-medium transition",
                                    isOutOfStock
                                        ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                                        : "bg-[#d70018] text-white hover:bg-[#a7091a]",
                                ].join(" ")}
                            >
                                {isOutOfStock ? "Hết hàng" : "Mua hàng"}
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