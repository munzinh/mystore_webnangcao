# Nội dung slide và script thuyết trình

Đề tài: **Ứng dụng máy học trong hệ thống gợi ý sản phẩm**  
Sản phẩm thực nghiệm: **MyStore - Website thương mại điện tử tích hợp recommendation system**  
Sinh viên thực hiện: **Nguyễn Ngọc Bảo Minh - Dương Minh An**  
GVHD: **TS. Nguyễn Trí Hải**

## Cách sử dụng file này

- Phần **Nội dung đưa lên slide**: đây là nội dung bạn copy trực tiếp vào PowerPoint.
- Phần **Script đọc**: đây là lời thuyết trình, không cần đưa hết lên slide.
- Nếu slide của bạn chưa có hình minh họa, ưu tiên dùng các bảng hoặc khối nội dung trong phần **Nội dung đưa lên slide** để slide không bị trống.

---

## Slide 1. Giới thiệu đề tài

### Nội dung đưa lên slide

**Tên đề tài**  
Ứng dụng máy học trong hệ thống gợi ý sản phẩm

**Sản phẩm thực nghiệm**  
MyStore - Website thương mại điện tử bán thiết bị điện tử và di động, tích hợp hệ thống gợi ý sản phẩm thông minh.

**Mục tiêu tổng quát**  
Xây dựng một nền tảng thương mại điện tử có đầy đủ chức năng mua sắm cơ bản, đồng thời ứng dụng máy học để cá nhân hóa danh sách sản phẩm gợi ý cho từng người dùng.

**Các thành phần chính của hệ thống**

| Thành phần | Vai trò trong MyStore |
|---|---|
| Frontend | Hiển thị giao diện người dùng, trang sản phẩm, giỏ hàng, đơn hàng và khu vực gợi ý |
| Backend | Xử lý nghiệp vụ, xác thực, API, đơn hàng, sản phẩm, hành vi người dùng |
| Database | Lưu người dùng, sản phẩm, danh mục, đơn hàng, đánh giá và hành vi tương tác |
| ML Service | Xử lý thuật toán gợi ý sản phẩm bằng Python và scikit-learn |
| Seller/Admin | Quản lý sản phẩm, danh mục, thương hiệu, đơn hàng và phân quyền |

**Công nghệ sử dụng**

| Thành phần | Công nghệ |
|---|---|
| Frontend | ReactJS, Vite, TailwindCSS |
| Backend | Node.js, ExpressJS, RESTful API |
| Database | MongoDB Atlas, Mongoose |
| Recommendation | Python Flask, scikit-learn, pandas, numpy |
| Bảo mật | JWT Authentication, phân quyền user/seller/admin |
| Dịch vụ ngoài | Cloudinary, Stripe, Vercel |

**Điểm nhấn của đề tài**  
MyStore không chỉ là website bán hàng, mà còn là mô hình thực nghiệm kết hợp giữa thương mại điện tử và máy học để cá nhân hóa trải nghiệm mua sắm.

### Script đọc

Kính chào quý thầy cô trong hội đồng.  
Nhóm chúng em gồm Nguyễn Ngọc Bảo Minh và Dương Minh An xin trình bày đồ án tốt nghiệp với đề tài: **Ứng dụng máy học trong hệ thống gợi ý sản phẩm**.

Trong đề tài này, nhóm xây dựng một website thương mại điện tử có tên **MyStore**, tập trung vào lĩnh vực bán thiết bị điện tử và di động. Hệ thống được thiết kế như một nền tảng mua sắm trực tuyến hoàn chỉnh, trong đó người dùng có thể xem sản phẩm, tìm kiếm, thêm vào giỏ hàng, đặt hàng, đánh giá sản phẩm và nhận các đề xuất phù hợp với nhu cầu.

Điểm trọng tâm của đề tài không chỉ nằm ở việc xây dựng các chức năng thương mại điện tử cơ bản, mà còn ở việc tích hợp một module gợi ý sản phẩm sử dụng các kỹ thuật máy học. Module này khai thác thông tin sản phẩm và hành vi người dùng để cá nhân hóa danh sách sản phẩm hiển thị, từ đó giúp người dùng rút ngắn thời gian tìm kiếm và nâng cao trải nghiệm mua sắm.

Hệ thống được phát triển theo kiến trúc fullstack, sử dụng ReactJS cho frontend, Node.js/ExpressJS cho backend, MongoDB Atlas cho cơ sở dữ liệu và Python Flask kết hợp scikit-learn cho phân hệ recommendation.

---

## Slide 2. Lý do chọn đề tài

### Nội dung đưa lên slide

**Bối cảnh thực tế**

- Thương mại điện tử phát triển mạnh, số lượng sản phẩm trên các nền tảng online ngày càng lớn.
- Người dùng có nhiều lựa chọn hơn nhưng cũng dễ bị quá tải thông tin.
- Việc tìm đúng sản phẩm phù hợp thường tốn thời gian nếu chỉ dựa vào tìm kiếm thủ công.
- Website bán hàng hiện đại cần hiểu hành vi và nhu cầu riêng của từng người dùng.

**Vấn đề đặt ra**

- Danh sách sản phẩm quá nhiều làm người dùng khó ra quyết định.
- Hiển thị sản phẩm theo danh mục hoặc tìm kiếm thủ công chưa đủ cá nhân hóa.
- Người dùng mới hoặc người dùng có ít dữ liệu tương tác cần cơ chế hỗ trợ khám phá sản phẩm.
- Hệ thống cần tăng khả năng giữ chân người dùng và cải thiện trải nghiệm mua sắm.

