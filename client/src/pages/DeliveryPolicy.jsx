import React from 'react';

const DeliveryPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Chính sách giao hàng
            </h1>

            <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">1. Phạm vi giao hàng</h2>
                    <p>MyStore thực hiện giao hàng trên toàn quốc tới tận tay khách hàng thông qua đội ngũ vận chuyển chuyên nghiệp của chúng tôi và các đối tác vận chuyển uy tín.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">2. Thời gian giao hàng</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Nội thành (Hà Nội, TP.HCM):</strong> Giao nhanh trong vòng 2-4 giờ hoặc trong ngày.</li>
                        <li><strong>Ngoại thành và các tỉnh thành khác:</strong> Giao hàng từ 2-5 ngày làm việc.</li>
                    </ul>
                    <p className="mt-2 text-sm italic">* Thời gian giao hàng có thể thay đổi tùy thuộc vào điều kiện khách quan (thời tiết, giao thông, lễ tết).</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">3. Phí vận chuyển</h2>
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị đơn hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí vận chuyển</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dưới 300.000đ</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">20.000đ</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Từ 300.000đ trở lên</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">Miễn phí</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">4. Kiểm tra hàng trước khi thanh toán</h2>
                    <p>Để đảm bảo quyền lợi, MyStore khuyến khích Quý khách kiểm tra kỹ tình trạng sản phẩm (bao bì, tem niêm phong, ngoại quan) trước khi ký nhận và thanh toán.</p>
                </section>
            </div>
        </div>
    );
};

export default DeliveryPolicy;
