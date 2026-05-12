# BÁO CÁO ĐỒ ÁN: MYSTORE – WEBSITE THƯƠNG MẠI ĐIỆN TỬ
## Môn học: Web Nâng Cao – HK252 | Trường Đại học Văn Lang

---

## PHẦN 1 – GIỚI THIỆU DỰ ÁN

### 1.1 Tên đề tài
**MyStore** – Website thương mại điện tử bán điện thoại & thiết bị điện tử tích hợp hệ thống gợi ý sản phẩm thông minh.

### 1.2 Mục tiêu
- Xây dựng nền tảng mua sắm trực tuyến đầy đủ tính năng cho người dùng cuối và quản trị viên (seller).
- Tích hợp hệ thống gợi ý sản phẩm dựa trên AI/ML (Content-based, Collaborative Filtering, Hybrid).
- Hỗ trợ thanh toán online qua Stripe và thanh toán khi nhận hàng (COD).
- Triển khai production trên Vercel (frontend) và backend.

### 1.3 Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router v7 |
| Backend | Node.js, Express 5, MongoDB (Mongoose 8) |
| ML Service | Python, Flask, scikit-learn, pandas, numpy |
| Auth | JWT, bcryptjs, HTTP-only Cookie |
| Upload ảnh | Cloudinary |
| Thanh toán | Stripe |
| Bản đồ | Leaflet / React-Leaflet |
| Deploy | Vercel (frontend + backend) |

---

## PHẦN 2 – KIẾN TRÚC HỆ THỐNG

### 2.1 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────┐
│              CLIENT (React + Vite)           │
│  ┌──────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ User UI  │ │ Seller UI   │ │  ML UI   │  │
│  └──────────┘ └─────────────┘ └──────────┘  │
└──────────────────────┬──────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────┐
│         SERVER (Node.js + Express)           │
│  Routes → Controllers → Models (Mongoose)   │
│  Middleware: authUser, authSeller, multer    │
│  External: Cloudinary, Stripe Webhooks       │
└──────────┬────────────────────┬─────────────┘
           │                    │