**Giải pháp của đề tài**

- Xây dựng website thương mại điện tử MyStore.
- Thu thập hành vi người dùng như xem sản phẩm, thêm vào giỏ hàng, mua hàng và đánh giá.
- Ứng dụng hệ thống gợi ý sản phẩm dựa trên Content-based Filtering, Collaborative Filtering và Hybrid Recommendation.
- Hiển thị các nhóm gợi ý: sản phẩm tương tự, gợi ý cá nhân hóa, trending và thường mua cùng nhau.

**Ý nghĩa của đề tài**

| Vấn đề | Hướng giải quyết | Giá trị mang lại |
|---|---|---|
| Quá nhiều sản phẩm | Gợi ý sản phẩm phù hợp | Giảm thời gian tìm kiếm |
| Người dùng có nhu cầu khác nhau | Cá nhân hóa theo hành vi | Tăng trải nghiệm người dùng |
| Người dùng mới thiếu dữ liệu | Dùng trending hoặc content-based fallback | Vẫn có gợi ý ban đầu |
| Website cần tăng tính thông minh | Tích hợp recommendation system | Nâng cao giá trị ứng dụng |

**Thông điệp chính**  
Recommendation system giúp MyStore không chỉ là website bán hàng, mà còn là nền tảng có khả năng hỗ trợ người dùng tìm sản phẩm phù hợp hơn.

### Script đọc

Lý do nhóm lựa chọn đề tài này xuất phát từ thực tế là thương mại điện tử đang phát triển rất mạnh. Khi số lượng sản phẩm trên một nền tảng ngày càng nhiều, người dùng thường mất nhiều thời gian để tìm được sản phẩm phù hợp với nhu cầu.

Tình trạng này được gọi là quá tải thông tin. Người dùng có thể nhìn thấy rất nhiều sản phẩm, nhưng không phải sản phẩm nào cũng đúng với sở thích, ngân sách hoặc nhu cầu hiện tại của họ. Nếu website chỉ hiển thị danh sách sản phẩm một cách thủ công, trải nghiệm mua sắm sẽ kém hiệu quả và có thể ảnh hưởng đến khả năng ra quyết định của khách hàng.

Vì vậy, hệ thống gợi ý sản phẩm đóng vai trò quan trọng trong việc cá nhân hóa trải nghiệm. Thay vì để người dùng tự tìm kiếm hoàn toàn, hệ thống có thể phân tích thông tin sản phẩm và hành vi tương tác để đề xuất những sản phẩm có khả năng phù hợp hơn.

Đối với nhóm, đề tài này cũng có ý nghĩa thực hành rất lớn. Thông qua MyStore, nhóm có cơ hội vận dụng tổng hợp nhiều kiến thức của ngành Công nghệ phần mềm, từ phân tích yêu cầu, thiết kế UML, thiết kế cơ sở dữ liệu, xây dựng API, phát triển giao diện, kiểm thử, triển khai, cho đến tích hợp máy học vào một hệ thống web hoàn chỉnh.

---

## Slide 3. Mục tiêu & phạm vi đề tài

### Nội dung đưa lên slide

**Mục tiêu tổng quát**

Xây dựng website thương mại điện tử **MyStore** có đầy đủ các chức năng mua sắm cơ bản, đồng thời tích hợp hệ thống gợi ý sản phẩm ứng dụng máy học nhằm cá nhân hóa trải nghiệm người dùng.

**Mục tiêu cụ thể**

| Nhóm mục tiêu | Nội dung thực hiện |
|---|---|
| Phân tích hệ thống | Khảo sát yêu cầu, xác định tác nhân, chức năng và luồng xử lý chính của hệ thống |
| Thiết kế hệ thống | Xây dựng các sơ đồ UML như Use Case Diagram, Sequence Diagram, Class Diagram và ERD |
| Xây dựng website | Phát triển frontend, backend, database và trang quản trị seller/admin |
| Tích hợp gợi ý sản phẩm | Ứng dụng Content-based Filtering, Collaborative Filtering và Hybrid Recommendation |
| Kiểm thử & triển khai | Kiểm thử các chức năng chính và triển khai hệ thống trên môi trường thực nghiệm |

**Phạm vi nghiên cứu**

- Đối tượng: website thương mại điện tử bán thiết bị điện tử và di động.
- Người dùng chính: khách hàng, seller/quản lý cửa hàng và admin.
- Dữ liệu sử dụng: thông tin sản phẩm, danh mục, thương hiệu, đơn hàng, đánh giá và hành vi người dùng.
- Recommendation tập trung vào: sản phẩm tương tự, gợi ý cá nhân hóa, sản phẩm nổi bật và thường mua cùng nhau.

**Các chức năng nằm trong phạm vi**

| Nhóm chức năng | Nội dung |
|---|---|
| Người dùng | Đăng ký, đăng nhập, xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng, đánh giá |
| Seller/Admin | Quản lý sản phẩm, danh mục, thương hiệu, đơn hàng, tồn kho và phân quyền |
| Recommendation | Theo dõi hành vi, xử lý gợi ý, hiển thị sản phẩm đề xuất |
| Triển khai | Frontend, backend, MongoDB Atlas, Cloudinary, Stripe và Flask ML Service |

**Giới hạn của đề tài**

- Hệ thống được xây dựng ở mức thực nghiệm, chưa triển khai ở quy mô doanh nghiệp lớn.
- Dữ liệu hành vi người dùng còn hạn chế, nên độ chính xác recommendation chưa thể so sánh với các hệ thống thương mại điện tử lớn.
- Thanh toán online sử dụng môi trường thử nghiệm, chưa triển khai nhiều cổng thanh toán thực tế.
- Recommendation service mới dừng ở các thuật toán truyền thống, chưa mở rộng sang Deep Learning.

