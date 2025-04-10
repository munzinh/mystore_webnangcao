import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { FiShoppingCart, FiMenu } from 'react-icons/fi';

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount } = useAppContext();

    const logout = async () => {
        setUser(null);
        navigate('/');
    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            navigate("/products");
        }
    }, [searchQuery]);

    return (
        <nav className="bg-[#d70018] border-b border-gray-300 shadow-md sticky top-0 z-2000">
            <div className="w-full max-w-[1280px] mx-auto py-4 px-2 grid grid-cols-12 items-center">
                {/* Logo */}
                <div className="col-span-6 md:col-span-3">
                    <NavLink to='/' onClick={() => setOpen(false)} className="text-2xl font-bold text-white">
                        MyStore
                    </NavLink>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex col-span-6 justify-center items-center gap-6 text-white">
                    <NavLink to='/' className="hover:underline">Home</NavLink>
                    <NavLink to='/products' className="hover:underline">All Product</NavLink>
                    <NavLink to='/contact' className="hover:underline">Contact</NavLink>
                </div>

                {/* Search + Cart + Login */}
                <div className="hidden md:flex col-span-3 justify-end items-center gap-4 text-white">
                    {/* Search */}
                    <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-200 px-3 rounded-full bg-white">
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-black"
                            type="text"
                            placeholder="Search products"
                        />
                        <img src={assets.search_icon} alt="search" className='w-4 h-4' />
                    </div>

                    {/* Cart */}
                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                        <FiShoppingCart className="w-6 h-6 opacity-90 text-white" />
                        <button className="absolute -top-2 -right-3 text-xs bg-white text-[#d70018] w-[18px] h-[18px] rounded-full font-bold">
                            {getCartCount()}
                        </button>
                    </div>

                    {/* Login / User */}
                    {!user ? (
                        <button onClick={() => {
                            setOpen(false);
                            setShowUserLogin(true);
                        }} className="px-6 py-2 bg-white hover:bg-gray-100 transition text-[#d70018] font-semibold rounded-full">
                            Login
                        </button>
                    ) : (
                        <div className='relative group'>
                            <img src={assets.profile_icon} className='w-10' alt="profile" />
                            <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40'>
                                <li onClick={() => navigate("my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer text-black'>My Orders</li>
                                <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer text-black'>Logout</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Mobile: Cart + Toggle */}
                <div className='flex md:hidden items-center gap-6 col-span-6 justify-end'>
                    <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
                        <FiShoppingCart className="w-6 h-6 opacity-90 text-white" />
                        <button className="absolute -top-2 -right-3 text-xs bg-white text-[#d70018] w-[18px] h-[18px] rounded-full font-bold">
                            {getCartCount()}
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setOpen(!open)} aria-label="Menu" className="text-white text-2xl">
                        <FiMenu />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {open && (
                <div className="md:hidden flex flex-col w-full absolute top-full left-0 px-6 py-4 gap-2 bg-[#d70018] text-white shadow-md z-40">
                    <NavLink to="/" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Home</NavLink>
                    <NavLink to="/products" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">All Product</NavLink>
                    {user && <NavLink to="/my-orders" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">My Order</NavLink>}
                    <NavLink to="/contact" onClick={() => setOpen(false)} className="py-2 border-b border-white/20">Contact</NavLink>

                    {!user ? (
                        <button
                            onClick={() => {
                                setOpen(false);
                                setShowUserLogin(true);
                            }}
                            className="px-6 py-2 mt-2 bg-white hover:bg-gray-100 transition text-[#d70018] rounded-full text-sm font-semibold"
                        >
                            Login
                        </button>
                    ) : (
                        <button
                            onClick={logout}
                            className="px-6 py-2 mt-2 bg-white hover:bg-gray-100 transition text-[#d70018] rounded-full text-sm font-semibold"
                        >
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;