┌──────────▼──────┐   ┌─────────▼──────────┐
│  MongoDB Atlas  │   │ ML Service (Flask)  │
│  (Cloud DB)     │   │ Port 5000 – Python  │
└─────────────────┘   └────────────────────┘
```

### 2.2 Cấu trúc thư mục

```
MyStore/
├── client/                  # React Frontend
│   └── src/
│       ├── pages/           # Các trang chính (Home, Cart, Orders,...)
│       ├── components/      # Components dùng chung + seller
│       ├── context/         # AppContext (global state)
│       └── assets/          # Hình ảnh tĩnh
│
├── server/                  # Node.js Backend
│   ├── models/              # 9 MongoDB schemas (User, Product, Order, Review, Category, Brand, Address, UserBehavior, Recommendation)
│   ├── controllers/         # 11 controller modules
│   ├── routes/              # 11 API route files
│   ├── middlewares/         # authUser, authSeller
│   └── configs/             # DB, Cloudinary config
│
├── ml_service.py            # Flask API Gateway (ML)
├── content_based.py         # TF-IDF + Cosine similarity
├── collaborative_filtering.py # Matrix Factorization (CF)
├── hybrid_recommendation.py # Hybrid = α*CF + (1-α)*CB
└── evaluate.py              # Precision@K, Recall@K
```

---

## PHẦN 3 – CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH

### 3.1 Hệ thống Người dùng (User)

| Chức năng | Trạng thái | Mô tả |
|---|---|---|
| Đăng ký tài khoản | ✅ Hoàn thành | Bcrypt hash password, JWT 7 ngày |
| Đăng nhập | ✅ Hoàn thành | HTTP-only cookie, secure production |
| Đăng xuất | ✅ Hoàn thành | Clear cookie |
| Kiểm tra auth | ✅ Hoàn thành | `/api/user/is-auth` |
| Phân quyền | ✅ Hoàn thành | user / manager / admin |

### 3.2 Quản lý Sản phẩm

| Chức năng | Trạng thái | Mô tả |
|---|---|---|
| Thêm sản phẩm | ✅ Hoàn thành | Upload ảnh Cloudinary, variants |
| Sửa sản phẩm | ✅ Hoàn thành | Cập nhật toàn bộ thông tin |
| Xóa sản phẩm | ✅ Hoàn thành | Xóa theo ID |
| Danh sách sản phẩm | ✅ Hoàn thành | Populate category, brand |
| Quản lý tồn kho | ✅ Hoàn thành | Theo sản phẩm + theo variant |
| Tìm kiếm sản phẩm | ✅ Hoàn thành | Full-text search MongoDB |
| Lọc sản phẩm | ✅ Hoàn thành | Theo category, brand, giá, tồn kho |
| Flash Sale | ✅ Hoàn thành | Schema hỗ trợ giá + thời gian sale |

**Schema sản phẩm nổi bật:**
- Variants matrix: mỗi variant có SKU, attributes (Color/Storage/RAM), giá riêng, ảnh riêng.
- Specs Map: thông số kỹ thuật dạng key-value (Màn hình, CPU, RAM,...).
- Tags: hỗ trợ full-text search.
- Tự động tính `price`, `offerPrice`, `inStock` từ các variants.

### 3.3 Hệ thống Danh mục & Thương hiệu

| Chức năng | Trạng thái |
|---|---|
| Cây danh mục đa cấp (parentId) | ✅ Hoàn thành |
| Auto-generate slug từ tên | ✅ Hoàn thành |
| Thuộc tính gợi ý theo category | ✅ Hoàn thành |
| Quản lý thương hiệu (Brand) | ✅ Hoàn thành |
| UI quản lý Category (Seller) | ✅ Hoàn thành |
| UI quản lý Brand (Seller) | ✅ Hoàn thành |

### 3.4 Giỏ hàng (Cart)

| Chức năng | Trạng thái |
|---|---|
| Thêm/xóa/cập nhật số lượng | ✅ Hoàn thành |
| Tự động đồng bộ DB khi thay đổi | ✅ Hoàn thành |
| Tính tổng tiền (có thuế 2%) | ✅ Hoàn thành |
| Hiển thị số lượng trên Navbar | ✅ Hoàn thành |

### 3.5 Đặt hàng & Thanh toán

| Chức năng | Trạng thái | Mô tả |
|---|---|---|
| Đặt hàng COD | ✅ Hoàn thành | Thanh toán khi nhận hàng |
| Đặt hàng Stripe | ✅ Hoàn thành | Online payment (USD conversion) |
| Stripe Webhook | ✅ Hoàn thành | Xác nhận thanh toán tự động |
| Snapshot địa chỉ giao hàng | ✅ Hoàn thành | Lưu địa chỉ tại thời điểm đặt |
| Chốt giá tại thời điểm đặt | ✅ Hoàn thành | `price_at_purchase` field |
| Lịch sử đơn hàng (User) | ✅ Hoàn thành | Filter COD + isPaid |
| Quản lý đơn hàng (Seller) | ✅ Hoàn thành | Xem tất cả đơn hàng |
| Trạng thái đơn hàng | ✅ Hoàn thành | 5 bước: Placed→Processing→Shipped→Delivered→Cancelled |

### 3.6 Địa chỉ giao hàng

| Chức năng | Trạng thái |
|---|---|
| Thêm địa chỉ mới | ✅ Hoàn thành |
| Danh sách địa chỉ | ✅ Hoàn thành |
| Bản đồ tích hợp Leaflet | ✅ Hoàn thành |

### 3.7 Hệ thống Đánh giá (Review)

| Chức năng | Trạng thái | Mô tả |
|---|---|---|
| Gửi đánh giá (1–5 sao) | ✅ Hoàn thành | Kèm ảnh upload Cloudinary |
| Chống đánh giá trùng | ✅ Hoàn thành | Unique index (userId + productId) |
| Xem đánh giá | ✅ Hoàn thành | Sort mới nhất, có phân bổ sao |
| Xóa đánh giá | ✅ Hoàn thành | Chỉ xóa được review của mình |
| Cập nhật avgRating sản phẩm | ✅ Hoàn thành | Tự động sau mỗi review |

### 3.8 Theo dõi Hành vi Người dùng

| Chức năng | Trạng thái | Weight |
|---|---|---|
| Ghi nhận lượt xem sản phẩm | ✅ Hoàn thành | 1.0 |
| Ghi nhận thêm vào giỏ | ✅ Hoàn thành | 2.0 |
| Ghi nhận mua hàng | ✅ Hoàn thành | 3.0 |
| Ghi nhận đánh giá | ✅ Hoàn thành | 1.5 |

### 3.9 Hệ thống Gợi ý Sản phẩm (AI/ML) ⭐

Đây là tính năng nổi bật nhất của đồ án.

#### 3.9.1 Kiến trúc Dual-Layer

```
Request → Node.js Controller → Thử Python ML Service (port 5000)
                                        │
                          ML Available? ─────── YES → Trả kết quả ML
                                        │
                                       NO
                                        │
                            Node.js Fallback (TF-IDF)