**Thông điệp chính**

Đề tài tập trung xây dựng một website thương mại điện tử hoàn chỉnh ở mức thực nghiệm, trong đó điểm nhấn là việc tích hợp hệ thống gợi ý sản phẩm để cá nhân hóa trải nghiệm mua sắm.

### Script đọc

Mục tiêu chính của đề tài là xây dựng một website thương mại điện tử hoàn chỉnh ở mức thực nghiệm, có thể đáp ứng các nghiệp vụ cơ bản như đăng ký, đăng nhập, xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng, đánh giá và quản trị sản phẩm.

Bên cạnh đó, nhóm thiết kế hệ thống theo mô hình client-server, trong đó frontend, backend, cơ sở dữ liệu và module gợi ý sản phẩm được tách thành các thành phần độc lập nhưng có thể giao tiếp với nhau thông qua RESTful API.

Một mục tiêu quan trọng khác là tích hợp thành công recommendation system vào website. Module này sử dụng dữ liệu sản phẩm và hành vi người dùng để đưa ra danh sách đề xuất phù hợp hơn, từ đó nâng cao trải nghiệm mua sắm.

Cuối cùng, nhóm tiến hành kiểm thử các chức năng chính và triển khai hệ thống lên môi trường online để chứng minh khả năng vận hành thực tế của đồ án.

---

## Slide 5. Phương pháp nghiên cứu và triển khai

### Nội dung đưa lên slide

- Thu thập và tham khảo tài liệu về e-commerce và recommendation system
- So sánh các phương pháp gợi ý: Content-based, Collaborative Filtering, Hybrid
- Phân tích hệ thống bằng UML: Use Case, Sequence, Class Diagram
- Thiết kế database bằng ERD
- Thực nghiệm bằng cách xây dựng website MyStore
- Kiểm thử chức năng và đánh giá hệ thống sau triển khai

### Script đọc

Trong quá trình thực hiện, nhóm sử dụng kết hợp nhiều phương pháp nghiên cứu và triển khai.

Đầu tiên, nhóm tham khảo các tài liệu về thương mại điện tử, hệ thống gợi ý sản phẩm và các thuật toán liên quan. Sau đó, nhóm tiến hành so sánh các hướng tiếp cận phổ biến như Content-based Filtering, Collaborative Filtering và Hybrid Recommendation để lựa chọn phương án phù hợp với phạm vi dữ liệu của đồ án.

Về mặt phân tích thiết kế, nhóm sử dụng các sơ đồ UML như Use Case Diagram, Sequence Diagram và Class Diagram để mô hình hóa hệ thống. Cơ sở dữ liệu được thiết kế thông qua sơ đồ ERD.

Sau phần lý thuyết, nhóm thực nghiệm bằng cách trực tiếp xây dựng website MyStore, tích hợp các chức năng thương mại điện tử và module gợi ý sản phẩm. Cuối cùng, nhóm kiểm thử các chức năng chính để đánh giá mức độ ổn định và khả năng đáp ứng yêu cầu ban đầu.

---

## Slide 4. Công nghệ đã triển khai

### Nội dung đưa lên slide

**Tổng quan công nghệ**

| Nhóm công nghệ | Công nghệ đã dùng | Vai trò trong hệ thống |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router | Xây dựng giao diện người dùng, trang sản phẩm, giỏ hàng, đơn hàng, trang seller/admin |
| Backend | Node.js, Express 5, RESTful API | Xử lý nghiệp vụ, xác thực, sản phẩm, giỏ hàng, đơn hàng, đánh giá và recommendation |
| Database | MongoDB Atlas, Mongoose | Lưu trữ dữ liệu người dùng, sản phẩm, danh mục, thương hiệu, đơn hàng, đánh giá, hành vi và cache gợi ý |
| Machine Learning | Python, Flask, scikit-learn, pandas, numpy | Xử lý thuật toán gợi ý sản phẩm: Content-based, Collaborative Filtering và Hybrid Recommendation |
| Thanh toán | COD, Stripe | Hỗ trợ đặt hàng thanh toán khi nhận hàng và thanh toán online thử nghiệm |
| Lưu trữ ảnh | Cloudinary, Multer | Upload và quản lý hình ảnh sản phẩm, ảnh đánh giá |
| Bảo mật | JWT, bcryptjs, HTTP-only Cookie, phân quyền | Xác thực người dùng, bảo vệ phiên đăng nhập, phân quyền user/seller/admin |
| Deploy | Vercel, MongoDB Atlas | Triển khai frontend/backend và kết nối cơ sở dữ liệu cloud |

**Vai trò của từng lớp công nghệ**

- **React + TailwindCSS**: xây dựng giao diện trực quan, responsive và dễ mở rộng component.
- **Node.js + Express**: đóng vai trò backend trung tâm, cung cấp API cho frontend và kết nối sang ML service.
- **MongoDB Atlas**: lưu trữ dữ liệu dạng document, phù hợp với sản phẩm có biến thể, thông số và hành vi người dùng.
- **Python Flask + scikit-learn**: tách riêng module recommendation để xử lý thuật toán máy học độc lập với backend chính.
- **Stripe + COD**: mô phỏng hai hình thức thanh toán phổ biến trong thương mại điện tử.
- **Cloudinary**: hỗ trợ lưu trữ ảnh sản phẩm trên cloud, giảm tải cho server.

