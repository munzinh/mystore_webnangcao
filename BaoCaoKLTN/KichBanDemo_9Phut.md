# KỊCH BẢN DEMO HỆ THỐNG MYSTORE (9 PHÚT)
*Đồ án tốt nghiệp: Ứng dụng máy học trong hệ thống gợi ý sản phẩm*

Tài liệu này hướng dẫn chi tiết kịch bản thuyết trình demo hệ thống MyStore trong vòng **9 phút**, tích hợp các yêu cầu của GVHD về phân vai trò, chuẩn bị slide chuyển tiếp và chuẩn bị video backup.

---

## I. NHỮNG LƯU Ý QUAN TRỌNG TỪ GVHD
1. **Thầy nhắc đi nhắc lại về kịch bản demo nhằm mục đích:**
   - **Tránh "Demo Effect":** Tránh việc bị rối, quên luồng, hoặc click chuột lung tung làm mất thời gian quý báu (chỉ có 9 phút).
   - **Làm nổi bật tính năng ML (Máy học):** Không được demo như một web bán hàng thông thường. Mọi hành động click phải hướng tới việc giải thích thuật toán tương ứng (Content-based, SVD Collaborative Filtering, Hybrid, Cold-start).
   - **Kiểm soát thời gian:** Khớp chính xác từng phút để không bị Hội đồng cắt ngang khi chưa trình bày xong phần quan trọng nhất (Recommendation).

2. **Quy định về Slide trước khi Live Demo:**
   - Bạn **phải có 1 slide tóm tắt kịch bản** ngay trước khi chuyển sang màn hình duyệt web. Slide này giới thiệu nhanh:
     - **Số vai trò demo:** 2 Vai trò (**Khách hàng** và **Seller/Quản trị viên**).
     - **Kịch bản chính:** Luồng Khách hàng Mới (Cold-start) $\rightarrow$ Hành vi tương tác (View, Add to Cart, Review) $\rightarrow$ Khách hàng Thân thiết (Gợi ý Cá nhân hóa - Hybrid) $\rightarrow$ Thanh toán & Khảo sát $\rightarrow$ Seller duyệt đơn hàng và xem Dashboard báo cáo.
     - Điều này giúp Hội đồng nắm được lộ trình demo, không bị ngợp và biết trước nhóm sẽ làm gì.

3. **Quay video backup:**
   - Quay màn hình trọn vẹn luồng demo này ở độ phân giải 1080p, giọng đọc rõ ràng hoặc tắt tiếng để thuyết minh trực tiếp.
   - Nếu lúc bảo vệ gặp sự cố: mạng lỗi, server Flask/API bị sập, MongoDB Atlas timeout $\rightarrow$ Lập tức bật video backup và thuyết minh bình thường để bảo toàn điểm demo.

---

## II. DANH SÁCH CÁC CHỨC NĂNG CÓ THỂ DEMO (TỔNG THỂ)

### 1. Phân hệ Khách hàng (User/Customer)
*   Đăng ký / Đăng nhập / Đăng xuất (JWT, HTTP-only Cookie).
*   Tìm kiếm sản phẩm, lọc sản phẩm theo danh mục/thương hiệu/giá.
*   Chi tiết sản phẩm: chọn các biến thể (RAM, dung lượng, màu sắc - giá thay đổi động), xem thông số kỹ thuật.
*   Theo dõi hành vi ẩn (Implicit Behavior Tracking): Xem trang chi tiết sản phẩm (weight = 1.0).
*   Đánh giá sản phẩm (Explicit Feedback): Gửi đánh giá sao (weight = 2.5).
*   Giỏ hàng (Cart): Thêm sản phẩm (weight = 2.0), tăng giảm số lượng, xóa.
*   Thanh toán (Checkout):
    *   Thanh toán khi nhận hàng (COD).
    *   Thanh toán online (mô phỏng Stripe).
*   Quản lý Địa chỉ nhận hàng (Add/Select Address).
*   Lịch sử & trạng thái đơn hàng (My Orders).
*   Khảo sát độ hài lòng về hệ thống gợi ý (Survey Popup liên kết Google Forms).

### 2. Phân hệ Gợi ý sản phẩm (Recommendation System)
*   **Xu hướng mua sắm (Trending):** Gợi ý cho người dùng mới dựa trên trọng số hành vi của cộng đồng trong 7 ngày qua.
*   **Sản phẩm tương tự (Similar Products):** Gợi ý tại trang chi tiết sản phẩm dựa trên TF-IDF và Cosine Similarity (đặc trưng: Tên, Mô tả, Danh mục, Nhóm giá).
*   **Gợi ý cá nhân hóa (For You):** Gợi ý tại trang chủ cho người dùng đã đăng nhập dựa trên mô hình Hybrid (60% Truncated SVD Collaborative Filtering + 40% Content-based).
*   **Thường mua cùng nhau (Frequently Bought Together):** Gợi ý tại Giỏ hàng dựa trên lịch sử mua sắm cùng nhau trong các đơn hàng cũ.
*   **Cơ chế Cold-start phân tầng:**
    *   0 tương tác: Hiện Trending.
    *   < 5 tương tác: Fallback sang Content-based dựa trên tương tác gần nhất.
    *   $\ge$ 5 tương tác: Kích hoạt Hybrid hoàn chỉnh.

