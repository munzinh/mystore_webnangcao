# CONG THUC HE THONG GOI Y SAN PHAM DANG SU DUNG TRONG WEBSITE MYSTORE

## 1. Tong quan mo hinh recommendation

Website MyStore su dung mo hinh goi y lai (Hybrid Recommendation), ket hop hai nhom thuat toan:

- **Content-based Filtering (CB):** goi y san pham tuong tu dua tren noi dung san pham nhu ten, danh muc, mo ta va nhom gia.
- **Collaborative Filtering (CF):** goi y san pham dua tren hanh vi cua nguoi dung trong toan he thong bang ma tran tuong tac User-Item va Truncated SVD.
- **Hybrid Recommendation:** tron diem CF va CB de tao danh sach goi y ca nhan hoa.

API goi y chinh duoc website su dung:

```text
GET /api/recommendations/product/:productId
GET /api/recommendations/user/:userId
GET /api/recommendations/trending
GET /api/recommendations/bought-together/:productId
```

Module ML phia Python xu ly:

```text
GET /ml/recommend/content/<productId>
GET /ml/recommend/user/<userId>
GET /ml/recommend/trending
```

---

## 2. Du lieu hanh vi nguoi dung

He thong thu thap hanh vi nguoi dung vao collection `userbehaviors`. Moi hanh vi duoc anh xa thanh mot trong so hoc may de xay dung ma tran tuong tac.

| Hanh vi | Y nghia | Trong so |
| :--- | :--- | ---: |
| `view` | Nguoi dung xem chi tiet san pham | 1.0 |
| `add_to_cart` | Nguoi dung them san pham vao gio hang | 2.0 |
| `purchase` | Nguoi dung mua san pham | 3.0 |
| `rating` | Nguoi dung danh gia san pham | 2.5 |

Doi voi hanh vi `view`, he thong loc trung lap trong vong 30 phut. Neu nguoi dung xem lai cung mot san pham trong 30 phut, he thong khong cong them trong so moi de giam nhieu du lieu.

Cong thuc tinh diem tuong tac giua nguoi dung `u` va san pham `p`:

$$
R_{u,p} = \sum_{e \in E_{u,p}} w_e
$$

Trong do:

- $R_{u,p}$ la diem tuong tac tong hop giua user $u$ va product $p$.
- $E_{u,p}$ la tap cac hanh vi ma user $u$ da thuc hien tren product $p$.
- $w_e$ la trong so cua hanh vi $e$.

Vi du:

Neu mot nguoi dung xem san pham 1 lan, them vao gio hang 1 lan va mua san pham do, diem tuong tac la:

$$
R_{u,p} = 1.0 + 2.0 + 3.0 = 6.0
$$

---

## 3. Content-based Filtering bang TF-IDF va Cosine Similarity

### 3.1. Vector dac trung san pham

Moi san pham duoc bieu dien thanh mot chuoi dac trung tong hop:

$$
F_p = name_p + category_p + description_p + priceBin_p
$$

Trong do:

- $name_p$: ten san pham.
- $category_p$: danh muc san pham.
- $description_p$: mo ta san pham.
- $priceBin_p$: nhom gia cua san pham.

He thong chia gia san pham thanh 4 nhom:

| Dieu kien gia | Nhom gia |
| :--- | :--- |
| $price < 3,000,000$ | `budget` |
| $3,000,000 \le price < 10,000,000$ | `mid` |
| $10,000,000 \le price < 25,000,000$ | `high` |
| $price \ge 25,000,000$ | `premium` |

Sau do, cac chuoi dac trung duoc dua vao `TfidfVectorizer` voi cau hinh:

```text
max_features = 5000
ngram_range = (1, 2)
min_df = 1
stop_words = None
```

### 3.2. Cong thuc TF-IDF

TF-IDF dung de chuyen noi dung san pham thanh vector so. Cong thuc:

$$
TF(t,d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}
$$

$$
IDF(t,D) = \log \left(\frac{|D|}{|\{d \in D: t \in d\}|}\right)
$$

$$
TFIDF(t,d,D) = TF(t,d) \times IDF(t,D)
$$

Trong do:

- $t$ la tu khoa.
- $d$ la van ban dac trung cua mot san pham.
- $D$ la tap toan bo san pham.
- $f_{t,d}$ la so lan tu $t$ xuat hien trong san pham $d$.

Sau buoc TF-IDF, moi san pham $p$ duoc bieu dien boi mot vector:

$$
\vec{x}_p = [w_{p,1}, w_{p,2}, ..., w_{p,n}]
$$

### 3.3. Cong thuc Cosine Similarity

Do tuong tu giua hai san pham $p_i$ va $p_j$ duoc tinh bang cosine similarity:

$$
sim(p_i,p_j) =
\frac{\vec{x}_{p_i} \cdot \vec{x}_{p_j}}
{\|\vec{x}_{p_i}\| \times \|\vec{x}_{p_j}\|}
$$

Viet day du:

$$
sim(p_i,p_j) =
\frac{\sum_{k=1}^{n} x_{i,k}x_{j,k}}
{\sqrt{\sum_{k=1}^{n} x_{i,k}^{2}} \sqrt{\sum_{k=1}^{n} x_{j,k}^{2}}}
$$

San pham co diem $sim(p_i,p_j)$ cang cao thi noi dung cang giong nhau. Khi nguoi dung dang xem mot san pham, website lay cac san pham co diem cosine similarity cao nhat de hien thi o phan "San pham tuong tu".

---

## 4. Collaborative Filtering bang ma tran User-Item va Truncated SVD

### 4.1. Ma tran tuong tac User-Item

Tu collection `userbehaviors`, he thong tao ma tran tuong tac:

$$
R =
\begin{bmatrix}
R_{1,1} & R_{1,2} & \dots & R_{1,n} \\
R_{2,1} & R_{2,2} & \dots & R_{2,n} \\
\dots & \dots & \dots & \dots \\
R_{m,1} & R_{m,2} & \dots & R_{m,n}
\end{bmatrix}
$$

Trong do:

- $m$ la so nguoi dung.
- $n$ la so san pham.
- $R_{u,p}$ la tong trong so hanh vi cua user $u$ voi product $p$.
- Neu user chua tuong tac voi product, $R_{u,p} = 0$.

### 4.2. Cong thuc Truncated SVD

Vi ma tran User-Item thuong rat thua, he thong dung Truncated SVD de giam chieu va hoc cac dac trung an:

$$
R \approx U_k \Sigma_k V_k^T
$$

Trong code, `n_components = 20`, nhung gia tri nay duoc gioi han theo kich thuoc du lieu:

$$
k = \min(20, \min(m,n) - 1)
$$

Trong do:

- $U_k$ la ma tran dac trung an cua nguoi dung.
- $\Sigma_k$ la ma tran duong cheo chua singular values.
- $V_k^T$ la ma tran dac trung an cua san pham.
- $k$ la so chieu dac trung an.

Sau khi huan luyen, he thong thu duoc:

$$
P = U_k \Sigma_k
$$

$$
Q = V_k
$$

Trong do:

- $\vec{p}_u$ la vector dac trung an cua user $u$.
- $\vec{q}_i$ la vector dac trung an cua product $i$.

Diem du doan cua user $u$ voi product $i$:

$$
\hat{R}_{u,i} = \vec{p}_u \cdot \vec{q}_i^T
$$

He thong sap xep cac san pham chua tung duoc user tuong tac theo $\hat{R}_{u,i}$ giam dan va lay top-N san pham lam ket qua Collaborative Filtering.

---

## 5. Chuan hoa diem CF va CB

Truoc khi tron diem, he thong chuan hoa diem ve khoang $[0,1]$ bang Min-Max Normalization.

Voi diem CF:

$$
Score_{CF}^{norm}(u,p) =
\frac{Score_{CF}(u,p) - Score_{CF}^{min}}
{Score_{CF}^{max} - Score_{CF}^{min}}
$$

Voi diem CB:

$$
Score_{CB}^{norm}(p) =
\frac{Score_{CB}(p) - Score_{CB}^{min}}
{Score_{CB}^{max} - Score_{CB}^{min}}
$$

Neu $max = min$, he thong dat mau so bang 1 de tranh loi chia cho 0.

---

## 6. Hybrid Recommendation

He thong dung cong thuc ket hop tuyen tinh:

$$
Score_{Hybrid}(u,p) =
\alpha \cdot Score_{CF}^{norm}(u,p)
+ (1 - \alpha) \cdot Score_{CB}^{norm}(p)
$$

Voi nguoi dung co du du lieu hanh vi:

$$
\alpha = 0.6
$$

Do do cong thuc dang dung trong website la:

$$
Score_{Hybrid}(u,p) =
0.6 \cdot Score_{CF}^{norm}(u,p)
+ 0.4 \cdot Score_{CB}^{norm}(p)
$$

Y nghia:

- 60% diem den tu Collaborative Filtering, phan anh hanh vi cong dong va so thich ca nhan.
- 40% diem den tu Content-based Filtering, phan anh do tuong tu noi dung voi san pham nguoi dung vua tuong tac gan nhat.

Danh sach goi y cuoi cung:

$$
Recommend(u) = TopN_{p \notin I_u}(Score_{Hybrid}(u,p))
$$

Trong do:

- $I_u$ la tap san pham user $u$ da tuong tac.
- $TopN$ la danh sach $N$ san pham co diem cao nhat.

---

## 7. Xu ly Cold-start Problem

He thong dat nguong toi thieu de dung Collaborative Filtering:

$$
N_u \ge 5
$$

Trong do $N_u$ la so hanh vi cua nguoi dung $u$.

### Truong hop 1: User co tu 5 hanh vi tro len

Dung Hybrid Recommendation:

$$
Score_{Hybrid}(u,p) =
0.6 \cdot Score_{CF}^{norm}(u,p)
+ 0.4 \cdot Score_{CB}^{norm}(p)
$$