**Lý do chọn stack công nghệ này**

| Yêu cầu của đồ án | Công nghệ đáp ứng |
|---|---|
| Giao diện hiện đại, dễ dùng | React, TailwindCSS |
| API rõ ràng, dễ kết nối frontend/backend | Node.js, Express |
| Dữ liệu sản phẩm linh hoạt, có biến thể | MongoDB, Mongoose |
| Tích hợp thuật toán gợi ý sản phẩm | Python, Flask, scikit-learn |
| Có thanh toán và upload ảnh | Stripe, COD, Cloudinary |
| Có khả năng triển khai online | Vercel, MongoDB Atlas |

**Thông điệp chính**

Hệ thống sử dụng kiến trúc fullstack kết hợp ML service độc lập, giúp MyStore vừa đáp ứng nghiệp vụ thương mại điện tử vừa có khả năng mở rộng hệ thống gợi ý sản phẩm.

### Script đọc

Về công nghệ triển khai, MyStore được xây dựng theo mô hình fullstack kết hợp với một module machine learning độc lập.

Ở phía frontend, nhóm sử dụng React 19, Vite và Tailwind CSS 4 để xây dựng giao diện người dùng, bao gồm trang chủ, trang danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng, đơn hàng và khu vực seller/admin.

Ở phía backend, hệ thống sử dụng Node.js và Express 5 để xây dựng RESTful API. Backend chịu trách nhiệm xử lý nghiệp vụ chính như xác thực, quản lý sản phẩm, giỏ hàng, đơn hàng, đánh giá, theo dõi hành vi người dùng và kết nối với module recommendation.

Cơ sở dữ liệu sử dụng MongoDB Atlas kết hợp Mongoose. Cách lưu trữ dạng document phù hợp với dữ liệu sản phẩm có nhiều biến thể, thông số kỹ thuật, tags, đánh giá và hành vi người dùng.

Riêng phần machine learning được tách thành Flask service viết bằng Python. Module này sử dụng scikit-learn, pandas và numpy để xử lý các thuật toán gợi ý như Content-based Filtering, Collaborative Filtering và Hybrid Recommendation.

Ngoài ra, hệ thống còn tích hợp Cloudinary để lưu trữ hình ảnh, Stripe và COD cho chức năng thanh toán, JWT và bcryptjs cho bảo mật, đồng thời triển khai trên Vercel và MongoDB Atlas để có thể chạy online.

---

## Slide 5. Kiến trúc hệ thống tổng quát

### Nội dung đưa lên slide

**Mô hình kiến trúc**

MyStore được xây dựng theo mô hình **client-server**, trong đó frontend, backend, cơ sở dữ liệu và recommendation service được tách thành các thành phần độc lập nhưng giao tiếp với nhau thông qua API.

**Các tầng chính của hệ thống**

| Tầng hệ thống | Thành phần | Vai trò |
|---|---|---|
| Client / Frontend | ReactJS, Vite, TailwindCSS | Hiển thị giao diện, nhận thao tác người dùng, gọi API đến backend |
| Backend API | Node.js, ExpressJS | Xử lý nghiệp vụ, xác thực, quản lý dữ liệu, điều phối request |
| Database | MongoDB Atlas | Lưu trữ dữ liệu người dùng, sản phẩm, đơn hàng, đánh giá, hành vi và recommendation cache |
| ML Service | Python Flask, scikit-learn | Xử lý thuật toán gợi ý sản phẩm và trả danh sách đề xuất |
| External Services | Cloudinary, Stripe, Vercel | Lưu ảnh, thanh toán online thử nghiệm và triển khai hệ thống |

**Luồng xử lý tổng quát**

```text
Người dùng / Seller
        ↓
Frontend React
        ↓ gọi RESTful API
Backend Node.js / Express
        ↓
MongoDB Atlas
        ↓
ML Service Flask xử lý recommendation
        ↓
Backend trả dữ liệu về Frontend
```

**Luồng recommendation trong kiến trúc**

- Frontend gửi yêu cầu lấy sản phẩm gợi ý.
- Backend kiểm tra cache recommendation trong MongoDB.
- Nếu chưa có cache, backend gọi Flask ML Service.
- ML Service xử lý Content-based, Collaborative Filtering hoặc Hybrid Recommendation.
- Backend hydrate lại thông tin sản phẩm và trả kết quả về frontend.
- Frontend hiển thị gợi ý ở trang chủ, trang chi tiết sản phẩm hoặc giỏ hàng.

**Điểm mạnh của kiến trúc**

- Tách biệt rõ frontend, backend, database và ML service.
- Backend đóng vai trò trung tâm điều phối dữ liệu và xử lý nghiệp vụ.
- ML service hoạt động độc lập, dễ nâng cấp thuật toán gợi ý.
- MongoDB phù hợp với dữ liệu sản phẩm có biến thể và hành vi người dùng.
- Có thể mở rộng từng phần mà không ảnh hưởng toàn bộ hệ thống.
- Có fallback gợi ý ở backend nếu ML service tạm thời không hoạt động.

**Thông điệp chính**

Kiến trúc MyStore được thiết kế theo hướng phân tầng, giúp hệ thống dễ bảo trì, dễ mở rộng và phù hợp để tích hợp module máy học vào website thương mại điện tử.

### Script đọc

Về kiến trúc tổng quát, MyStore được xây dựng theo mô hình client-server. Trong đó, frontend, backend, cơ sở dữ liệu và ML service được tách thành các thành phần riêng biệt nhưng vẫn có thể giao tiếp với nhau thông qua RESTful API.