### 3. Phân hệ Quản trị / Người bán (Seller/Admin)
*   Đăng nhập Seller.
*   Trang Dashboard: Xem biểu đồ thống kê doanh thu, đơn hàng, tổng sản phẩm, người dùng.
*   Quản lý Danh mục (Category) & Thương hiệu (Brand): Thêm, sửa, xóa.
*   Quản lý Sản phẩm (Product): Thêm sản phẩm mới kèm biến thể, thông số kỹ thuật, upload ảnh lên Cloudinary.
*   Quản lý Đơn hàng (Orders): Xem danh sách đơn hàng toàn hệ thống, cập nhật trạng thái đơn hàng (Chờ xử lý, Đang giao, Đã giao, Hủy).

---

## III. KỊCH BẢN DEMO CHI TIẾT 9 PHÚT (TỪNG PHÚT)

| Thời gian | Vai trò | Giao diện màn hình | Lời thoại & Thao tác chi tiết | Mục tiêu kỹ thuật cần làm rõ |
| :--- | :--- | :--- | :--- | :--- |
| **Phút 0:00 - 1:00** *(1 phút)* | **Người trình bày** | Slide PowerPoint giới thiệu Demo | "Sau đây nhóm em xin phép demo sản phẩm thực nghiệm MyStore. Để Hội đồng tiện theo dõi, kịch bản demo của nhóm gồm 2 vai trò: Khách hàng và Quản trị viên. Chúng em sẽ đi qua 3 kịch bản gợi ý của hệ thống tương ứng với các trạng thái dữ liệu của khách hàng: Người dùng mới (Cold-start), Người dùng bắt đầu tương tác, và Người dùng hoạt động tích cực để chứng minh tính hiệu quả của mô hình Hybrid Recommendation. Cuối cùng, chúng em sẽ đăng nhập vai trò Seller để xử lý đơn hàng và xem dashboard báo cáo." | Giới thiệu vai trò và kịch bản tổng quan. Tạo sự chủ động trước Hội đồng. |
| **Phút 1:00 - 2:30** *(1.5 phút)* | **Khách hàng Mới** *(Chưa đăng nhập)* | Trang chủ MyStore | **Thao tác:** Truy cập vào trang chủ bằng một trình duyệt ẩn danh hoặc tài khoản mới tinh.<br>1. Chỉ vào phần **"Xu hướng mua sắm"** ở cuối trang chủ.<br>2. Giải thích: *"Đây là khu vực giải quyết bài toán Cold-start khi người dùng có 0 hành vi. Hệ thống sẽ truy vấn dữ liệu tương tác của cộng đồng trong 7 ngày gần nhất để tính điểm Trending và đề xuất các sản phẩm hot."* | **Giải quyết Cold-Start (Trường hợp 1: N = 0).** Điểm Trending = Tổng điểm hành vi cộng đồng trong 7 ngày qua. |
| **Phút 2:30 - 4:30** *(2 phút)* | **Khách hàng Mới** *(Bắt đầu tương tác)* | Trang chi tiết sản phẩm & Viết Review | **Thao tác:**<br>1. Tìm kiếm hoặc click vào một sản phẩm cụ thể (ví dụ: iPhone 15 Pro Max). Chọn biến thể RAM/Màu sắc.<br>2. Chỉ xuống phần **"Sản phẩm tương tự"** ở dưới: *"Hệ thống sử dụng Content-based Filtering với TF-IDF và độ tương đồng Cosine trên tên, mô tả và nhóm giá để gợi ý các điện thoại tương tự."*<br>3. Tiến hành **Đăng nhập** một tài khoản khách hàng mới.<br>4. Quay lại sản phẩm đó, thực hiện **Đánh giá 5 sao** (Review) và chọn nút **Thêm vào giỏ hàng**.<br>5. Giải thích: *"Hành động xem sản phẩm đã gửi một event view (trọng số 1.0) lên cơ sở dữ liệu. Hành động review gửi event rating (trọng số 2.5) và thêm giỏ hàng gửi event add_to_cart (trọng số 2.0). Dữ liệu này được số hóa và lưu trực tiếp vào collection `userbehaviors` làm đầu vào cho thuật toán gợi ý."* | **Giải quyết Cold-Start (Trường hợp 2: 0 < N < 5).** Giải thích cơ chế số hóa hành vi (Weight Map) và thuật toán gợi ý dựa trên nội dung (Content-based). |
| **Phút 4:30 - 6:30** *(2 phút)* | **Khách hàng Thân thiết** *(Đã hoạt động)* | Trang chủ tài khoản hoạt động tích cực | **Thao tác:**<br>1. Đăng xuất tài khoản mới, **đăng nhập vào một tài khoản đã chuẩn bị sẵn dữ liệu** (đã tương tác trên 5 sản phẩm khác nhau trong quá khứ).<br>2. Tại Trang chủ, kéo xuống phần **"Dành riêng cho bạn"** (chỉ hiển thị khi đã đăng nhập và có tương tác).<br>3. Giải thích: *"Tài khoản này đã có trên 5 lượt tương tác, hệ thống tự động kích hoạt mô hình Hybrid. Mô hình kết hợp 60% Collaborative Filtering (dùng Truncated SVD giảm chiều ma trận tương tác thưa User-Item) và 40% Content-based để đưa ra các gợi ý cá nhân hóa chính xác nhất với sở thích riêng biệt."* | **Trường hợp 3: N >= 5 tương tác.** Kích hoạt mô hình **Hybrid Recommendation (60% SVD + 40% CB)**. Chứng minh gợi ý thay đổi cá nhân hóa theo từng tài khoản. |
| **Phút 6:30 - 8:00** *(1.5 phút)* | **Khách hàng** | Trang Giỏ hàng $\rightarrow$ Thanh toán $\rightarrow$ Đơn hàng | **Thao tác:**<br>1. Vào Giỏ hàng. Click chọn sản phẩm cần mua.<br>2. Chỉ vào khối **"Thường mua cùng nhau"** ở cuối trang giỏ hàng: *"Hệ thống phân tích các đơn hàng trong quá khứ để gợi ý các sản phẩm đi kèm (như ốp lưng, củ sạc nhanh khi mua điện thoại)."*<br>3. Chọn phương thức thanh toán COD hoặc Stripe (Online). Nhấp **Đặt hàng**.<br>4. Chuyển sang trang **Đơn hàng của tôi** để kiểm tra trạng thái đơn hàng (Chờ xử lý).<br>5. **Khảo sát chất lượng:** Khi đặt hàng xong, hệ thống hiển thị **Popup khảo sát ý kiến** về độ phù hợp và hữu ích của gợi ý (liên kết Google Forms). Giải thích: *"Đây là cơ chế thu thập User Acceptance Evaluation phục vụ đánh giá định tính đồ án."* | **Gợi ý Bundle (Thường mua cùng nhau).** Luồng nghiệp vụ mua bán hoàn chỉnh và phương pháp đánh giá hệ thống (survey). |
| **Phút 8:00 - 9:00** *(1 phút)* | **Seller / Admin** | Trang quản trị Seller (`/seller`) | **Thao tác:**<br>1. Đăng nhập tài khoản Seller.<br>2. Show trang **Dashboard** biểu đồ thống kê doanh số và đơn hàng tăng trưởng theo thời gian thực.<br>3. Vào mục **Quản lý đơn hàng (Orders)**, tìm đúng đơn hàng khách hàng vừa đặt ở trên, click chuyển trạng thái thành *"Đang giao hàng"* hoặc *"Đã giao hàng"*.<br>4. Quay lại trang quản trị Sản phẩm/Thương hiệu/Danh mục, giới thiệu nhanh giao diện quản lý trực quan.<br>5. Kết luận demo. | **Vai trò Seller/Admin.** Hoàn tất vòng đời đơn hàng, hiển thị dashboard quản trị thương mại điện tử chuyên nghiệp. |

