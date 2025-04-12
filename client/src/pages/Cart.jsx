import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
    const { products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems } = useAppContext();
    const [cartArray, setCartArray] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentOption, setPaymentOption] = useState("COD");

    // Hàm định dạng tiền tệ VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    
    // Tạo giỏ hàng từ cartItems và sản phẩm
    const getCart = () => {
        let temArray = [];
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key);
            if (product) {
                product.quantity = cartItems[key];
                temArray.push(product);
            }
        }
        setCartArray(temArray);
    };

    const getUserAddress = async () => {
        try {
            const {data} = await axios.get('/api/address/get')
            if(data.success){
                setAddresses(data.addresses);
                if(data.addresses.length > 0){
                    setSelectedAddress(data.addresses[0]);
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    // Xử lý đặt hàng
    const placeOrder = async () => {
        try {
            if (!selectedAddress) {
                return toast.error("Vui lòng chọn địa chỉ giao hàng");
            }

            //Place Order with COD
            if(paymentOption === "COD"){
                const {data}= await axios.post('/api/order/cod',{
                    userId: user._id,
                    items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    address: selectedAddress._id
                })
                if(data.success){
                    toast.success(data.message);
                    setCartItems({});
                    navigate('/my-orders')
                }else{
                toast.error(data.message)
                }
            }else{
                //Place Order with stripe
                if(paymentOption === "Online"){
                    const {data}= await axios.post('/api/order/stripe',{
                        userId: user._id,
                        items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                        address: selectedAddress._id
                    })
                    if(data.success){
                        window.location.replace(data.url)
                    }else{
                    toast.error(data.message)
                    }
               }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Cập nhật giỏ hàng khi sản phẩm thay đổi
    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart();
        }
    }, [products, cartItems]);


    useEffect(() => {
        if(user){
            getUserAddress();
        }
    },[user])

    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16 mx-auto max-w-screen-xl px-4">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Giỏ hàng <span className="text-sm text-[#d70018]">{getCartCount()} Sản phẩm</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Sản phẩm</p>
                    <p className="text-center">Giá</p>
                    <p className="text-center">Hoàn trả</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0); }} 
                            className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Số lượng:</p>
                                        <select onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                            value={cartItems[product._id]}
                                            className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[#d70018]">{formatCurrency(product.offerPrice * product.quantity)}</p>
                        <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6"/>
                        </button>
                    </div>
                ))}

                <button onClick={() => { navigate("/products"); }} className="group cursor-pointer flex items-center mt-8 gap-2 text-[#d70018] font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow"/>
                    Tiếp tục mua hàng
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Đơn hàng</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Địa chỉ giao hàng</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-[#d70018] hover:underline cursor-pointer">
                            Thay đổi
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {addresses.map((address, index) => (
                                    <p onClick={() => { setSelectedAddress(address); setShowAddress(false); }} className="text-gray-500 p-2 hover:bg-gray-100">
                                        {address.street}, {address.city}, {address.state}, {address.country}
                                    </p>
                                ))}
                                <p onClick={() => navigate("/add-address")} className="text-[#d70018] text-center cursor-pointer p-2 hover:text-[#a7091a]">
                                    Add address
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
                        <span>Giá</span><span>{formatCurrency(getCartAmount())}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Phí giao hàng</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>VAT</span><span>Đã bao gồm phí VAT</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Tổng tiền:</span>
                        <span className="text-[#d70018]">{formatCurrency(getCartAmount())}</span>
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