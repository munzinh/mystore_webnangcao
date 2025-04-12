import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const SellerLayout = () => {

    const { axios, navigate } = useAppContext();

    const sidebarLinks = [
        { name: "Thêm sản phẩm", path: "/seller", icon: assets.add_icon },
        { name: "Danh sách sản phẩm", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Đơn hàng", path: "/seller/orders", icon: assets.order_icon },
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
                        <button onClick={logout} className='border rounded-full text-sm px-4 py-1'>Logout</button>
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
                            <img src={item.icon} alt="" className="w-7 h-7" />
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