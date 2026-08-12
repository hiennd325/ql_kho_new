# Tài liệu Hướng dẫn Backend - Chức năng Kiểm kê Kho (Stock Audit / Inventory Audit)

Tài liệu này tổng hợp toàn bộ thông tin kiến trúc backend, sơ đồ cơ sở dữ liệu và các thành phần mã nguồn liên quan đến **Chức năng Kiểm kê Kho (Audit)** trong hệ thống.

---

## 1. Cơ sở dữ liệu (Database Schema)

Chức năng Kiểm kê Kho sử dụng 2 bảng chính: `audits` (Phiếu kiểm kê) và `audit_items` (Chi tiết kiểm kê từng sản phẩm), cùng với sự tham chiếu đến các bảng `warehouses`, `users`, `products`.

### A. Bảng `audits` (Phiếu kiểm kê)

| Thuộc tính (Column) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | ID tự tăng của phiếu kiểm kê |
| `code` | `TEXT` | `UNIQUE NOT NULL` | Mã phiếu kiểm kê (Ví dụ: `AUDIT1690000000000`) |
| `date` | `DATETIME` | `NOT NULL` | Ngày thực hiện kiểm kê |
| `warehouse_id` | `TEXT` | `NOT NULL, FK -> warehouses(custom_id)` | Mã kho được kiểm kê |
| `created_by_user_id` | `INTEGER` | `NOT NULL, FK -> users(id)` | ID người dùng tạo phiếu kiểm kê |
| `discrepancy` | `REAL` | `NOT NULL` | Tổng mức chênh lệch (tổng giá trị tuyệt đối |thực tế - hệ thống|) |
| `status` | `TEXT` | `NOT NULL, CHECK (status IN ('pending', 'completed', 'cancelled'))` | Trạng thái phiếu (`pending`, `completed`, `cancelled`) |
| `notes` | `TEXT` | | Ghi chú chung phiếu kiểm kê |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo phiếu |

---

### B. Bảng `audit_items` (Chi tiết sản phẩm kiểm kê)

| Thuộc tính (Column) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | ID tự tăng dòng chi tiết |
| `audit_id` | `INTEGER` | `NOT NULL, FK -> audits(id) ON DELETE CASCADE` | ID phiếu kiểm kê tương ứng |
| `product_id` | `TEXT` | `NOT NULL, FK -> products(custom_id)` | Mã sản phẩm được kiểm kê |
| `system_quantity` | `INTEGER` | `NOT NULL` | Số lượng tồn kho ghi nhận trên hệ thống |
| `actual_quantity` | `INTEGER` | `NOT NULL` | Số lượng tồn kho kiểm đếm thực tế |
| `discrepancy` | `INTEGER` | `NOT NULL` | Chênh lệch (`actual_quantity - system_quantity`) |
| `notes` | `TEXT` | | Ghi chú dòng kiểm kê sản phẩm |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo bản ghi |

---

## 2. Nơi học & Các File liên quan (Source Files)

Để hiểu chi tiết backend chức năng Kiểm kê, bạn cần học các file sau:

1. **[schema.sql](file:///home/nitro/Project/ql_kho_new/backend/schema.sql#L107-L132)**: Định nghĩa bảng `audits` và `audit_items` với ràng buộc khóa ngoại `ON DELETE CASCADE`.
2. **[routes/inventory.js](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js#L399-L740)**: Nơi xử lý trực tiếp toàn bộ logic nghiệp vụ kiểm kê kho (tạo phiếu kiểm kê sử dụng Transaction SQL, tính toán chênh lệch, xóa phiếu, xem chi tiết và xuất báo cáo CSV).

---

## 3. Các hàm & Endpoints Backend chi tiết (Backend Functions & Endpoints)

Logic nghiệp vụ Kiểm kê kho được triển khai trực tiếp trong file **[routes/inventory.js](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js)** với các endpoint sau:

### A. Route Tạo phiếu kiểm kê mới (`POST /inventory/audits`)
* **File & Vị trí**: [`routes/inventory.js` (dòng 680 - 740)](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js#L680-L740)
* **Xử lý nghiệp vụ**:
  1. Kiểm tra tham số bắt buộc: `warehouse_id`, `date`, mảng `items`.
  2. Khởi tạo SQL Transaction (`BEGIN TRANSACTION`).
  3. Sinh mã tự động `AUDIT<timestamp>`.
  4. Tính tổng chênh lệch toàn phiếu `totalDiscrepancy += Math.abs(actual_quantity - system_quantity)`.
  5. Thêm bản ghi vào bảng `audits`.
  6. Duyệt qua mảng `items`, chèn từng sản phẩm vào bảng `audit_items` với chênh lệch đại số `actual_quantity - system_quantity`.
  7. Thực hiện `COMMIT` transaction (hoặc `ROLLBACK` nếu có lỗi).

---

### B. Route Xem chi tiết phiếu kiểm kê (`GET /inventory/audits/:id`)
* **File & Vị trí**: [`routes/inventory.js` (dòng 399 - 525)](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js#L399-L525)
* **Xử lý nghiệp vụ**:
  * Thực hiện `JOIN` giữa `audits`, `warehouses`, `users` để lấy thông tin chung của phiếu kiểm kê.
  * Thực hiện `JOIN` giữa `audit_items` và `products` để lấy danh sách sản phẩm, số lượng hệ thống, số lượng thực tế và chênh lệch.

---

### C. Route Xuất báo cáo kiểm kê ra CSV (`GET /inventory/audits/:id/export`)
* **File & Vị trí**: [`routes/inventory.js` (dòng 532 - 602)](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js#L532-L602)
* **Xử lý nghiệp vụ**:
  * Lấy dữ liệu phiếu kiểm kê và danh sách sản phẩm kiểm kê.
  * Định dạng nội dung CSV kèm thông tin kho, người lập phiếu, danh sách sản phẩm.
  * Trả về kết quả với Header `text/csv; charset=utf-8` và ký tự UTF-8 BOM (`\uFEFF`) để đọc tiếng Việt trên Excel không bị lỗi font.

---

### D. Route Xóa phiếu kiểm kê (`DELETE /inventory/audits/:id`)
* **File & Vị trí**: [`routes/inventory.js` (dòng 608 - 668)](file:///home/nitro/Project/ql_kho_new/backend/routes/inventory.js#L608-L668)
* **Xử lý nghiệp vụ**:
  * Thực hiện xóa phiếu trong bảng `audits`.
  * Nhờ cài đặt `ON DELETE CASCADE` trong SQLite, toàn bộ các dòng chi tiết trong `audit_items` tương ứng sẽ tự động bị xóa theo.

---

## 4. Tóm tắt API Endpoints Kiểm kê Kho

| Phương thức | Đường dẫn API | Vị trí định nghĩa trong Route | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `POST` | `/inventory/audits` | `routes/inventory.js:L680` | Tạo phiếu kiểm kê kho mới |
| `GET` | `/inventory/audits/:id` | `routes/inventory.js:L399` | Xem chi tiết phiếu kiểm kê & danh sách sản phẩm kiểm kê |
| `GET` | `/inventory/audits/:id/export` | `routes/inventory.js:L532` | Xuất phiếu kiểm kê ra file CSV |
| `DELETE` | `/inventory/audits/:id` | `routes/inventory.js:L608` | Xóa phiếu kiểm kê kho |