```

#### 3.9.2 Content-based Filtering (TF-IDF + Cosine Similarity)

- **Nguồn dữ liệu**: Tên sản phẩm, mô tả, danh mục, thương hiệu, tags, khoảng giá.
- **Thuật toán**: TF-IDF vectorization → Cosine Similarity matrix.
- **Triển khai**: Cả Node.js (thư viện `natural`) và Python (scikit-learn).
- **API**: `GET /api/recommendations/product/:productId`

#### 3.9.3 Collaborative Filtering (Matrix Factorization)

- **Mô hình**: User-Item interaction matrix dựa trên UserBehavior logs.
- **Phương pháp**: SVD (Singular Value Decomposition) qua scipy.
- **API**: Gọi từ ML Service `/ml/recommend/user/:userId`

#### 3.9.4 Hybrid Recommendation

- **Công thức**: `hybrid_score = α * CF_score + (1-α) * CB_score`
- **Cold Start**: Người dùng < 5 tương tác → α = 0.0 (pure Content-based)
- **Warm Start**: Người dùng ≥ 5 tương tác → α = 0.6 (ưu tiên CF)
- **API**: `GET /api/recommendations/user/:userId`

#### 3.9.5 Trending Products

- Tổng hợp behavior scores trong 7 ngày gần nhất.
- Fallback: sản phẩm mới nhất nếu chưa có dữ liệu.
- **API**: `GET /api/recommendations/trending`

#### 3.9.6 Frequently Bought Together

- Phân tích co-occurrence trong lịch sử đơn hàng.
- Fallback: Content-based khi chưa đủ dữ liệu.
- **API**: `GET /api/recommendations/bought-together/:productId`

#### 3.9.7 Đánh giá ML (Evaluation)

- **Precision@K** và **Recall@K** cho cả CB và CF.
- **API**: `GET /ml/evaluate?k=5`

---

## PHẦN 4 – CƠ SỞ DỮ LIỆU

### 4.1 Sơ đồ ERD (tóm tắt)

```
User ──────────── Order ──────────── Product
  │    (1:N)        │     (N:M)        │
  │                 │                  │
  ├── UserBehavior  │              Category (tree)
  │      (N)        │              Brand
  └── Review ───────┘
       (1 per product)
```

### 4.2 Các Collection MongoDB

| Collection | Số fields chính | Ghi chú |
|---|---|---|
| users | name, email, password, cartItems, role | JWT auth |
| products | name, description, variants[], image[], specs{}, tags[], flashSale | Schema phức tạp nhất |
| categories | name, slug, parentId, suggestedAttributes[] | Đa cấp, auto-slug |
| brands | name, slug, logo, isActive | Liên kết với product, hỗ trợ ẩn/hiện |
| orders | userId, items[], amount, shippingAddress{}, status, paymentType | Snapshot địa chỉ |
| reviews | userId, productId, rating, comment, images[] | Unique per user/product |
| userbehaviors | userId, productId, eventType, weight, metadata | 4 loại event |
| addresses | firstname, lastname, phone, street, city, state, zipcode | Địa chỉ giao hàng |
| recommendations | type, referenceId, recommendations[], algorithm | Cache gợi ý, TTL 24h |

### 4.3 Indexes quan trọng

```javascript
// Product - tìm kiếm
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ name: 'text', tags: 'text' });

// Order - lịch sử đơn hàng
orderSchema.index({ userId: 1, createdAt: -1 });