Frontend được phát triển bằng ReactJS, chịu trách nhiệm hiển thị giao diện và nhận thao tác từ người dùng. Khi người dùng thực hiện các hành động như xem sản phẩm, thêm vào giỏ hàng, đặt hàng hoặc yêu cầu gợi ý sản phẩm, frontend sẽ gửi request đến backend.

Backend được xây dựng bằng Node.js và ExpressJS, đóng vai trò trung tâm xử lý nghiệp vụ. Backend chịu trách nhiệm xác thực người dùng, quản lý sản phẩm, xử lý đơn hàng, lưu hành vi người dùng và kết nối với cơ sở dữ liệu MongoDB Atlas.

Riêng phần recommendation được tách thành một Flask ML Service. Backend sẽ gọi service này khi cần lấy danh sách sản phẩm gợi ý. ML Service xử lý thuật toán và trả về danh sách sản phẩm phù hợp. Sau đó backend lấy đầy đủ thông tin sản phẩm từ database và trả kết quả về frontend.

Ưu điểm của kiến trúc này là các thành phần được tách biệt rõ ràng, giúp hệ thống dễ bảo trì và dễ mở rộng. Đặc biệt, module machine learning có thể được nâng cấp thuật toán độc lập mà không ảnh hưởng nhiều đến frontend hoặc backend chính.

---

## Slide 7. Các chức năng chính của MyStore

### Nội dung đưa lên slide

- Người dùng:
  - Đăng ký, đăng nhập, đăng xuất
  - Xem và tìm kiếm sản phẩm
  - Xem chi tiết, chọn biến thể
  - Thêm vào giỏ hàng, đặt hàng
  - Theo dõi đơn hàng, đánh giá sản phẩm
- Seller/Admin:
  - Quản lý sản phẩm, danh mục, thương hiệu
  - Quản lý đơn hàng
  - Cập nhật thông tin sản phẩm và tồn kho
- Recommendation:
  - Sản phẩm tương tự
  - Gợi ý cá nhân hóa
  - Sản phẩm nổi bật / trending
  - Sản phẩm thường mua cùng nhau

### Script đọc

Về chức năng, hệ thống được chia thành ba nhóm chính.

Nhóm thứ nhất là chức năng dành cho người dùng. Người dùng có thể đăng ký, đăng nhập, xem danh sách sản phẩm, tìm kiếm sản phẩm, xem chi tiết sản phẩm, chọn biến thể, thêm sản phẩm vào giỏ hàng, đặt hàng và theo dõi đơn hàng. Ngoài ra, người dùng cũng có thể đánh giá sản phẩm sau khi trải nghiệm.

Nhóm thứ hai là chức năng dành cho seller hoặc admin. Khu vực quản trị cho phép quản lý sản phẩm, danh mục, thương hiệu, cập nhật thông tin sản phẩm, kiểm soát tồn kho và theo dõi đơn hàng.

Nhóm thứ ba là chức năng gợi ý sản phẩm. Hệ thống hỗ trợ nhiều loại gợi ý như sản phẩm tương tự, gợi ý cá nhân hóa theo người dùng, sản phẩm nổi bật hoặc trending, và sản phẩm thường mua cùng nhau.

---

## Slide 8. Cơ sở dữ liệu

### Nội dung đưa lên slide

- Các collection chính:
  - users
  - products
  - categories
  - brands
  - orders
  - reviews
  - userbehaviors
  - recommendations
  - addresses
- Điểm nổi bật:
  - Product có variants, specs, tags, rating
  - UserBehavior lưu eventType và weight
  - Review có unique theo userId + productId
  - Recommendation cache kết quả gợi ý

### Script đọc

Cơ sở dữ liệu của hệ thống được thiết kế trên MongoDB. Các collection chính gồm users, products, categories, brands, orders, reviews, userbehaviors, recommendations và addresses.

Trong đó, collection products là một trong những phần quan trọng nhất. Mỗi sản phẩm có thể có nhiều biến thể, ví dụ như màu sắc, dung lượng, RAM, giá và hình ảnh riêng. Ngoài ra, sản phẩm còn có thông số kỹ thuật, tags, điểm đánh giá trung bình và tổng số đánh giá.

Collection userbehaviors được dùng để lưu lại hành vi người dùng như xem sản phẩm, thêm vào giỏ hàng, mua hàng và đánh giá. Mỗi hành vi được gán một trọng số để phục vụ cho quá trình xây dựng ma trận tương tác.

Collection reviews lưu đánh giá sản phẩm và có cơ chế unique theo userId và productId để tránh một người dùng đánh giá trùng một sản phẩm nhiều lần. Ngoài ra, collection recommendations được sử dụng để cache kết quả gợi ý, giúp giảm thời gian xử lý khi gọi lại recommendation API.

---

## Slide 9. Số hóa hành vi người dùng

### Nội dung đưa lên slide

- Hệ thống thu thập hành vi vào collection `userbehaviors`
- Trọng số hành vi:
  - `view`: 1.0
  - `add_to_cart`: 2.0
  - `rating`: 2.5
  - `purchase`: 3.0
- Công thức:

```text
R(u,p) = tổng trọng số các hành vi của user u trên product p
```

- Lọc trùng hành vi xem sản phẩm trong 30 phút để giảm nhiễu

### Script đọc

Để xây dựng dữ liệu đầu vào cho hệ thống gợi ý, MyStore tiến hành số hóa hành vi người dùng.

