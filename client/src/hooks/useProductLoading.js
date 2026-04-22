import { useAppContext } from "../context/AppContext";

/**
 * useProductLoading hook
 * Provides filtered access to products and their loading state.
 */
export const useProductLoading = () => {
    const { products, isProductsLoading, fetchProducts } = useAppContext();

    /**
     * Helper to get a single product by ID with loading context
     */
    const getProductById = (id) => {
        if (isProductsLoading) return null;
        return products.find(p => p._id === id) || null;
    };

    /**
     * Filter products by category
     */
    const getProductsByCategory = (category) => {
        if (isProductsLoading) return [];
        return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    };

    return {
        products,
        isLoading: isProductsLoading,
        fetchProducts,
        getProductById,
        getProductsByCategory
    };
};
