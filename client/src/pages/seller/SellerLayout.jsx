import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const IconGrid    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>;
const IconFolder  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>;
const IconTag     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>;

const SellerLayout = () => {

    const { axios, navigate } = useAppContext();

    const sidebarLinks = [
        { name: "Tổng quan",           path: "/seller/dashboard",     svgIcon: <IconGrid /> },
        { name: "Thêm sản phẩm",       path: "/seller",               icon: assets.add_icon },
        { name: "Danh sách sản phẩm",  path: "/seller/product-list",  icon: assets.product_list_icon },
        { name: "Đơn hàng",            path: "/seller/orders",        icon: assets.order_icon },
        { name: "Danh mục",            path: "/seller/categories",    svgIcon: <IconFolder /> },
        { name: "Thương hiệu",          path: "/seller/brands",        svgIcon: <IconTag /> },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if (data.success) {
                toast.success(data.message);
                navigate('/');
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }

    }

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <div className="flex items-center justify-between">
                    <Link to='/' className="text-[#d70018] text-2xl font-bold cursor-pointer">
                        MyStore
                    </Link>
                    <div className="flex items-center gap-5 text-gray-500">
                        <p>Hi! Admin</p>
                        <button onClick={logout} className='border rounded-full text-sm px-4 py-1'>Đăng xuất</button>
                    </div>
                </div>
            </div>

            {/* Nội dung chính có padding-top để tránh che navbar */}
            <div className="flex pt-[50px] h-[calc(100vh-50px)]">
                <div className="md:w-64 w-16 border-r text-base border-gray-300 pt-4 flex flex-col h-full">
                    {sidebarLinks.map((item) => (
                        <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                            className={({ isActive }) =>
                                `flex items-center py-3 px-4 gap-3 
                    ${isActive ? "border-r-4 md:border-r-[6px] bg-[#d70018]/10 border-[#d70018] text-[#d70018]" : "hover:bg-gray-100/90 border-white"}`}
                        >
                            {item.svgIcon
                                ? <span className="w-7 h-7 flex items-center justify-center">{item.svgIcon}</span>
                                : item.icon
                                    ? <img src={item.icon} alt="" className="w-7 h-7" />
                                    : null
                            }
                            <p className="md:block hidden text-center">{item.name}</p>
                        </NavLink>
                    ))}
                </div>

                {/* Nội dung chính nằm ở đây */}
                <div className="flex-1 overflow-y-auto h-[calc(100vh-50px)] px-4 py-4">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default SellerLayout;