Mỗi hành vi của người dùng được lưu trong collection userbehaviors. Các hành vi được gán trọng số khác nhau tùy theo mức độ thể hiện sự quan tâm. Ví dụ, hành vi xem sản phẩm có trọng số 1.0, thêm vào giỏ hàng có trọng số 2.0, đánh giá sản phẩm có trọng số 2.5 và mua hàng có trọng số 3.0.

Điểm tương tác giữa một người dùng và một sản phẩm được tính bằng tổng trọng số các hành vi mà người dùng đó đã thực hiện trên sản phẩm. Công thức tổng quát là R(u,p) bằng tổng các trọng số hành vi tương ứng.

Đối với hành vi xem sản phẩm, hệ thống có cơ chế lọc trùng trong khoảng 30 phút để tránh việc người dùng reload trang hoặc xem lại liên tục làm tăng điểm tương tác ảo, gây nhiễu cho mô hình.

---

## Slide 10. Content-based Filtering

### Nội dung đưa lên slide

- Gợi ý dựa trên đặc trưng sản phẩm
- Chuỗi đặc trưng:

```text
F(p) = name + category + description + priceBin
```

- Vector hóa văn bản bằng TF-IDF
- Tính độ tương đồng bằng Cosine Similarity
- Ứng dụng:
  - Sản phẩm tương tự ở trang chi tiết
  - Fallback khi người dùng có ít hành vi

### Script đọc

Thuật toán đầu tiên được nhóm sử dụng là Content-based Filtering. Phương pháp này đưa ra gợi ý dựa trên đặc trưng nội dung của sản phẩm.

Trong hệ thống MyStore, mỗi sản phẩm được biểu diễn bằng một chuỗi đặc trưng tổng hợp gồm tên sản phẩm, danh mục, mô tả và nhóm giá. Nhóm giá được chia thành các phân khúc như budget, mid, high và premium.

Sau đó, hệ thống sử dụng kỹ thuật TF-IDF để chuyển đổi văn bản mô tả sản phẩm thành vector số. Khi đã có vector, hệ thống tính độ tương đồng giữa các sản phẩm bằng Cosine Similarity.

Kết quả của thuật toán này được dùng để hiển thị khu vực sản phẩm tương tự ở trang chi tiết sản phẩm. Ngoài ra, Content-based Filtering cũng được dùng làm phương án fallback khi người dùng chưa có đủ lịch sử hành vi để áp dụng Collaborative Filtering.

---

## Slide 11. Collaborative Filtering và Truncated SVD

### Nội dung đưa lên slide

- Dựa trên ma trận tương tác User-Item
- Dữ liệu đầu vào: `userbehaviors`
- Ma trận tương tác:

```text
R[u,p] = tổng điểm hành vi của user u với product p
```

- Áp dụng Truncated SVD để giảm chiều và học đặc trưng ẩn
- Dự đoán sản phẩm người dùng có thể quan tâm

### Script đọc

Thuật toán thứ hai là Collaborative Filtering. Khác với Content-based Filtering, phương pháp này không chỉ nhìn vào nội dung sản phẩm, mà khai thác hành vi của cộng đồng người dùng.

Hệ thống xây dựng một ma trận tương tác User-Item, trong đó mỗi hàng đại diện cho một người dùng, mỗi cột đại diện cho một sản phẩm, và giá trị trong ma trận là tổng điểm hành vi giữa người dùng và sản phẩm đó.

Do ma trận tương tác thường rất thưa, hệ thống sử dụng Truncated SVD để giảm chiều dữ liệu và học ra các đặc trưng ẩn của người dùng và sản phẩm. Từ đó, hệ thống có thể dự đoán những sản phẩm mà người dùng có khả năng quan tâm, dù trước đó họ chưa từng tương tác với các sản phẩm này.

Trong source code, phần này được xử lý ở module Python, đặc biệt là các file collaborative_filtering.py và hybrid_recommendation.py.

---

## Slide 12. Hybrid Recommendation và xử lý Cold-start

### Nội dung đưa lên slide

- Kết hợp Content-based và Collaborative Filtering
- Công thức:

```text
HybridScore = 0.6 * CFScore + 0.4 * CBScore
```

- Xử lý cold-start:
  - 0 hành vi: trending hoặc sản phẩm mới nhất
  - Ít hơn 5 hành vi: Content-based
  - Từ 5 hành vi trở lên: Hybrid Recommendation
- Mục tiêu: cân bằng độ chính xác và độ đa dạng của gợi ý

### Script đọc

Để tận dụng ưu điểm của cả hai hướng tiếp cận, hệ thống MyStore sử dụng mô hình Hybrid Recommendation.

Trong mô hình này, điểm gợi ý cuối cùng được tính bằng cách kết hợp điểm từ Collaborative Filtering và Content-based Filtering. Theo thiết kế trong báo cáo, hệ thống ưu tiên 60% cho Collaborative Filtering và 40% cho Content-based Filtering đối với người dùng đã có đủ dữ liệu hành vi.

Ngoài ra, hệ thống cũng có chiến lược xử lý cold-start. Nếu người dùng chưa có hành vi nào, hệ thống sẽ gợi ý sản phẩm trending hoặc sản phẩm mới nhất. Nếu người dùng có ít hơn 5 hành vi, hệ thống dùng Content-based Filtering dựa trên sản phẩm người dùng tương tác gần nhất. Khi người dùng có từ 5 hành vi trở lên, hệ thống kích hoạt Hybrid Recommendation.

Cách tiếp cận này giúp hệ thống vừa đảm bảo có gợi ý trong trường hợp thiếu dữ liệu, vừa cải thiện chất lượng đề xuất khi dữ liệu hành vi đã đủ nhiều.

---

## Slide 13. Luồng recommendation trong source code

