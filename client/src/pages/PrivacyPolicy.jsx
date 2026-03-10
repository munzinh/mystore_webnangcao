import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Chính sách bảo mật thông tin cá nhân
            </h1>

            <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">1. Mục đích thu thập thông tin</h2>
                    <p>MyStore thu thập thông tin cá nhân của Quý khách nhằm phục vụ các mục đích:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Xử lý và giao đơn hàng.</li>
                        <li>Hỗ trợ khách hàng sau bán hàng và bảo hành.</li>
                        <li>Gửi thông báo về các chương trình khuyến mãi (khi có sự đồng ý của khách hàng).</li>
                        <li>Cải thiện trải nghiệm người dùng trên website.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">2. Phạm vi thu thập</h2>
                    <p>Các thông tin bao gồm: Họ tên, Số điện thoại, Email, Địa chỉ giao nhận hàng, Lịch sử mua hàng.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">3. Cam kết bảo mật</h2>
                    <p>Chúng tôi cam kết sử dụng thông tin khách hàng đúng mục đích và không chia sẻ cho bất kỳ bên thứ ba nào ngoại trừ các đơn vị vận chuyển để phục vụ việc giao nhận hàng.</p>
                    <p className="bg-gray-50 p-4 border rounded-lg mt-4 font-medium italic">
                        "Thông tin của bạn là tài sản quý giá nhất mà chúng tôi phải bảo vệ."
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">4. Quyền của khách hàng</h2>
                    <p>Quý khách có quyền yêu cầu MyStore truy xuất, chỉnh sửa hoặc xóa bỏ thông tin cá nhân của mình bất cứ lúc nào thông qua tài khoản cá nhân trên website hoặc liên hệ bộ phận CSKH.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
