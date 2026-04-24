import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProduct from './pages/AllProduct';
import CategoryPage from './pages/CategoryPage';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import ManageCategories from './pages/seller/ManageCategories';
import ManageBrands from './pages/seller/ManageBrands';
import Loading from './components/Loading';
import OnlinePaymentPolicy from './pages/OnlinePaymentPolicy';
import DeliveryPolicy from './pages/DeliveryPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import WarrantyPolicy from './pages/WarrantyPolicy';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
    const isSellerPath = useLocation().pathname.includes("seller");
    const { showUserLogin, isSeller } = useAppContext();

    return (
        <div className='text-default min-h-screen textgray-700 bg-[#f4f6f8]'>
            {isSellerPath ? null : <Navbar />}
            {showUserLogin ? <Login /> : null}
            <Toaster />
            <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<AllProduct />} />
                    <Route path='/products/:category' element={<CategoryPage />} />
                    <Route path='/products/:category/:id' element={<ProductDetails />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/add-address' element={<AddAddress />} />
                    <Route path='/my-orders' element={<MyOrders />} />
                    <Route path='/loader' element={<Loading />} />
                    <Route path='/online-payment-policy' element={<OnlinePaymentPolicy />} />
                    <Route path='/delivery-policy' element={<DeliveryPolicy />} />
                    <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                    <Route path='/warranty-policy' element={<WarrantyPolicy />} />
                    <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
                        <Route index element={<AddProduct />} />
                        <Route path='product-list' element={<ProductList />} />
                        <Route path='orders' element={<Orders />} />
                        <Route path='categories' element={<ManageCategories />} />
                        <Route path='brands' element={<ManageBrands />} />
                    </Route>
                </Routes>
            </div>
            {!isSellerPath && <Footer />}

            {/* Đặt nút cuộn lên đầu trang ở đây để nó xuất hiện trên toàn bộ ứng dụng */}
            <ScrollToTop />
        </div>
        
    );
};


export default App;