### Nội dung đưa lên slide

- Backend route: `/api/recommendations`
- Các API chính:
  - `/product/:productId`: sản phẩm tương tự
  - `/user/:userId`: gợi ý cá nhân hóa
  - `/trending`: sản phẩm nổi bật
  - `/bought-together/:productId`: thường mua cùng nhau
- Backend gọi Flask ML Service trước
- Nếu ML Service lỗi hoặc không có dữ liệu: dùng Node.js fallback
- Kết quả được hydrate thông tin sản phẩm và cache lại

### Script đọc

Trong source code, luồng recommendation được triển khai tại route `/api/recommendations`.

Hệ thống có bốn nhóm API chính. API `/product/:productId` dùng để lấy sản phẩm tương tự. API `/user/:userId` dùng để lấy gợi ý cá nhân hóa cho người dùng. API `/trending` dùng để lấy sản phẩm nổi bật dựa trên hành vi gần đây. API `/bought-together/:productId` dùng để gợi ý sản phẩm thường mua cùng nhau dựa trên dữ liệu đơn hàng.

Khi có request, backend sẽ ưu tiên gọi Flask ML Service để lấy kết quả từ module Python. Nếu ML Service không hoạt động, timeout hoặc không có dữ liệu phù hợp, backend vẫn có cơ chế fallback bằng Node.js, chủ yếu dựa trên TF-IDF hoặc danh sách trending/latest.

Sau khi có danh sách productId được gợi ý, backend sẽ hydrate lại thông tin đầy đủ của sản phẩm, thêm dữ liệu như danh mục, thương hiệu, số lượng bán, sau đó trả về frontend. Kết quả cũng được lưu vào recommendation cache để tối ưu các lần gọi tiếp theo.

---

## Slide 14. Kiểm thử và triển khai

### Nội dung đưa lên slide

- Kiểm thử các chức năng chính:
  - Đăng nhập / đăng ký
  - Sản phẩm
  - Giỏ hàng và đơn hàng
  - Recommendation section
- Triển khai:
  - Frontend: Vercel
  - Backend/API: Vercel hoặc server Node.js
  - Database: MongoDB Atlas
  - Image storage: Cloudinary
  - Recommendation service: Flask service
- Backend có fallback khi ML service không khả dụng

### Script đọc

Sau khi hoàn thiện các chức năng chính, nhóm tiến hành kiểm thử các luồng quan trọng của hệ thống.

Các phần được kiểm thử gồm đăng ký, đăng nhập, xem và quản lý sản phẩm, giỏ hàng, đặt hàng, quản lý đơn hàng và khu vực hiển thị gợi ý sản phẩm.

Về triển khai, frontend được đưa lên Vercel. Backend có thể triển khai trên Vercel hoặc môi trường Node.js phù hợp. Cơ sở dữ liệu sử dụng MongoDB Atlas. Hình ảnh sản phẩm được lưu trữ thông qua Cloudinary. Riêng recommendation service được xây dựng bằng Flask và có thể chạy trên server riêng.

Một điểm quan trọng trong thiết kế triển khai là backend không phụ thuộc hoàn toàn vào ML Service. Khi ML Service tạm thời không hoạt động, hệ thống vẫn có cơ chế fallback để trả về gợi ý, giúp website duy trì trải nghiệm ổn định hơn.

---

## Slide 15. Kết quả đạt được

### Nội dung đưa lên slide

- Hoàn thiện website thương mại điện tử MyStore ở mức thực nghiệm
- Xây dựng đầy đủ frontend, backend, database và recommendation module
- Các chức năng chính hoạt động ổn định:
  - Người dùng, sản phẩm, giỏ hàng, đơn hàng, đánh giá
  - Quản trị sản phẩm, danh mục, thương hiệu, đơn hàng
  - Gợi ý sản phẩm tích hợp trong website
- Kiến trúc tách bạch, dễ bảo trì và mở rộng

### Script đọc

Kết quả đạt được của đề tài là nhóm đã hoàn thiện website thương mại điện tử MyStore ở mức thực nghiệm.

Hệ thống bao gồm đầy đủ các thành phần frontend, backend, cơ sở dữ liệu và module recommendation. Các chức năng chính như quản lý người dùng, sản phẩm, giỏ hàng, đơn hàng, đánh giá và quản trị seller đều đã được triển khai.

Đặc biệt, hệ thống gợi ý sản phẩm đã được tích hợp trực tiếp vào website, giúp người dùng tiếp cận các sản phẩm phù hợp hơn thông qua các khu vực như sản phẩm tương tự, gợi ý cá nhân hóa, trending và thường mua cùng nhau.

Về kiến trúc, hệ thống được chia thành các phân hệ độc lập, giao tiếp qua RESTful API. Điều này giúp mã nguồn dễ bảo trì, dễ mở rộng và thuận lợi cho việc nâng cấp thêm các chức năng trong tương lai.

---

## Slide 16. Khó khăn và hạn chế

### Nội dung đưa lên slide

- Dữ liệu hành vi còn hạn chế, ảnh hưởng độ chính xác recommendation
- Bài toán cold-start vẫn là thách thức lớn
- Đồng bộ frontend, backend và ML service cần nhiều kiểm thử
- UI/UX responsive cần tiếp tục tối ưu
- Backend cần tối ưu thêm về bảo mật, hiệu năng và kiểm duyệt dữ liệu đầu vào
- Chưa xử lý dữ liệu lớn và chưa triển khai recommendation service trên cloud production

### Script đọc

Trong quá trình thực hiện, nhóm gặp một số khó khăn và hạn chế.

