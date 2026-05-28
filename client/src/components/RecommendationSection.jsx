import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "./ProductCard";

/**
 * RecommendationSection - Component hiển thị danh sách sản phẩm gợi ý
 * Props:
 *   - title: string - tiêu đề section
 *   - subtitle: string - mô tả phụ
 *   - products: array - danh sách sản phẩm
 *   - loading: bool
 *   - badge: string - badge label (e.g. "AI Powered")
 *   - badgeColor: string - màu badge
 */
const RecommendationSection = ({
    title = "Gợi ý cho bạn",
    subtitle = "",
    products = [],
    loading = false,
    badge = null,
    badgeColor = "bg-red-100 text-red-600",
    maxItems = 10,
}) => {
    const sliderRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const displayed = useMemo(
        () => products.filter(p => p.inStock !== false).slice(0, maxItems),
        [products, maxItems]
    );
    const canSlide = displayed.length > 5;

    const scrollProducts = useCallback((direction) => {
        if (!sliderRef.current) return;

        const firstProduct = sliderRef.current.firstElementChild;
        const gap = parseFloat(getComputedStyle(sliderRef.current).columnGap) || 0;
        const scrollAmount = firstProduct
            ? firstProduct.getBoundingClientRect().width + gap
            : sliderRef.current.clientWidth;

        sliderRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }, []);

    useEffect(() => {
        if (!canSlide) return undefined;
        if (isPaused) return undefined;

        const slider = sliderRef.current;
        if (!slider) return undefined;

        const timer = setInterval(() => {
            const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
            if (maxScrollLeft <= 0) return;

            if (slider.scrollLeft >= maxScrollLeft - 4) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                scrollProducts("right");
            }
        }, 3500);

        return () => clearInterval(timer);
    }, [canSlide, displayed.length, isPaused, scrollProducts]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-3 md:p-5 w-full mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (displayed.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-5 w-full mb-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-xl md:text-2xl font-bold text-gray-800 uppercase">{title}</p>
                        {badge && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>

                {canSlide && (
                    <div className="hidden sm:flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollProducts("left")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#d70018] hover:text-[#d70018] transition-colors"
                            aria-label="Xem sản phẩm trước"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollProducts("right")}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-[#d70018] hover:text-[#d70018] transition-colors"
                            aria-label="Xem sản phẩm tiếp theo"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Product Slider */}
            <div
                ref={sliderRef}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {displayed.map((product, index) => (
                    <div
                        key={product._id || index}
                        className="shrink-0 basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-1.5rem)/3)] md:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-4rem)/5)]"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationSection;
