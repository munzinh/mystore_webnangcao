import React from 'react';

const WarrantyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Chính sách bảo hành
            </h1>

            <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">1. Điều kiện bảo hành</h2>
                    <p>Sản phẩm được bảo hành miễn phí nếu hội đủ các điều kiện sau:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Sản phẩm còn trong thời hạn bảo hành.</li>
                        <li>Sản phẩm gặp lỗi kỹ thuật từ nhà sản xuất.</li>
                        <li>Còn nguyên tem bảo hành, tem niêm phong (nếu có) và không có dấu hiệu can thiệp từ bên ngoài.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">2. Các trường hợp không được bảo hành</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Sản phẩm hết thời hạn bảo hành.</li>
                        <li>Hư hỏng do lỗi người dùng: rơi vỡ, thấm nước, cháy nổ do sử dụng sai nguồn điện...</li>
                        <li>Sản phẩm đã bị thay đổi, sửa chữa tại các nơi không thuộc hệ thống MyStore.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-red-600 mb-4">3. Quy trình bảo hành</h2>
                    <ol className="list-decimal pl-6 space-y-2 text-gray-800">
                        <li><span className="font-semibold">Bước 1:</span> Quý khách mang sản phẩm đến cửa hàng MyStore gần nhất hoặc gửi qua đường bưu điện.</li>
                        <li><span className="font-semibold">Bước 2:</span> MyStore kiểm tra tình trạng và thông báo thời gian sửa chữa/đổi trả dự kiến.</li>
                        <li><span className="font-semibold">Bước 3:</span> Hoàn tất bảo hành và bàn giao lại cho khách hàng.</li>
                    </ol>
                </section>

                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400 mt-10">
                    <p className="text-sm text-yellow-800 font-medium">
                        * Đối với các sản phẩm Apple, sản phẩm sẽ được bảo hành theo đúng tiêu chuẩn của Apple Việt Nam tại các trung tâm bảo hành ủy quyền.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WarrantyPolicy;
