# Tài liệu Hướng dẫn Backend - Chức năng Quản lý Sản phẩm (Product)

Tài liệu này tổng hợp toàn bộ thông tin kiến trúc backend, sơ đồ cơ sở dữ liệu và các thành phần mã nguồn liên quan đến **Chức năng Quản lý Sản phẩm (Product)** trong hệ thống.

---

## 1. Cơ sở dữ liệu (Database Schema)

Chức năng Quản lý Sản phẩm sử dụng bảng chính là `products` và có truy vấn kết hợp với bảng `inventory` để tính tổng tồn kho.

### Bảng `products`

| Thuộc tính (Column) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| `custom_id` | `TEXT` | `PRIMARY KEY` | Mã sản phẩm duy nhất (Ví dụ: `SP001`, `PROD_123`) |
| `name` | `TEXT` | `NOT NULL` | Tên sản phẩm |
| `description` | `TEXT` | | Mô tả chi tiết về sản phẩm |
| `price` | `REAL` | `NOT NULL` | Đơn giá sản phẩm |
| `category` | `TEXT` | | Danh mục sản phẩm (Phân loại) |
| `brand` | `TEXT` | | Thương hiệu / Thẻ nhãn |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Thời gian khởi tạo bản ghi sản phẩm |

---

## 2. Nơi học & Các File liên quan (Source Files)

Để hiểu chi tiết backend chức năng Sản phẩm, bạn cần học các file sau:

1. **[schema.sql](file:///home/nitro/Project/ql_kho_new/backend/schema.sql#L11-L19)**: Cấu trúc câu lệnh khởi tạo bảng `products`.
2. **[models/product.js](file:///home/nitro/Project/ql_kho_new/backend/models/product.js)**: Chứa toàn bộ logic thao tác dữ liệu sản phẩm, tìm kiếm nâng cao, phân trang và tính toán tổng tồn kho.
3. **[routes/product.js](file:///home/nitro/Project/ql_kho_new/backend/routes/product.js)**: Định nghĩa các API route, validation dữ liệu đầu vào, rate limiting và hỗ trợ xuất dữ liệu ra CSV.

---

## 3. Các hàm Backend chi tiết (Backend Functions)

### A. Thao tác dữ liệu (`models/product.js`)

* **[`createProduct(name, description, price, category, brand, customId)`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L26-L71)**
  * **Mô tả**: Tạo mới một sản phẩm. Kiểm tra trùng `custom_id`, xử lý tên sản phẩm rỗng.
* **[`getProducts(search, category, brand, page, limit)`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L81-L156)**
  * **Mô tả**: Lấy danh sách sản phẩm hỗ trợ bộ lọc (tìm kiếm tên, mã, mô tả, hãng, danh mục) và phân trang. Kết hợp `LEFT JOIN inventory` để trả về tổng tồn kho hiện có của sản phẩm across tất cả các kho.
* **[`getProductById(id)`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L161-L177)**
  * **Mô tả**: Truy vấn chi tiết một sản phẩm theo `custom_id` kèm theo số lượng tồn kho tổng.
* **[`updateProduct(id, updates)`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L182-L250)**
  * **Mô tả**: Cập nhật các thông tin của sản phẩm. Kiểm tra tính duy nhất nếu đổi mã `custom_id`.
* **[`deleteProduct(id)`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L255-L282)**
  * **Mô tả**: Xóa sản phẩm. Đồng thời tự động xóa toàn bộ dữ liệu tồn kho liên quan trong bảng `inventory`.
* **[`getProductsCount()`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L286-L297)**
  * **Mô tả**: Lấy tổng số lượng loại sản phẩm có trong hệ thống.
* **[`getUniqueBrands()`](file:///home/nitro/Project/ql_kho_new/backend/models/product.js#L301-L312)**
  * **Mô tả**: Trả về danh sách tên các thương hiệu sản phẩm duy nhất đang tồn tại.

---

### B. API Endpoints (`routes/product.js`)

| Phương thức | Đường dẫn API | Hàm Model / Middleware sử dụng | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | `getProducts()` | Lấy danh sách sản phẩm (có lọc & phân trang) |
| `GET` | `/products/count` | `getProductsCount()` | Lấy tổng số loại sản phẩm |
| `GET` | `/products/export` | `getProducts()` | Xuất danh sách sản phẩm ra file CSV (UTF-8 có BOM) |
| `GET` | `/products/brands` | `getUniqueBrands()` | Lấy danh sách danh mục thương hiệu |
| `GET` | `/products/:id` | `getProductById()` | Lấy chi tiết thông tin 1 sản phẩm |
| `POST` | `/products` | `createProduct()`, `rateLimiter` | Tạo sản phẩm mới (có giới hạn request rate limit) |
| `PUT` | `/products/:id` | `updateProduct()` | Cập nhật thông tin sản phẩm |
| `DELETE` | `/products/:id` | `deleteProduct()` | Xóa sản phẩm và tồn kho liên quan |
