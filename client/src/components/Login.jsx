import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const { setShowUserLogin, setUser, axios, navigate } = useAppContext();

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            const { data } = await axios.post(`/api/user/${state}`, {
                name, email, password
            });
            if (data.success) {
                navigate("/");
                setUser(data.user);
                setShowUserLogin(false);
            } else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(data.message);
        }



    }

    return (
        <div onClick={() => setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-1500 flex items-center text-sm text-gray-600 bg-black/50'>
            <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
                <p className="text-2xl font-medium m-auto">
                    <span className="text-[#d70018]">MyStore</span> {state === "login" ? "Đăng nhập" : "Đăng ký"}
                </p>
                {state === "register" && (
                    <div className="w-full">
                        <p>Họ và tên</p>
                        <input onChange={(e) => setName(e.target.value)} value={name} placeholder="Nhập tên của bạn" className="border border-gray-200 rounded w-full p-2 mt-1 outline-none focus:outline-none" type="text" required />
                    </div>
                )}
                <div className="w-full ">
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Nhập email" className="border border-gray-200 rounded w-full p-2 mt-1 outline-none focus:outline-none" type="email" required />
                </div>
                <div className="w-full ">
                    <p>Mật khẩu</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Nhập mật khẩu" className="border border-gray-200 rounded w-full p-2 mt-1 outline-none focus:outline-none" type="password" required />
                </div>
                {state === "register" ? (
                    <p>
                        Đã có tài khoản? <span onClick={() => setState("login")} className="text-[#d70018] hover:text-[#a7091a] cursor-pointer">Đăng nhập ngay</span>
                    </p>
                ) : (
                    <p>
                        Chưa có tài khoản? <span onClick={() => setState("register")} className="text-[#d70018] hover:text-[#a7091a] cursor-pointer">Đăng ký ngay</span>
                    </p>
                )}
                <button className="bg-[#d70018] hover:bg-[#a7091a] transition-all text-white w-full py-2 rounded-md cursor-pointer">
                    {state === "register" ? "Đăng ký" : "Đăng nhập"}
                </button>
            </form>
        </div>
    )
}

export default Login
