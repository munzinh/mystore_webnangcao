import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { FiMenu, FiSearch, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const [profileOpen, setProfileOpen] = React.useState(false);
    const profileMenuRef = useRef(null);
    const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios, setCartItems } = useAppContext();

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/user/logout')
            if (data.success) {
                toast.success(data.message);
                setUser(null);
                setCartItems({});
                setProfileOpen(false);
                setOpen(false);
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }


    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            navigate("/products");
        }
    }, [navigate, searchQuery]);

    useEffect(() => {
        const closeProfileMenu = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', closeProfileMenu);
        return () => document.removeEventListener('mousedown', closeProfileMenu);
    }, []);

    return (
        <nav className="bg-[#d70018] border-b border-[#b80014] shadow-md sticky top-0 z-2000">
            <div className="px-6 md:px-16 lg:px-24 xl:px-32">
                <div className="w-full max-w-[1200px] mx-auto h-16 flex items-center gap-6">
                    {/* Logo */}
                    <div className="shrink-0">
                        <NavLink to='/' onClick={() => setOpen(false)} className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            MyStore
                        </NavLink>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 text-white/95 font-medium shrink-0">
                        <NavLink to='/' className="px-3 py-2 rounded-full hover:bg-white/15 transition-colors whitespace-nowrap">Trang chủ</NavLink>
                        <NavLink to='/products' className="px-3 py-2 rounded-full hover:bg-white/15 transition-colors whitespace-nowrap">Tất cả sản phẩm</NavLink>
                        <NavLink to='/contact' className="px-3 py-2 rounded-full hover:bg-white/15 transition-colors whitespace-nowrap">Liên hệ</NavLink>
                    </div>

                    {/* Search + Cart + Login */}
                    <div className="hidden md:flex items-center justify-end gap-3 flex-1 min-w-0">
                        {/* Search */}
                        <div className="flex items-center text-sm gap-3 border border-white/30 px-4 rounded-full bg-white h-10 w-full max-w-[460px] shadow-sm focus-within:ring-2 focus-within:ring-white/60 transition">
                            <input
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent outline-none placeholder-gray-500 text-gray-800"
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                            />
                            <FiSearch className="w-5 h-5 text-gray-500 shrink-0" />
                        </div>

                        {/* Cart */}
                        <button onClick={() => navigate("/cart")} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                            <FiShoppingCart className="w-6 h-6 text-white" />
                            <span className="absolute -top-1 -right-1 text-xs bg-white text-[#d70018] min-w-[20px] h-5 px-1 rounded-full font-bold flex items-center justify-center">
                                {getCartCount()}
                            </span>
                        </button>

                        {/* Login / User */}
                        {!user ? (
                            <button onClick={() => {
                                setOpen(false);
                                setShowUserLogin(true);
                            }} className="h-10 px-5 bg-white hover:bg-gray-100 transition text-[#d70018] font-semibold rounded-full whitespace-nowrap shadow-sm">
                                Đăng nhập
                            </button>
                        ) : (
                            <div ref={profileMenuRef} className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen((current) => !current)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    aria-label="Mở menu tài khoản"
                                    aria-expanded={profileOpen}
                                >
                                    <img src={assets.profile_icon} className='w-8 h-8 rounded-full' alt="profile" />
                                </button>
                                {profileOpen && (
                                    <ul className='absolute top-12 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-45 rounded-lg text-sm z-40 whitespace-nowrap'>
                                        <li
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate("my-orders");
                                            }}
                                            className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer text-black'
                                        >
                                            Đơn hàng của tôi
                                        </li>
                                        <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer text-black'>Đăng xuất</li>
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile: Cart + Toggle */}
                    <div className='flex md:hidden items-center gap-3 justify-end ml-auto'>
                        <button onClick={() => navigate("/cart")} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                            <FiShoppingCart className="w-6 h-6 text-white" />
                            <span className="absolute -top-1 -right-1 text-xs bg-white text-[#d70018] min-w-[20px] h-5 px-1 rounded-full font-bold flex items-center justify-center">
                                {getCartCount()}
                            </span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setOpen(!open)} aria-label="Menu" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-2xl">
                            <FiMenu />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {open && (
                <div className="md:hidden flex flex-col w-full absolute top-full left-0 px-6 py-4 gap-2 bg-[#d70018] text-white shadow-md z-40">
                    <NavLink to="/" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Trang chủ</NavLink>
                    <NavLink to="/products" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Tất cả sản phẩm</NavLink>
                    {user && <NavLink to="/my-orders" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Đơn hàng của tôi</NavLink>}
                    <NavLink to="/contact" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Liên hệ</NavLink>

                    {!user ? (
                        <button
                            onClick={() => {
                                setOpen(false);
                                setShowUserLogin(true);
                            }}
                            className="px-6 py-2 mt-2 bg-white hover:bg-gray-100 transition text-[#d70018] rounded-full text-sm font-semibold"
                        >
                            Đăng nhập
                        </button>
                    ) : (
                        <button
                            onClick={logout}
                            className="px-6 py-2 mt-2 bg-white hover:bg-gray-100 transition text-[#d70018] rounded-full text-sm font-semibold"
                        >
                            Đăng xuất
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