// Review - chống trùng
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// UserBehavior - query nhanh
userBehaviorSchema.index({ userId: 1, productId: 1 });
userBehaviorSchema.index({ timestamp: -1 });
```

---

## PHẦN 5 – API ENDPOINTS

### 5.1 User API (`/api/user`)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /register | Đăng ký |
| POST | /login | Đăng nhập |
| GET | /logout | Đăng xuất |
| GET | /is-auth | Kiểm tra auth |

### 5.2 Product API (`/api/product`)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /add | Thêm sản phẩm |
| GET | /list | Danh sách |
| POST | /id | Chi tiết |
| PUT | /edit | Sửa |
| DELETE | /delete | Xóa |
| POST | /stock | Cập nhật tồn kho |
| GET | /search | Tìm kiếm |
| POST | /recommend | Gợi ý CB |

### 5.3 Order API (`/api/order`)

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /cod | Đặt COD |
| POST | /stripe | Đặt Online |
| GET | /user | Đơn của tôi |
| GET | /seller | Tất cả đơn |
| POST | /stripe-webhook | Stripe webhook |

### 5.4 Recommendation API (`/api/recommendations`)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /product/:id | Sản phẩm tương tự |
| GET | /user/:userId | Gợi ý cá nhân |
| GET | /trending | Trending 7 ngày |
| GET | /bought-together/:id | Mua cùng nhau |

### 5.5 ML Service API (Flask, port 5000)

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /ml/recommend/content/:id | Content-based |
| GET | /ml/recommend/user/:userId | Hybrid CF+CB |
| GET | /ml/recommend/trending | Trending |
| GET | /ml/evaluate?k=5 | Đánh giá |
| GET | /ml/health | Health check |

---

## PHẦN 6 – GIAO DIỆN NGƯỜI DÙNG

### 6.1 Trang Khách hàng

| Trang | Route | Chức năng |
|---|---|---|
| Trang chủ | `/` | Banner, categories, gợi ý, trending |
| Tất cả sản phẩm | `/products` | Grid + filter |
| Danh mục | `/products/:category` | Lọc theo danh mục |
| Chi tiết sản phẩm | `/products/:category/:id` | Ảnh, variants, đánh giá, gợi ý |
| Giỏ hàng | `/cart` | Quản lý + thanh toán |
| Thêm địa chỉ | `/add-address` | Địa chỉ giao hàng + bản đồ |
| Đơn hàng | `/my-orders` | Lịch sử mua hàng |
| Loader | `/loader` | Chuyển hướng sau Stripe |
| Chính sách | `/delivery-policy`, v.v. | Trang chính sách |

### 6.2 Trang Seller/Admin

| Trang | Route | Chức năng |
|---|---|---|
| Tổng quan | `/seller/dashboard` | Thống kê doanh thu, đơn hàng gần đây, cảnh báo hết hàng |
| Thêm sản phẩm | `/seller` | Form nhập liệu, upload ảnh Cloudinary, variant matrix |
| Danh sách sản phẩm | `/seller/product-list` | Bảng dữ liệu, filter (Danh mục, Thương hiệu, Trạng thái), sort, thống kê nhanh, edit/delete |
| Đơn hàng | `/seller/orders` | Tìm kiếm, lọc theo trạng thái thanh toán, thống kê tổng quan |
| Danh mục | `/seller/categories` | CRUD category cây đa cấp, thuộc tính gợi ý |
| Thương hiệu | `/seller/brands` | CRUD brand dạng grid card, toggle ẩn/hiện |

> **Lưu ý**: Tất cả các trang seller đều có nút **Làm mới** để tải lại dữ liệu mà không cần F5. Giao diện sử dụng icon SVG thay vì emoji để đảm bảo tính chuyên nghiệp.

### 6.3 Components nổi bật

- **ProductCard**: Hiển thị sản phẩm với giá thấp nhất, % giảm giá, rating, tồn kho.
- **ReviewSection**: Đánh giá đầy đủ với phân bổ sao, upload ảnh.
- **RecommendationSection**: Hiển thị gợi ý AI theo từng loại.
- **BestSeller**: Hiển thị danh sách sản phẩm bán chạy.
- **Categories**: Component hiển thị lưới/danh mục nổi bật trang chủ.
- **Navbar & Footer**: Component điều hướng chính, tích hợp giỏ hàng real-time.
- **ProductForm**: Form tạo/sửa sản phẩm với variant matrix, auto-tính giảm giá.
- **ProductTable**: Bảng sản phẩm seller với tooltip biến thể, toggle trạng thái.
- **ProductFilter**: Bộ lọc sản phẩm seller theo danh mục, thương hiệu, trạng thái, sort.
- **Skeleton**: Loading skeleton animation.
- **MapComponent**: Bản đồ Leaflet chọn địa chỉ.
- **MainBanner**: Banner động trang chủ.
- **ScrollToTop**: Nút cuộn lên đầu trang.

---

## PHẦN 7 – BẢO MẬT

| Biện pháp | Triển khai |
|---|---|
| Mật khẩu | bcryptjs hash (salt rounds 10) |
| Authentication | JWT (7 ngày) + HTTP-only Cookie |
| CORS | Whitelist origin (localhost + Vercel) |
| CSRF | SameSite=strict (dev) / none+secure (prod) |
| Role-based | Middleware authUser, authSeller |
| Stripe Webhook | Signature verification |

---

## PHẦN 8 – TRIỂN KHAI (DEPLOYMENT)

| Thành phần | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://mystore-webnangcao.vercel.app |
| Backend (Node.js) | Vercel | Configured via vercel.json |
| Database | MongoDB Atlas | Cloud cluster |
| Ảnh | Cloudinary | CDN toàn cầu |
| ML Service | Local / Server riêng | Port 5000 |

---

## PHẦN 9 – CÔNG VIỆC ĐÃ THỰC HIỆN GẦN ĐÂY

### 9.1 Cải thiện UI/UX Seller Dashboard (Hoàn thành)
- [x] Tạo trang Tổng quan (Dashboard) với thống kê doanh thu, đơn hàng, cảnh báo hết hàng
- [x] Nâng cấp trang Đơn hàng: thêm tìm kiếm, lọc theo trạng thái, thống kê tổng quan
- [x] Thêm thống kê nhanh vào trang Danh sách sản phẩm (Tổng SP / Còn hàng / Hết hàng)
- [x] Bổ sung bộ lọc Thương hiệu (Brand filter) đồng bộ với Danh mục trong trang quản lý sản phẩm
- [x] Cải thiện ProductForm: thay alert() bằng toast, auto-tính % giảm giá
- [x] Fix bug hiển thị địa chỉ giao hàng trong đơn hàng seller

### 9.2 Chuyên nghiệp hóa giao diện (Hoàn thành)
- [x] Thay thế toàn bộ emoji icon bằng SVG icon (Heroicons) trên tất cả trang seller
- [x] Thêm nút Làm mới vào tất cả trang seller (Dashboard, ProductList, Orders, Categories, Brands)
- [x] Loại bỏ chữ "Từ" trước giá — chỉ hiển thị giá thấp nhất
- [x] Việt hóa toàn bộ thông báo và giao diện

### 9.3 Backend Review & Bug Fix (Hoàn thành)
- [x] Review toàn bộ 11 controller modules
- [x] Sửa lỗi mapping shippingAddress trong Orders
- [x] Chuẩn hóa error handling và response format

### 9.4 Kế hoạch tiếp theo
- [ ] Tối ưu hiệu năng: lazy loading, caching, pagination
- [ ] Kiểm thử bảo mật (XSS, CSRF, injection)
- [ ] Viết báo cáo cuối kỳ hoàn chỉnh
- [ ] Chuẩn bị slide thuyết trình và demo

---

## PHẦN 10 – KẾT QUẢ ĐẠT ĐƯỢC

### Tóm tắt tiến độ

| Nhóm chức năng | Hoàn thành |
|---|---|
| Xác thực người dùng | 100% |
| Quản lý sản phẩm (CRUD + variants) | 100% |
| Danh mục & Thương hiệu | 100% |
| Giỏ hàng | 100% |
| Đặt hàng & Thanh toán (COD + Stripe) | 100% |
| Đánh giá sản phẩm | 100% |
| Gợi ý sản phẩm (Node.js fallback) | 100% |
| ML Service Python (Flask) | 90% |
| Dashboard Seller | 100% |
| UI/UX hoàn chỉnh | 95% |

### Điểm nổi bật kỹ thuật
1. **Dual-layer Recommendation**: Hệ thống gợi ý 2 tầng (ML Python + Node.js fallback) đảm bảo luôn có kết quả ngay cả khi ML service không khả dụng.
2. **Hybrid Algorithm**: Kết hợp Content-based và Collaborative Filtering với chiến lược Cold Start thông minh.
3. **Variant Matrix**: Schema sản phẩm hỗ trợ biến thể linh hoạt (Color × Storage × RAM) với giá và ảnh riêng từng biến thể.
4. **Price Integrity**: Chốt giá tại thời điểm đặt hàng, snapshot địa chỉ giao hàng – dữ liệu không bị ảnh hưởng khi cập nhật sau.
5. **Behavior Tracking**: Thu thập hành vi người dùng (view, cart, purchase, rating) với weight khác nhau để training ML.
6. **Seller Dashboard**: Trang tổng quan chuyên nghiệp với thống kê doanh thu, đơn hàng gần đây, cảnh báo tồn kho, và nút làm mới dữ liệu.
7. **Professional UI**: Toàn bộ icon sử dụng SVG (Heroicons), giao diện Việt hóa, không sử dụng emoji — đảm bảo tính chuyên nghiệp.

---

*Báo cáo được tạo tự động từ phân tích source code dự án MyStore – HK252*
*Ngày tạo: 03/05/2026 | Cập nhật lần cuối: 12/05/2026*