### Truong hop 2: User co it hon 5 hanh vi nhung da co san pham tuong tac gan nhat

Bo qua CF va dung Content-based:

$$
Score(u,p) = sim(p_{last},p)
$$

Trong do:

- $p_{last}$ la san pham user vua xem/them gio/mua/danh gia gan nhat.
- $p$ la san pham ung vien.

### Truong hop 3: User chua co hanh vi nao

He thong goi y san pham pho bien hoặc san pham dang con hang:

$$
Score(u,p) = 0.5
$$

Day la diem mac dinh trong nhanh `cold_start_popular` cua module Hybrid khi user chua co behavior nao. O API trending, he thong co the tinh diem pho bien dua tren tong trong so hanh vi cong dong:

$$
Score_{Trending}(p) =
\sum_{u \in U} \sum_{e \in E_{u,p}} w_e
$$

---

## 8. Goi y Trending

Goi y trending duoc tinh bang cach tong hop diem hanh vi cua tat ca nguoi dung theo tung san pham:

$$
Score_{Trending}(p) =
1.0 \cdot ViewCount(p)
+ 2.0 \cdot AddToCartCount(p)
+ 3.0 \cdot PurchaseCount(p)
+ 2.5 \cdot RatingCount(p)
$$

San pham co $Score_{Trending}$ cao hon se duoc uu tien hien thi truoc. Neu chua co du lieu hanh vi, he thong fallback sang danh sach san pham moi nhat hoặc san pham dang con hang.

---

## 9. Goi y "Thuong mua cung nhau"

Khu vuc gio hang co chuc nang goi y san pham mua cung nhau. Y tuong la dua tren co-occurrence trong cac don hang:

$$
CoOccur(p_i,p_j) =
|\{o \in O: p_i \in o \land p_j \in o\}|
$$

Trong do:

- $O$ la tap tat ca don hang.
- $p_i$ la san pham dang xet.
- $p_j$ la san pham ung vien.
- $CoOccur(p_i,p_j)$ la so don hang co dong thoi hai san pham.

San pham co so lan xuat hien cung san pham hien tai nhieu hon se duoc goi y truoc. Neu khong co du lieu don hang du, he thong fallback sang Content-based Filtering:

$$
Score(p_i,p_j) = sim(p_i,p_j)
$$

---

## 10. Danh gia hieu qua thuat toan

He thong co module danh gia offline bang Precision@K va Recall@K.

### 10.1. Precision@K

$$
Precision@K =
\frac{|Recommended_K \cap Relevant|}
{K}
$$

Y nghia: trong top-K san pham duoc goi y, co bao nhieu san pham that su phu hop.

### 10.2. Recall@K

$$
Recall@K =
\frac{|Recommended_K \cap Relevant|}
{|Relevant|}
$$

Y nghia: trong tap san pham phu hop thuc te, he thong tim lai duoc bao nhieu san pham trong top-K.

### 10.3. Cach danh gia trong code

He thong dung leave-one-out validation:

1. Lay cac user co du so luong hanh vi toi thieu.
2. An mot san pham da tuong tac lam `test_product`.
3. Dung cac hanh vi con lai de tao goi y.
4. Kiem tra `test_product` co nam trong top-K recommendation hay khong.
5. Tinh trung binh Precision@K va Recall@K tren cac user duoc danh gia.

Ngoai danh gia offline, bao cao co the bo sung danh gia bang khao sat nguoi dung theo thang Likert 1-5 ve:

- Do phu hop cua san pham goi y.
- Muc do huu ich khi kham pha san pham.
- Muc do hai long chung voi trai nghiem ca nhan hoa.

---

## 11. Tom tat cong thuc chinh

| Thanh phan | Cong thuc |
| :--- | :--- |
| Diem hanh vi user-product | $R_{u,p} = \sum_{e \in E_{u,p}} w_e$ |
| TF-IDF | $TFIDF(t,d,D) = TF(t,d) \times IDF(t,D)$ |
| Cosine Similarity | $sim(p_i,p_j)=\frac{\vec{x}_{p_i}\cdot\vec{x}_{p_j}}{\|\vec{x}_{p_i}\|\|\vec{x}_{p_j}\|}$ |
| Truncated SVD | $R \approx U_k \Sigma_k V_k^T$ |
| Diem du doan CF | $\hat{R}_{u,i} = \vec{p}_u \cdot \vec{q}_i^T$ |
| Min-Max Normalization | $x'=\frac{x-x_{min}}{x_{max}-x_{min}}$ |
| Hybrid Score | $Score_{Hybrid}=0.6Score_{CF}^{norm}+0.4Score_{CB}^{norm}$ |
| Cold-start CB | $Score(u,p)=sim(p_{last},p)$ |
| Trending Score | $Score_{Trending}(p)=\sum_{u \in U}\sum_{e \in E_{u,p}} w_e$ |
| Bought Together | $CoOccur(p_i,p_j)=|\{o \in O:p_i \in o \land p_j \in o\}|$ |

