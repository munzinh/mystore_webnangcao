import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";
import RecommendationSection from "../components/RecommendationSection";
import { SURVEY_AFTER_PURCHASE_KEY } from "../components/RecommendationSurveyPopup";

const Cart = () => {
    const { products, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, axios, user, setCartItems, fetchProducts } = useAppContext();
    const [addresses, setAddresses] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentOption, setPaymentOption] = useState("COD");
    const [boughtTogether, setBoughtTogether] = useState([]);
    const [boughtLoading, setBoughtLoading] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const previousCartIdsRef = useRef([]);

    // Hàm định dạng tiền tệ VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const cartArray = useMemo(() => Object.entries(cartItems || {})
        .map(([productId, quantity]) => {
            const product = products.find((item) => item._id === productId);
            return product ? { ...product, quantity } : null;
        })
        .filter(Boolean), [cartItems, products]);

    const selectedCartArray = useMemo(
        () => cartArray.filter((item) => selectedProductIds.includes(item._id)),
        [cartArray, selectedProductIds]
    );

    const selectedAmount = useMemo(() => selectedCartArray
        .reduce((total, item) => total + item.offerPrice * item.quantity, 0), [selectedCartArray]);

    const isAllSelected = cartArray.length > 0 && selectedProductIds.length === cartArray.length;

    const getUserAddress = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/address/get')
            if (data.success) {
                setAddresses(data.addresses);
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0]);
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [axios])

    // Xử lý đặt hàng
    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Vui lòng chọn địa chỉ giao hàng");
            }
            if (selectedCartArray.length === 0) {
                return toast.error("Vui lòng chọn ít nhất một sản phẩm");
            }

            const orderItems = selectedCartArray.map(item => ({ product: item._id, quantity: item.quantity }));
            const remainingCartItems = { ...(cartItems || {}) };
            selectedCartArray.forEach((item) => {
                delete remainingCartItems[item._id];
            });

            //Place Order with COD
            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: orderItems,
                    address: selectedAddress._id
                })
                if (data.success) {
                    toast.success(data.message);
                    localStorage.setItem(SURVEY_AFTER_PURCHASE_KEY, "true");
                    setCartItems(remainingCartItems);
                    fetchProducts();
                    navigate('/my-orders')
                } else {
                    toast.error(data.message)
                }
            } else {
                //Place Order with stripe
                if (paymentOption === "Online") {
                    const { data } = await axios.post('/api/order/stripe', {
                        userId: user._id,
                        items: orderItems,
                        address: selectedAddress._id
                    })
                    if (data.success) {
                        localStorage.setItem(SURVEY_AFTER_PURCHASE_KEY, "true");
                        window.location.replace(data.url)
                    } else {
                        toast.error(data.message)
                    }
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            getUserAddress();
        }
    }, [getUserAddress, user])

    useEffect(() => {
        setSelectedProductIds((current) => {
            const cartIds = cartArray.map((item) => item._id);
            const previousCartIds = previousCartIdsRef.current;
            previousCartIdsRef.current = cartIds;

            return cartIds.filter((id) => current.includes(id) || !previousCartIds.includes(id));
        });
    }, [cartArray]);

    const toggleProductSelection = (productId) => {
        setSelectedProductIds((current) => (
            current.includes(productId)
                ? current.filter((id) => id !== productId)
                : [...current, productId]
        ));
    };

    const toggleAllProducts = () => {
        setSelectedProductIds(isAllSelected ? [] : cartArray.map((item) => item._id));
    };

    // Fetch "Frequently Bought Together" dựa trên sản phẩm được chọn đầu tiên
    useEffect(() => {
        const firstCartItem = selectedProductIds[0] || Object.keys(cartItems || {})[0];
        if (!firstCartItem) {
            setBoughtTogether([]);
            return;
        }

        const fetchBoughtTogether = async () => {
            setBoughtLoading(true);
            try {
                const { data } = await axios.get(`/api/recommendations/bought-together/${firstCartItem}`);
                if (data.success && data.recommendations?.length) {
                    // Loại bỏ sản phẩm đã trong giỏ hàng
                    const cartIds = new Set(Object.keys(cartItems || {}));
                    setBoughtTogether(data.recommendations.filter(p => !cartIds.has(p._id)));
                }
            } catch (err) {
                console.log(err);
            } finally {
                setBoughtLoading(false);
            }
        };
        fetchBoughtTogether();
    }, [axios, cartItems, selectedProductIds]);

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16 mx-auto max-w-screen-xl px-4">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Giỏ hàng <span className="text-sm text-[#d70018]">{getCartCount()} Sản phẩm</span>
                </h1>

                <div className="grid grid-cols-[44px_2fr_1fr_140px_1fr] text-gray-500 text-base font-medium pb-3">
                    <button
                        type="button"
                        onClick={toggleAllProducts}
                        className={`h-5 w-5 rounded border transition ${isAllSelected ? "border-[#d70018] bg-[#d70018]" : "border-gray-300 bg-white"}`}
                        aria-label={isAllSelected ? "Bỏ chọn tất cả sản phẩm" : "Chọn tất cả sản phẩm"}
                    >
                        {isAllSelected && <span className="block text-xs leading-5 text-white">✓</span>}
                    </button>
                    <p className="text-left">Sản phẩm</p>
                    <p className="text-center">Giá</p>
                    <p className="text-center">Số lượng</p>
                    <p className="text-center">Hoàn trả</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[44px_2fr_1fr_140px_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <button
                            type="button"
                            onClick={() => toggleProductSelection(product._id)}
                            className={`h-5 w-5 rounded border transition ${selectedProductIds.includes(product._id) ? "border-[#d70018] bg-[#d70018]" : "border-gray-300 bg-white"}`}
                            aria-label={selectedProductIds.includes(product._id) ? `Bỏ chọn ${product.name}` : `Chọn ${product.name}`}
                        >
                            {selectedProductIds.includes(product._id) && <span className="block text-xs leading-5 text-white">✓</span>}
                        </button>
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                const categoryPath = product.category?.slug || product.category?.name || product.category;
                                navigate(`/products/${categoryPath.toLowerCase()}/${product._id}`);
                                scrollTo(0, 0);
                            }}
                                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[#d70018]">{formatCurrency(product.offerPrice * product.quantity)}</p>
                        <div className="mx-auto flex h-9 w-[112px] items-center justify-between overflow-hidden rounded-lg border border-gray-300 bg-white">
                            <button
                                type="button"
                                onClick={() => updateCartItem(product._id, Math.max(1, Number(product.quantity) - 1))}
                                className="h-full w-9 text-lg font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-[#d70018]"
                                aria-label={`Giảm số lượng ${product.name}`}
                            >
                                -
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-gray-800">{product.quantity}</span>
                            <button
                                type="button"
                                onClick={() => updateCartItem(product._id, Number(product.quantity) + 1)}
                                className="h-full w-9 text-lg font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-[#d70018]"
                                aria-label={`Tăng số lượng ${product.name}`}
                            >
                                +
                            </button>
                        </div>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>
                ))}

                <button onClick={() => { navigate("/products"); }} className="group cursor-pointer flex items-center mt-8 gap-2 text-[#d70018] font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Tiếp tục mua hàng
                </button>

                {/* Thường mua cùng nhau */}
                <RecommendationSection
                    title="Thường mua cùng nhau"
                    subtitle="Khách hàng thường mua các sản phẩm này cùng lúc"
                    products={boughtTogether}
                    loading={boughtLoading}
                    badge="Bundle"
                    badgeColor="bg-green-100 text-green-600"
                    maxItems={5}
                />

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Đơn hàng</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Địa chỉ giao hàng</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "Chưa có địa chỉ"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-[#d70018] hover:underline cursor-pointer">
                            Thay đổi
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {addresses.map((address) => (
                                    <p key={address._id} onClick={() => { setSelectedAddress(address); setShowAddress(false); }} className="text-gray-500 p-2 hover:bg-gray-100">
                                        {address.street}, {address.city}, {address.state}, {address.country}
                                    </p>
                                ))}
                                <p onClick={() => navigate("/add-address")} className="text-[#d70018] text-center cursor-pointer p-2 hover:text-[#a7091a]">
                                    Thêm địa chỉ mới
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Phương thức thanh toán</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Thanh toán khi nhận hàng</option>
                        <option value="Online">Thanh toán online</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Đã chọn</span><span>{selectedCartArray.length}/{cartArray.length} sản phẩm</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Giá</span><span>{formatCurrency(selectedAmount)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Phí giao hàng</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>VAT</span><span>Đã bao gồm phí VAT</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Tổng tiền:</span>
                        <span className="text-[#d70018]">{formatCurrency(selectedAmount)}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-[#d70018] text-white font-medium hover:bg-[#a7091a] transition">
                    {paymentOption === "COD" ? "Đặt hàng" : "Tiến hành thanh toán"}
                </button>
            </div>
        </div>
    ) : (
        <div className="text-center text-gray-500">Không có đơn hàng</div>
    );
};

export default Cart;
