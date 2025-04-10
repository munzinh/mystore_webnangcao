import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-300 mt-10 py-10 w-full shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-wrap justify-start gap-x-6 gap-y-10">
        {/* Cột 1 */}
        <div className="w-full md:w-1/2 lg:w-[23%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Tổng đài hỗ trợ miễn phí</h3>
          <p className="text-sm text-gray-600 mb-2">Mua hàng - Bảo hành: <strong>1800.2097</strong> (7h30 - 22h00)</p>
          <p className="text-sm text-gray-600 mb-4">Khiếu nại: <strong>1800.2063</strong> (8h00 - 21h30)</p>

          <h4 className="text-sm font-bold text-gray-800 mb-2">Phương thức thanh toán</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {['apple-pay', 'vnpay', 'momo', 'onepay', 'kredivo', 'zalopay', 'alepay', 'fundiin'].map((method) => (
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

          <p className="text-xs text-gray-500 mt-2">Tối đa 1 số điện thoại/ 1 email/ 1 địa chỉ khách hàng của MyStore</p>
        </div>

        {/* Cột 2 */}
        <div className="w-full md:w-1/2 lg:w-[23%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Thông tin và chính sách</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "Mua hàng và thanh toán Online",
              "Mua hàng trả góp Online",
              "Mua hàng trả góp bằng thẻ tín dụng",
              "Chính sách giao hàng",
              "Dịch vụ sửa chữa và bảo hành",
              "Ưu đãi thanh toán",
              "Ưu đãi cho khách hàng doanh nghiệp (B2B)",
              "Chính sách bảo mật thông tin cá nhân",
              "Chính sách bảo hành",
              "Xem ưu đãi Smember",
              "Liên hệ hợp tác kinh doanh",
              "Tra thông tin bảo hành",
              "Tuyển dụng",
              "Tra cứu hóa đơn điện tử",
              "Dịch vụ bảo hành mở rộng",
              "Trung tâm bảo hành chính hãng",
              "Quy định về sao lưu dữ liệu",
              "Chính sách khui hộp sản phẩm Apple"
            ].map((item, i) => (
              <li key={i}><a href="#" className="hover:text-black">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Cột 3 */}
        <div className="w-full md:w-1/2 lg:w-[23%] mb-6">
          <h3 className="text-base font-bold mb-4 text-gray-800">Dịch vụ và thông tin khác</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "Khách hàng doanh nghiệp (B2B)",
              "Ưu đãi thanh toán",
              "Chính sách bảo hành",
              "Liên hệ hợp tác kinh doanh",
              "Tuyển dụng",
              "Dịch vụ bảo hành mở rộng"
            ].map((item, i) => (
              <li key={i}><a href="#" className="hover:text-black">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Cột 4 */}
        <div className="w-full md:w-1/2 lg:w-[23%] mb-6">
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