---

## IV. BÍ QUYẾT TRÌNH BÀY DEMO ĐẠT ĐIỂM CAO
1. **Highlight thuật toán liên tục:** Khi click đến đâu, hãy nói thuật toán chạy đằng sau đến đó (ví dụ: *"Khi em click vào iPhone 15, backend Node.js ghi nhận hành vi view và gọi Flask Service chạy thuật toán Cosine Similarity tương ứng..."*). Điều này chứng minh bạn làm chủ mã nguồn và hiểu bản chất Machine Learning.
2. **Chuẩn bị sẵn dữ liệu Demo (Rất quan trọng):**
    *   Tài khoản A: Mới hoàn toàn (để hiện Trending).
    *   Tài khoản B: Có 1-2 tương tác (để hiện gợi ý Content-based).
    *   Tài khoản C: Có nhiều tương tác cũ (để hiện gợi ý "Dành riêng cho bạn" của Hybrid SVD).
    *   *Không nên thao tác click tạo dữ liệu từ đầu quá nhiều vì sẽ mất thời gian 9 phút.*
3. **Mở sẵn F12 (Network Tab):** Nếu Hội đồng hỏi sâu, bạn có thể F12 chỉ vào API `/api/recommendations/user/<id>` hoặc `/api/recommendations/product/<id>` để chứng minh hệ thống gọi API thực tế và nhận dữ liệu JSON từ Flask Server.
4. **Phối hợp nhóm:** Một bạn nói, một bạn thao tác click chuột trên máy tính. Bạn thao tác phải click đồng bộ chuẩn xác theo lời nói của bạn thuyết trình.
