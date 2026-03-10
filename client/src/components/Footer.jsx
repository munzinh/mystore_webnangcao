import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const policies = [
    { name: "Mua hàng và thanh toán Online", link: "/online-payment-policy" },
    { name: "Chính sách giao hàng", link: "/delivery-policy" },
    { name: "Chính sách bảo mật thông tin cá nhân", link: "/privacy-policy" },
    { name: "Chính sách bảo hành", link: "/warranty-policy" },
    { name: "Dịch vụ sửa chữa và bảo hành", link: "/warranty-policy" },
  ]

  return (
    <footer className="bg-white border-t border-gray-300 mt-10 py-10 w-full shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap justify-start gap-x-6 gap-y-10">
        {/* Cột 1 */}
        <div className="w-full md:w-1/2 lg:w-[30%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Tổng đài hỗ trợ miễn phí</h3>
          <p className="text-sm text-gray-600 mb-2">Mua hàng - Bảo hành: <strong>1800.2097</strong> (7h30 - 22h00)</p>

          <h4 className="text-sm font-bold text-gray-800 mb-2">Phương thức thanh toán</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {['momo'].map((method) => (
              <img key={method} src={`./images/${method}.png`} alt={method} className="w-12 h-7.5" />
            ))}
          </div>

          <p className="text-sm text-red-600 font-semibold mb-2">
            ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI<br />
            (*) Nhận ngay voucher 10%.<br />
            Khách hàng sẽ được giảm sau 24h, áp dụng cho khách hàng mới
          </p>

          <form className="space-y-2">
            <input type="email" placeholder="Email *" required className="w-full px-3 py-2 border border-gray-300 rounded" />
            <input type="tel" placeholder="Số điện thoại" className="w-full px-3 py-2 border border-gray-300 rounded" />
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">ĐĂNG KÝ NGAY</button>
          </form>
        </div>

        {/* Cột 2 */}
        <div className="w-full md:w-1/2 lg:w-[33%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Thông tin và chính sách</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {policies.map((item, i) => (
              <li key={i}>
                <Link to={item.link} className="hover:text-black">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>



        {/* Cột 4 */}
        <div className="w-full md:w-1/2 lg:w-[33%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Kết nối với MyStore</h3>
          <div className="flex items-center gap-4 mb-4">
            {['youtube', 'facebook', 'tiktok', 'zalo'].map((platform) => (
              <a href="#" key={platform}>
                <img src={`./images/${platform}.png`} alt={platform} className="w-11 h-8" />
              </a>
            ))}
          </div>

          <h4 className="font-bold text-sm text-gray-800 mb-2">Trang thông tin công nghệ mới nhất</h4>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <a href="#"><img src="./images/google-play.png" alt="Google Play" className="w-30 h-10" /></a>
              <a href="#"><img src="./images/app-store.png" alt="App Store" className="w-30 h-10" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer