# Tài liệu Hướng dẫn Backend - Chức năng Quản lý Kho (Warehouse)

Tài liệu này tổng hợp toàn bộ thông tin kiến trúc backend, sơ đồ cơ sở dữ liệu và các thành phần mã nguồn liên quan đến **Chức năng Quản lý Kho (Warehouse)** trong hệ thống.

---

## 1. Cơ sở dữ liệu (Database Schema)

Chức năng Quản lý Kho chủ yếu tương tác với bảng `warehouses` và liên kết với bảng `inventory`.

### Bảng `warehouses`

| Thuộc tính (Column) | Kiểu dữ liệu (Data Type) | Ràng buộc (Constraints) | Mô tả |
| :--- | :--- | :--- | :--- |
| `custom_id` | `TEXT` | `PRIMARY KEY` | Mã định danh tùy chỉnh của kho (Ví dụ: `KHO_A`, `KHO_B`) |
| `name` | `TEXT` | `NOT NULL` | Tên kho hàng |
| `location` | `TEXT` | | Vị trí / Địa chỉ kho |
| `capacity` | `INTEGER` | `NOT NULL` | Sức chứa tối đa của kho (tính theo tổng số lượng đơn vị sản phẩm) |
| `current_usage` | `INTEGER` | `NOT NULL DEFAULT 0` | Mức sử dụng hiện tại (tổng số lượng hàng hóa thực tế đang lưu trong kho) |
| `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | Thời gian tạo kho |

---

## 2. Nơi học & Các File liên quan (Source Files)

Để hiểu chi tiết backend chức năng Kho, bạn cần học các file sau:

1. **[schema.sql](file:///home/nitro/Project/ql_kho_new/backend/schema.sql#L21-L28)**: Chứa định nghĩa cấu trúc bảng `warehouses`.
2. **[models/warehouse.js](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js)**: Chứa toàn bộ các hàm xử lý logic thao tác với database (CRUD, tính toán dung lượng kho).
3. **[routes/warehouse.js](file:///home/nitro/Project/ql_kho_new/backend/routes/warehouse.js)**: Định nghĩa các Restful API Endpoints tiếp nhận request từ Client và gọi sang model tương ứng.

---

## 3. Các hàm Backend chi tiết (Backend Functions)

### A. Tốc độ & Thao tác dữ liệu (`models/warehouse.js`)

* **[`createWarehouse(name, location, capacity, custom_id)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L17-L54)**
  * **Mô tả**: Tạo kho bãi mới. Kiểm tra `custom_id` bắt buộc & duy nhất, kiểm tra `capacity` phải là số nguyên > 0.
* **[`getWarehouses()`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L58-L69)**
  * **Mô tả**: Lấy danh sách tất cả các kho bãi trong hệ thống.
* **[`getWarehouseById(custom_id)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L74-L85)**
  * **Mô tả**: Truy vấn thông tin chi tiết của 1 kho dựa trên `custom_id`.
* **[`updateWarehouse(custom_id, updates)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L90-L125)**
  * **Mô tả**: Cập nhật linh hoạt thông tin kho (`name`, `location`, `capacity`).
* **[`getWarehouseProducts(warehouseCustomId)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L130-L147)**
  * **Mô tả**: Lấy danh sách sản phẩm và số lượng tồn kho tương ứng trong một kho nhất định.
* **[`deleteWarehouse(custom_id)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L152-L175)**
  * **Mô tả**: Xóa kho bãi. *Lưu ý*: Chỉ cho phép xóa khi kho đang trống (`inventoryCount === 0`).
* **[`updateCurrentUsage(warehouseCustomId)`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L181-L203)**
  * **Mô tả**: Tính lại tổng số lượng tồn kho (`SUM(quantity)`) và cập nhật cột `current_usage` trong bảng `warehouses`.
* **[`getWarehousesCount()`](file:///home/nitro/Project/ql_kho_new/backend/models/warehouse.js#L207-L218)**
  * **Mô tả**: Đếm tổng số lượng kho bãi đang có.

---

### B. API Endpoints (`routes/warehouse.js`)

| Phương thức | Đường dẫn API | Hàm Model sử dụng | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `GET` | `/warehouses` | `getWarehouses()` | Lấy danh sách tất cả kho bãi |
| `GET` | `/warehouses/count` | `getWarehousesCount()` | Lấy tổng số lượng kho |
| `GET` | `/warehouses/:custom_id` | `getWarehouseById()` | Lấy thông tin chi tiết kho theo ID |
| `GET` | `/warehouses/:custom_id/products` | `getWarehouseProducts()` | Lấy danh sách sản phẩm nằm trong kho |
| `POST` | `/warehouses` | `createWarehouse()` | Tạo kho mới |
| `PUT` | `/warehouses/:custom_id` | `updateWarehouse()` | Cập nhật thông tin kho |
| `DELETE` | `/warehouses/:custom_id` | `deleteWarehouse()` | Xóa kho |