Khó khăn đầu tiên là dữ liệu hành vi người dùng còn hạn chế. Với hệ thống gợi ý, dữ liệu tương tác càng nhiều thì mô hình càng có điều kiện để đưa ra kết quả chính xác hơn. Do MyStore là hệ thống thực nghiệm nên dữ liệu chưa đủ lớn, khiến bài toán cold-start vẫn là một thách thức đáng kể.

Khó khăn thứ hai là việc đồng bộ giữa frontend, backend và ML Service. Vì ba phân hệ này hoạt động độc lập và giao tiếp qua API, nhóm phải kiểm thử nhiều lần để đảm bảo dữ liệu không bị sai lệch trong quá trình truyền tải.

Ngoài ra, giao diện responsive vẫn cần tiếp tục tối ưu để đảm bảo trải nghiệm tốt trên nhiều thiết bị. Backend cũng cần được nâng cấp thêm về bảo mật, hiệu năng và kiểm duyệt dữ liệu đầu vào nếu triển khai ở quy mô thực tế.

---

## Slide 17. Định hướng phát triển

### Nội dung đưa lên slide

- Tối ưu thuật toán recommendation
- Ứng dụng Deep Learning cho hệ thống gợi ý
- Huấn luyện trên dữ liệu hành vi lớn hơn
- Triển khai backend và recommendation service trên cloud server
- Bổ sung:
  - Thống kê và phân tích dữ liệu
  - Nhiều cổng thanh toán
  - Real-time notification
  - Voucher management
  - Cross-platform recommendation
- Tăng cường bảo mật và tối ưu UI/UX

### Script đọc

Trong tương lai, hệ thống có thể được phát triển theo nhiều hướng.

Đối với recommendation system, nhóm định hướng tối ưu thuật toán để tăng độ chính xác, đồng thời nghiên cứu ứng dụng Deep Learning khi có dữ liệu hành vi đủ lớn hơn. Ngoài ra, recommendation service cũng nên được triển khai trên cloud server để hoạt động ổn định trong môi trường production.

Đối với hệ thống thương mại điện tử, MyStore có thể mở rộng thêm các chức năng như thống kê và phân tích dữ liệu, tích hợp nhiều cổng thanh toán, thông báo thời gian thực, quản lý voucher và recommendation đa nền tảng.

Bên cạnh đó, nhóm cũng cần tiếp tục tăng cường bảo mật, tối ưu hiệu năng backend và cải thiện UI/UX để hệ thống có thể tiến gần hơn đến một nền tảng thương mại điện tử thực tế.

---

## Slide 18. Kết luận

### Nội dung đưa lên slide

- MyStore đã hoàn thành mục tiêu xây dựng website thương mại điện tử tích hợp gợi ý sản phẩm
- Hệ thống chứng minh khả năng ứng dụng machine learning vào web fullstack
- Recommendation giúp cá nhân hóa trải nghiệm và hỗ trợ người dùng tìm sản phẩm phù hợp hơn
- Đề tài tạo nền tảng để tiếp tục mở rộng thành hệ thống thương mại điện tử thông minh

### Script đọc

Tổng kết lại, đồ án đã hoàn thành mục tiêu xây dựng một website thương mại điện tử tích hợp hệ thống gợi ý sản phẩm.

Thông qua MyStore, nhóm đã chứng minh được khả năng kết hợp giữa một ứng dụng web fullstack và một module máy học độc lập. Hệ thống không chỉ đáp ứng các luồng nghiệp vụ cơ bản của thương mại điện tử, mà còn có khả năng phân tích hành vi và thông tin sản phẩm để đưa ra các đề xuất phù hợp hơn cho người dùng.

Dù vẫn còn một số hạn chế về dữ liệu, hiệu năng và quy mô triển khai, đề tài đã tạo được nền tảng kỹ thuật tương đối hoàn chỉnh để tiếp tục phát triển thành một hệ thống thương mại điện tử thông minh hơn trong tương lai.

Phần trình bày của nhóm em đến đây là kết thúc. Chúng em xin chân thành cảm ơn quý thầy cô đã lắng nghe và rất mong nhận được góp ý từ hội đồng.

---

# Gợi ý rút gọn nếu chỉ trình bày 10-12 phút

Nếu thời gian trình bày ngắn, có thể gộp slide như sau:

1. Giới thiệu đề tài
2. Lý do chọn đề tài và mục tiêu
3. Phạm vi và phương pháp nghiên cứu
4. Kiến trúc hệ thống
5. Chức năng chính của MyStore
6. Cơ sở dữ liệu và behavior tracking
7. Content-based Filtering
8. Collaborative Filtering và Hybrid Recommendation
9. Luồng recommendation trong source code
10. Kiểm thử và triển khai
11. Kết quả, hạn chế và định hướng
12. Kết luận

# Câu nói chuyển ý nhanh giữa các phần

- "Sau phần giới thiệu tổng quan, nhóm em xin trình bày lý do chọn đề tài."
- "Từ bài toán thực tế đó, nhóm xác định các mục tiêu chính như sau."
- "Tiếp theo là kiến trúc tổng quan của hệ thống MyStore."
- "Sau khi có nền tảng thương mại điện tử, phần trọng tâm của đề tài là recommendation system."
- "Để recommendation hoạt động, hệ thống cần số hóa hành vi người dùng."
- "Từ dữ liệu hành vi và dữ liệu sản phẩm, nhóm triển khai ba hướng gợi ý chính."
- "Cuối cùng, nhóm xin trình bày kết quả đạt được, hạn chế và định hướng phát triển."
