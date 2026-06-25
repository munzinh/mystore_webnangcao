import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
const LOCAL_TOKEN_KEY = 'mystore_token';

const getBackendUrl = () => {
    const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim().replace(/^['"]|['"]$/g, '');

    if (configuredUrl) return configuredUrl;

    if (import.meta.env.PROD) {
        // Frontend deployed separately on Vercel; backend is in a different Vercel app.
        return 'https://mystore-webnangcao-backend.vercel.app';
    }

    return 'http://localhost:4000';
};

axios.defaults.baseURL = getBackendUrl();
axios.defaults.headers.get['Cache-Control'] = 'no-cache';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();
    const initialToken = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_TOKEN_KEY) : null;
    const [token, setToken] = useState(initialToken);

    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common.Authorization;
    }

    const setAuthToken = useCallback((newToken) => {
        if (typeof window === 'undefined') return;
        if (newToken) {
            localStorage.setItem(LOCAL_TOKEN_KEY, newToken);
            axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            setToken(newToken);
        } else {
            localStorage.removeItem(LOCAL_TOKEN_KEY);
            delete axios.defaults.headers.common.Authorization;
            setToken(null);
        }
    }, []);

    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState([]);
    const [behaviorVersion, setBehaviorVersion] = useState(0);

    const cartSyncTimer = useRef(null);
    const cartSyncVersion = useRef(0);

    const fetchSeller = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            setIsSeller(!!data.success);
        } catch {
            setIsSeller(false);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth');
            if (data.success) {
                setUser(data.user);
                setCartItems(data.user?.cartItems || {});
                return data.user;
            }
        } catch {
            setUser(null);
            setCartItems({});
        }
        setUser(null);
        setCartItems({});
        return null;
    }, []);

    const fetchProducts = useCallback(async () => {
        setIsProductsLoading(true);
        try {
            const { data } = await axios.get('/api/product/list');
            if (data.success) {
                setProducts(data.products || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setIsProductsLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        setIsCategoriesLoading(true);
        try {
            const { data } = await axios.get('/api/category/list');
            if (data.success) {
                setCategories((data.categories || []).filter(category => category.isActive !== false));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Fetch categories error:", error);
            toast.error("Không thể tải danh mục");
        } finally {
            setIsCategoriesLoading(false);
        }
    }, []);

    const trackBehavior = useCallback(async (productId, eventType, metadata = {}) => {
        if (!user) return;
        try {
            const { data } = await axios.post('/api/behavior/track', { productId, eventType, metadata });
            if (data.success) {
                setBehaviorVersion((version) => version + 1);
            }
        } catch {
            // Silent fail - không ảnh hưởng UX
        }
    }, [user]);

    const addToCart = useCallback((itemId) => {
        setCartItems((current) => ({
            ...current,
            [itemId]: (Number(current?.[itemId]) || 0) + 1,
        }));
        toast.success("Đã thêm vào giỏ hàng");
        if (user) trackBehavior(itemId, 'add_to_cart');
    }, [trackBehavior, user]);

    const updateCartItem = useCallback((itemId, quantity) => {
        const nextQuantity = Number(quantity) || 0;
        setCartItems((current) => {
            const nextCart = { ...(current || {}) };
            if (nextQuantity <= 0) {
                delete nextCart[itemId];
            } else {
                nextCart[itemId] = nextQuantity;
            }
            return nextCart;
        });
        toast.success("Đã cập nhật giỏ hàng", { id: "cart-update" });
    }, []);

    const removeFromCart = useCallback((itemId) => {
        setCartItems((current) => {
            const nextCart = { ...(current || {}) };
            if (nextCart[itemId]) {
                nextCart[itemId] -= 1;
            }
            if (!nextCart[itemId] || nextCart[itemId] <= 0) {
                delete nextCart[itemId];
            }
            return nextCart;
        });
        toast.success("Đã xóa khỏi giỏ hàng");
    }, []);

    const cartCount = useMemo(() => Object.values(cartItems || {})
        .reduce((total, quantity) => total + Number(quantity || 0), 0), [cartItems]);

    const cartAmount = useMemo(() => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }, [cartItems, products]);

    const getCartCount = useCallback(() => cartCount, [cartCount]);
    const getCartAmount = useCallback(() => cartAmount, [cartAmount]);

    const refreshAppData = useCallback(async () => {
        const [currentUser] = await Promise.all([
            fetchUser(),
            fetchSeller(),
            fetchProducts(),
            fetchCategories(),
        ]);

        return currentUser;
    }, [fetchCategories, fetchProducts, fetchSeller, fetchUser]);

    useEffect(() => {
        refreshAppData();
    }, [refreshAppData]);

    useEffect(() => {
        if (!user) return undefined;

        if (cartSyncTimer.current) {
            clearTimeout(cartSyncTimer.current);
        }

        const currentVersion = ++cartSyncVersion.current;
        cartSyncTimer.current = setTimeout(async () => {
            try {
                const { data } = await axios.post('/api/cart/update', { cartItems });
                if (!data.success && currentVersion === cartSyncVersion.current) {
                    toast.error(data.message);
                }
            } catch (error) {
                if (currentVersion === cartSyncVersion.current) {
                    toast.error(error.message);
                }
            }
        }, 250);

        return () => {
            if (cartSyncTimer.current) {
                clearTimeout(cartSyncTimer.current);
            }
        };
    }, [cartItems, user]);

    const value = useMemo(() => ({
        navigate,
        user,
        setUser,
        setIsSeller,
        isSeller,
        showUserLogin,
        setShowUserLogin,
        products,
        setProducts,
        isProductsLoading,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        setSearchQuery,
        getCartAmount,
        getCartCount,
        axios,
        fetchUser,
        fetchProducts,
        categories,
        isCategoriesLoading,
        fetchCategories,
        refreshAppData,
        setCartItems,
        trackBehavior,
        behaviorVersion,
        token,
        setAuthToken,
    }), [
        navigate,
        user,
        isSeller,
        showUserLogin,
        products,
        isProductsLoading,
        currency,
        addToCart,
        updateCartItem,
        removeFromCart,
        cartItems,
        searchQuery,
        getCartAmount,
        getCartCount,
        fetchUser,
        fetchProducts,
        categories,
        isCategoriesLoading,
        fetchCategories,
        refreshAppData,
        trackBehavior,
        behaviorVersion,
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
