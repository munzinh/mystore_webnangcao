import React from 'react';

const OnlinePaymentPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Mua hàng và thanh toán Online
            </h1>

            <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">1. Hướng dẫn mua hàng Online</h2>
                    <p>Quý khách có thể đặt hàng trực tuyến tại website MyStore thông qua các bước đơn giản sau:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Chọn sản phẩm cần mua và nhấn "Thêm vào giỏ hàng".</li>
                        <li>Kiểm tra giỏ hàng và tiến hành "Thanh toán".</li>
                        <li>Nhập thông tin giao hàng và chọn phương thức thanh toán.</li>
                        <li>Xác nhận đơn hàng.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">2. Các phương thức thanh toán</h2>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-2">Thanh toán khi nhận hàng (COD)</h3>
                            <p className="text-sm">Quý khách thanh toán bằng tiền mặt cho nhân viên giao nhận ngay khi nhận hàng.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-2">Thanh toán Online</h3>
                            <p className="text-sm">Hỗ trợ ví điện tử MoMo.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">3. Quy trình xác nhận</h2>
                    <p>Sau khi đặt hàng thành công, nhân viên MyStore sẽ liên hệ với Quý khách qua số điện thoại cung cấp để xác nhận đơn hàng trong vòng 15-30 phút (từ 8h00 - 21h00 hàng ngày).</p>
                </section>

                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 mt-10">
                    <p className="text-sm text-red-800 italic">
                        * Mọi thắc mắc về đơn hàng, quý khách vui lòng liên hệ tổng đài <strong>1800.2097</strong> để được hỗ trợ nhanh nhất.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnlinePaymentPolicy;
