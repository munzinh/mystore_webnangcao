import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
 *   - emptyMessage: string - message khi rỗng
 */
const RecommendationSection = ({
    title = "Gợi ý cho bạn",
    subtitle = "",
    products = [],
    loading = false,
    badge = null,
    badgeColor = "bg-red-100 text-red-600",
    emptyMessage = "Chưa có sản phẩm gợi ý",
    maxItems = 8,
}) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg animate-pulse h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    const displayed = products.filter(p => p.inStock !== false).slice(0, maxItems);

    if (displayed.length === 0) return null;

    return (
        <div className="mt-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-semibold text-gray-800">{title}</p>
                        {badge && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    <div className="w-16 h-0.5 bg-[#d70018] rounded-full mt-1"></div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                {displayed.map((product, index) => (
                    <ProductCard key={product._id || index} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RecommendationSection;
