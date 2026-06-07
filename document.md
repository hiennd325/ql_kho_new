3.1 Chức năng đăng ký

3.1.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để đăng nhập thành công

1, Tất cả các trường đều bắt buộc nhập (không để trống)

2, Mật khẩu: phải có độ dài hơn 8 ký tự, có ký tự số và chữ.

3, Xác nhận mật khẩu: phải nhập trùng khớp với trường mật khẩu

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Đầu vào** | **Vùng hợp lệ** | **Kí hiệu** | **Vùng không hợp lệ** | **Kí hiệu** |
| Tên đăng nhập | Không rỗng | A1 | Rỗng | U1 |
| Mật khẩu | Độ dài lớn hơn 8 ký tự | A2 | Độ dài nhỏ hơn 8 ký tự | U2 |
| Có chứa chữ và số | A3 | Không chứa chữ và số | U3 |
| Chứa chữ không có số | U4 |
| Chứa số không chứa chữ | U5 |
| Không rỗng | A4 | Rỗng | U6 |
| Xác nhận mật khẩu | Trùng khớp với mật khâu | A5 | Không trùng khớp với mật khẩu | U7 |
| Không rỗng | A6 | Rỗng | U8 |

- Bảng thiết kế testcase phân vùng tương đương

|  |  |  |  |
| --- | --- | --- | --- |
| **Test Case ID** | **Ghi chú** | **Đầu vào (Input) ( a= tên đăng nhập, b= mật khẩu, c= khớp DB)** | **Đầu ra (Output)** |
| **TC1** | A1, A2, A3, A4, A5, A6 | a= User123; b= admin12345; c= Admin12345 | Đăng nhập thành công |
| **TC2** | **U1**, A2, A3, A4, A5, A6 | a= ; b= Admin12345; c= Admin12345 | Tên đăng nhập không được để trống |
| **TC3** | A1, **U2**, A3, A4, A5, A6 | a= User123; b= Ad123; c= Ad123 | Độ dài mật khẩu phải lớn hơn 8 ký tự |
| **TC4** | A1, A2, U3, A4, A5, A6 | a= User123; b=adminhung; c= adminhung | Mật khẩu phải chứa cả chữ và số |
| **TC5** | A1, A2, U4, A4, A5, A6 | a= User123@; b= Password; c= Password | Mật khẩu phải chứa cả chữ và số |
| **TC6** | A1,A2, U5, A4, A5, A6 | a=User123 ; b=123456789; c= 123456789 | Mật khẩu phải chứa cả chữ và số |
| **TC7** | A1, A2, A3, U7, U8, U9 | a= User123; b= ; c= | Mật khẩu không được để trống |
| **TC8** | A1, A2, A3, A4, **U8**, A6 | a= User123; b= Admin12345; c= Pass12345 | Mật khẩu xác nhận không trùng khớp |
| **TC9** | A1, A2, A3, A4, **U8**, U9 | a= User123; b= Admin12345; c= | Xác nhận mật khẩu không được để trống |

1. Phương phápbảng quyết định

T: Có thỏa mãn điều kiện

F: Không thỏa mãn điều kiện

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| **Điều kiện đầu vào** | Mật khẩu hợp lệ (T/F) | T | T | F | F |
| Xác nhận mật khẩu trùng khớp (T/F ) | T | F | T | F |
| **Hành động đầu ra** | Đăng ký thành công | X |  |  |  |
| Đăng nhập thất bại |  | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định

|  |  |  |
| --- | --- | --- |
| **TC** | **Đầu vào** | **Đầu ra mong đợi** |
| **TC10** | Mật khẩu = Admin12345 Xác nhận Mật khẩu= admin12345 | Đăng ký thành công |
| **TC11** | Mật khẩu = Admin12345 Xác nhận Mật khẩu= admin143 | Lỗi: Xác nhận mật khẩu không trùng khớp |
| **TC12** | Mật khẩu = Pass Xác nhận Mật khẩu= Pass | Lỗi: Mật khẩu không hợp lệ |
| **TC13** | Mật khẩu = Pass Xác nhận Mật khẩu= word | Lỗi: Mật khẩu không hợp lệ và không trùng khớp |

**=> Kết hợp hai phương pháp trên ta thấy :** Kết hợp hai phương pháp trên ta thấy: Để đăng ký thành công thì phải thỏa mãn cả 2 trường hợp hợp lệ nhất là TC1 và TC10. Ta gộp 2 TC này thành 1. Như vậy tổng cộng ta cần kiểm thử 12 trường hợp cho tính năng đăng ký theo các điều kiện hiện tại.

3.2 Chức năng đăng nhập

3.2.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để đăng nhập thành công

1, Tất cả các trường đều bắt buộc nhập (không để trống)

2, Mật khẩu: phải có độ dài hơn 8 ký tự, có ký tự số và chữ.

3, Tên đăng nhập và mật khẩu phải tương ứng với cùng một tài khoản trong bảng TAI\_KHOAN.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Đầu vào** | **Vùng hợp lệ** | **Kí hiệu** | **Vùng không hợp lệ** | **Kí hiệu** |
| Tên đăng nhập | Không rỗng | A1 | Rỗng | U1 |
| Mật khẩu | Độ dài lớn hơn 8 ký tự | A2 | Độ dài nhỏ hơn 8 ký tự | U2 |
| Có chứa chữ và số | A3 | Không chứa chữ và số | U3 |
| Chứa chữ không có số | U4 |
| Chứa số không chứa chữ | U5 |
| Không rỗng | A4 | Rỗng | U6 |
| Tài khoản | Khớp với username và password tồn tại và khớp với bảng TAI\_KHOAN | A5 | Username và password không tồn tại | U7 |

- Bảng thiết kế testcase phân vùng tương đương

|  |  |  |  |
| --- | --- | --- | --- |
| **Test Case ID** | **Ghi chú** | **Đầu vào (Input) ( a= tên đăng nhập, b= mật khẩu, c= khớp DB)** | **Đầu ra (Output)** |
| **TC1** | A1, A2, A3, A4, A5 | a= AdminHung ; b= admin12345; c= Khớp với DB | Đăng nhập thành công |
| **TC2** | **U1**, A2, A3, A4, A5 | a= ; b= admin12345; c= Khớp với DB | Tên đăng nhập không được để trống |
| **TC3** | **A1, U2**, A3, A4, A5 | a=AdminHung ; b= 12345; c= Khớp với DB | Độ dài mật khẩu phải lớn hơn 8 ký tự |
| **TC4** | A1, A2, U3, A4, A5 | a= AdminHung; b=!@#$%^&\*(); c= Khớp với DB | Mật khẩu phải chứa cả chữ và số |
| **TC5** | A1, A2, **U4**, A4, A5 | a= AdminHung ; b= Password; c= Khớp với DB | Mật khẩu phải chứa cả chữ và số |
| **TC6** | A1, A2, **U5**, A4, A5 | a=AdminHung; b=123456789; c= Khớp với DB | Mật khẩu phải chứa cả chữ và số |
| **TC7** | A1, A2, A3, **U6**, A5 | a= AdminHung; b= ; c= Khớp với DB | Mật khẩu không được để trống |
| **TC8** | A1, A2, A3, A4, U7 | a= AdminHung; b= Pass12345; c= Khớp với DB | Tài khoản hoặc mật khẩu không chính xác |

1. Phương phápbảng quyết định

T: Có tồn tại trong bảng TAI\_KHOAN

F: Không tồn tại trong bảng TAI\_KHOAN

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| **Điều kiện đầu vào** | Tên đăng nhập (T/F) | T | T | F | F |
| Mật khẩu (T/F ) | T | F | T | F |
| **Hành động đầu ra** | Đăng nhập thành công | X |  |  |  |
| Đăng nhập thất bại |  | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định

|  |  |  |
| --- | --- | --- |
| **TC** | **Đầu vào** | **Đầu ra mong đợi** |
| **TC8** | Tên đăng nhập = AdminHung Mật khẩu= admin12345 | Đăng nhập thành công |
| **TC9** | Tên đăng nhập = AdminHung Mật khẩu = admin143 | Đăng nhập không thành công |
| **TC10** | Tên đăng nhập = Thanh@13 Mật khẩu = admin12345 | Tên đăng nhập không đúng |
| **TC11** | Tên đăng nhập = HienUser Mật khẩu = 124356 | Thông tin đăng nhập sai |

**=> Kết hợp hai phương pháp trên ta thấy :** Để đăng nhập thành công thì phải thỏa mãn cả 2 trường hợp hợp lệ nhất là TC1 và TC9. Ta gộp 2 TC này thành 1. Như vậy tổng cộng ta cần kiểm thử 11 trường hợp cho tính năng đăng nhập theo các điều kiện hiện tại.

3.3 Chức năng đăng xuất

3.3.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để đăng nhập thành công

1, Người dùng đang ở trạng thái đăng nhập(Phiên làm việc - Session/Token còn hiệu lực).

2, Người dùng thực hiện thao tác click vào nút “Đăng xuất”.

3, Hệ thống phải xóa bỏ hoàn toàn phiên làm việc hiện tại (Xóa token, Cookies, Session cache).

4, Hệ thống chuyển hướng người dùng về lại trang Đăng nhập.

5, Sau khi đăng xuất, người dùng không thể sử dụng nút “Back” trên trình duyệt để truy cập lại các trang nội bộ có yêu cầu quyền đăng nhập

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Đầu vào** | **Vùng hợp lệ** | **Kí hiệu** | **Vùng không hợp lệ** | **Kí hiệu** |
| Trạng thái Session | Còn hiệu lực (Active) | A1 | Đã hết hạn / Bị xóa | U1 |
| Hành động click | Click nút “Đăng xuất” | A2 | Không thao tác | U2 |
| Bảo mật | Truy cập trang Đăng nhập | A3 | Dùng nút “Back” trên trình duyệt | U3 |
| Dán trực tiếp URL trang nội bộ | U4 |

- Bảng thiết kế testcase phân vùng tương đương

|  |  |  |  |
| --- | --- | --- | --- |
| **Test Case ID** | **Ghi chú** | **Đầu vào (Input) ( a= trạng thái session, b= thao tác, c= thao tác hậu đăng xuất)** | **Đầu ra (Output)** |
| **TC1** | A1, A2 | a= Session hợp lệ ; b= Click “Đăng xuất”; c= Không | - Hệ thống xóa Session/Token  - Chuyển hướng về trang Đăng nhập |
| **TC2** | **U1**, A2 | a= Session đã hết hạn; b= Click “Đăng xuất” (Ví dụ treo máy lâu rồi mới bấm); c= Không | - Thông báo phiên hết hạn ( nếu có)  - Chuyển hướng về trang Đăng nhập |
| **TC3** | A1, A2, U3 | a= Đã đăng xuất; b= Click “Đăng xuất” hoàn tất; c= Nhấn nút “Back” trên trình duyệt | - Không hiển thị dữ liệu nội bộ đã cache  - Yêu cầu đăng nhập lại / Giữ ở trang Login |
| **TC4** | A1, A2, U4 | a= Đã đăng xuất; b=Click “Đăng xuất” hoàn tất; c= Dán URL trang chủ nội bộ vào thanh địa chỉ | - Chặn truy cập  - Chuyển hướng về trang Đăng nhập |

1. Phương phápbảng quyết định

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| **Điều kiện đầu vào** | Phiên làm việc đang hợp lệ (T/F) | T | T | F | F |
| Người dùng click nút “Đăng xuất” (T/F ) | T | F | T | F |
| **Hành động đầu ra** | Đăng xuất thành công | X |  |  |  |
| Chuyển hướng về trang đăng nhập | X |  | X | X |
| Giữ nguyên ở trang hiệp tại (Đang đăng nhập) |  | X |  |  |

- Bảng thiết kế Testcase theo bảng quyết định

|  |  |  |
| --- | --- | --- |
| **TC** | **Đầu vào** | **Đầu ra mong đợi** |
| **TC5** | - Hệ thống đang đăng nhập bình thường  - Người dùng click nút “Đăng xuất” | Đăng xuất thành công, phiên bị hủy, trở về trang Đăng nhập |
| **TC6** | - Hệ thống đang đăng nhập bình thường  - Người dùng không click “Đăng xuất” | Người dùng vẫn tiếp tục thao tác bình thường trong hệ thống |
| **TC7** | - Mở hệ thống trên 2 Tab trình duyệt (A và B)  - Tại tab A: Đã bấm đăng xuất  - Tại tab B: Tiếp tục bấm nút Đăng xuất | Hệ thống nhận diện không còn phiên hợp lệ, tự động đẩy về trang Đăng nhập không còn báo lỗi crash |

**=> Kết hợp hai phương pháp trên ta thấy :** Chức năng đăng xuất không có nhiều ràng buộc về dữ liệu nhập nhưng đặc biệt quan trọng về mặt bảo mật trạng thái. Gộp các trường hợp trùng lặp giữa hai bảng (TC1 và TC5 trùng nhau), ta có tổng cộng 6 Testcase cốt lõi cần thực thi để đảm bảo chức năng Đăng xuất hoạt động chính xác và an toàn.

3.4 Chức năng quản lý sản phẩm (Thêm sản phẩm)

3.4.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Các trường bắt buộc nhập: Tên sản phẩm, Giá sản phẩm, Nhà cung cấp.
2, Tên sản phẩm: Không được để trống, độ dài từ 1 - 255 ký tự.
3, Giá sản phẩm: Phải là số và lớn hơn hoặc bằng 0.
4, Mã sản phẩm tùy chỉnh (customId): Nếu nhập thì phải là duy nhất (không được trùng lặp trong hệ thống).
5, Nhà cung cấp (supplierId): Phải được chọn từ danh sách nhà cung cấp đã tồn tại.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Tên sản phẩm | Không rỗng, độ dài hợp lệ | A1 | Rỗng | U1 |
| Giá sản phẩm | Số lớn hơn hoặc bằng 0 | A2 | Nhỏ hơn 0 | U2 |
| | | | Không phải là số / Rỗng | U3 |
| Mã sản phẩm (customId) | Chưa tồn tại trong hệ thống | A3 | Đã tồn tại trong hệ thống | U4 |
| Nhà cung cấp (supplierId)| Đã chọn từ danh sách tồn tại | A4 | Chưa chọn / Trống | U5 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=tên sản phẩm, b=giá, c=mã sản phẩm, d=nhà cung cấp) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2, A3, A4 | a= "Sữa tươi TH True Milk"; b= 15000; c= "SP_TH_001"; d= "NCC001" | Thêm sản phẩm thành công |
| **TC2** | **U1**, A2, A3, A4 | a= ""; b= 15000; c= "SP_TH_002"; d= "NCC001" | Lỗi: Tên sản phẩm không được để trống |
| **TC3** | A1, **U2**, A3, A4 | a= "Sữa tươi TH True Milk"; b= -5000; c= "SP_TH_003"; d= "NCC001" | Lỗi: Giá sản phẩm phải lớn hơn hoặc bằng 0 |
| **TC4** | A1, **U3**, A3, A4 | a= "Sữa tươi TH True Milk"; b= "abc"; c= "SP_TH_004"; d= "NCC001" | Lỗi: Giá sản phẩm phải là số hợp lệ |
| **TC5** | A1, A2, **U4**, A4 | a= "Sữa tươi TH True Milk"; b= 15000; c= "SP_TH_001"; d= "NCC001" | Lỗi: Mã sản phẩm đã tồn tại |
| **TC6** | A1, A2, A3, **U5** | a= "Sữa tươi TH True Milk"; b= 15000; c= "SP_TH_005"; d= "" | Lỗi: Nhà cung cấp là bắt buộc |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| --- | --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Tên sản phẩm hợp lệ (T/F) | T | T | T | F |
| | Giá sản phẩm hợp lệ (T/F) | T | T | F | T |
| | Mã sản phẩm không trùng (T/F) | T | F | T | T |
| **Hành động đầu ra** | Thêm sản phẩm thành công | X | | | |
| | Báo lỗi hệ thống | | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC7** | Tên="Bánh mì", Giá=10000, Mã="SP001" (Chưa tồn tại) | Thêm sản phẩm thành công |
| **TC8** | Tên="Bánh mì", Giá=10000, Mã="SP001" (Đã tồn tại) | Lỗi: Mã sản phẩm đã tồn tại |
| **TC9** | Tên="Bánh mì", Giá=-2000, Mã="SP002" | Lỗi: Giá sản phẩm không hợp lệ |
| **TC10** | Tên="", Giá=10000, Mã="SP003" | Lỗi: Tên sản phẩm không được để trống |

**=> Kết hợp hai phương pháp trên ta thấy:** Để thêm sản phẩm thành công thì các thông tin đầu vào phải hoàn toàn hợp lệ và không trùng lặp mã sản phẩm (TC1 và TC7 tương đương). Tổng cộng có 9 trường hợp kiểm thử cốt lõi cho chức năng thêm sản phẩm.

3.5 Chức năng quản lý kho hàng (Thêm kho mới)

3.5.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Các trường bắt buộc nhập: Mã kho, Tên kho, Sức chứa.
2, Mã kho (custom_id): Không được để trống, phải duy nhất trong hệ thống.
3, Tên kho (name): Không được để trống.
4, Sức chứa (capacity): Phải là số nguyên dương lớn hơn 0.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Mã kho (custom_id) | Chưa tồn tại trong hệ thống | A1 | Đã tồn tại trong hệ thống | U1 |
| | Không rỗng | A2 | Rỗng | U2 |
| Tên kho (name) | Không rỗng | A3 | Rỗng | U3 |
| Sức chứa (capacity)| Số nguyên lớn hơn 0 | A4 | Số nhỏ hơn hoặc bằng 0 | U4 |
| | | | Không phải là số / Rỗng | U5 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=mã kho, b=tên kho, c=sức chứa) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2, A3, A4 | a= "KHO_HN_01"; b= "Kho Hà Nội 1"; c= 10000 | Thêm kho hàng thành công |
| **TC2** | **U1**, A2, A3, A4 | a= "KHO_HN_01"; b= "Kho Hà Nội Mới"; c= 5000 | Lỗi: Mã kho đã tồn tại |
| **TC3** | **U2**, A3, A4 | a= ""; b= "Kho Hải Phòng"; c= 3000 | Lỗi: Mã kho là bắt buộc |
| **TC4** | A1, A2, **U3**, A4 | a= "KHO_HP_01"; b= ""; c= 3000 | Lỗi: Tên kho không được để trống |
| **TC5** | A1, A2, A3, **U4** | a= "KHO_HP_01"; b= "Kho Hải Phòng"; c= -50 | Lỗi: Sức chứa phải lớn hơn 0 |
| **TC6** | A1, A2, A3, **U5** | a= "KHO_HP_01"; b= "Kho Hải Phòng"; c= "abc" | Lỗi: Sức chứa phải là số hợp lệ |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| --- | --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Mã kho hợp lệ và không trùng (T/F)| T | T | T | F |
| | Tên kho không rỗng (T/F) | T | T | F | T |
| | Sức chứa > 0 (T/F) | T | F | T | T |
| **Hành động đầu ra** | Thêm kho thành công | X | | | |
| | Báo lỗi hệ thống | | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC7** | Mã="KHO_DN", Tên="Kho Đà Nẵng", Sức chứa=5000 | Thêm kho thành công |
| **TC8** | Mã="KHO_DN", Tên="Kho Đà Nẵng", Sức chứa=-100 | Lỗi: Sức chứa không hợp lệ |
| **TC9** | Mã="KHO_DN", Tên="", Sức chứa=5000 | Lỗi: Tên kho không được để trống |
| **TC10**| Mã="KHO_HN_01" (Đã có), Tên="Kho HN 1", Sức chứa=1000 | Lỗi: Mã kho đã tồn tại |

**=> Kết hợp hai phương pháp trên ta thấy:** Bằng việc gộp các trường hợp trùng lặp (TC1 và TC7), ta có tổng cộng 9 Testcase đặc trưng cần thực hiện để kiểm thử chức năng thêm kho bãi mới.

3.6 Chức năng quản lý nhập/xuất kho (Nhập kho hàng loạt)

3.6.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Các trường bắt buộc: Mã kho, Nhà cung cấp, Danh sách sản phẩm nhập.
2, Kho hàng và Nhà cung cấp phải tồn tại hợp lệ trong hệ thống.
3, Danh sách sản phẩm nhập không được rỗng; mỗi sản phẩm phải có mã sản phẩm hợp lệ và số lượng nhập lớn hơn 0.
4, Tổng số lượng nhập của các sản phẩm không được làm vượt quá sức chứa còn lại của kho hàng: `current_usage + totalNewQuantity <= capacity`.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Kho hàng (warehouse_id) | Tồn tại trong hệ thống | A1 | Không tồn tại / Rỗng | U1 |
| Nhà cung cấp (supplier_id)| Tồn tại trong hệ thống | A2 | Không tồn tại / Rỗng | U2 |
| Danh sách sản phẩm | Không rỗng, mã SP hợp lệ | A3 | Rỗng / Có mã SP không tồn tại| U3 |
| Số lượng sản phẩm nhập | Số nguyên dương > 0 | A4 | Số lượng <= 0 hoặc không là số| U4 |
| Sức chứa kho hàng | Đủ sức chứa | A5 | Tổng số lượng nhập vượt quá sức chứa | U5 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=kho, b=nhà cung cấp, c=danh sách sản phẩm, d=sức chứa) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2, A3, A4, A5 | a="KHO_HN_01"; b="NCC001"; c=[{sp="SP001", sl=100}]; d=Đủ sức chứa | Nhập kho thành công |
| **TC2** | **U1**, A2, A3, A4, A5 | a="KHO_KHONG_TON_TAI"; b="NCC001"; c=[{sp="SP001", sl=100}]; d=Đủ | Lỗi: Kho hàng không tồn tại |
| **TC3** | A1, **U2**, A3, A4, A5 | a="KHO_HN_01"; b="NCC_KHONG_TON_TAI"; c=[{sp="SP001", sl=100}]; d=Đủ | Lỗi: Nhà cung cấp không tồn tại |
| **TC4** | A1, A2, **U3**, A4, A5 | a="KHO_HN_01"; b="NCC001"; c=[{sp="SP_FAKE", sl=100}]; d=Đủ | Lỗi: Sản phẩm không tồn tại |
| **TC5** | A1, A2, A3, **U4**, A5 | a="KHO_HN_01"; b="NCC001"; c=[{sp="SP001", sl=-50}]; d=Đủ | Lỗi: Số lượng nhập phải lớn hơn 0 |
| **TC6** | A1, A2, A3, A4, **U5** | a="KHO_HN_01" (chỉ còn trống 50); b="NCC001"; c=[{sp="SP001", sl=100}]; d=Không đủ | Lỗi: Vượt quá sức chứa của kho hàng |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| --- | --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Thông tin kho & NCC hợp lệ (T/F) | T | T | T | F |
| | Danh sách sản phẩm & số lượng > 0 (T/F) | T | T | F | T |
| | Kho hàng còn đủ sức chứa (T/F) | T | F | T | T |
| **Hành động đầu ra** | Nhập kho thành công | X | | | |
| | Hủy giao dịch, báo lỗi | | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC7** | Kho="KHO_HN_01", NCC="NCC001", SP=[{"SP001", 10}], Kho còn trống 1000 | Nhập kho thành công |
| **TC8** | Kho="KHO_HN_01", NCC="NCC001", SP=[{"SP001", 1200}], Kho còn trống 1000 | Lỗi: Vượt quá sức chứa của kho |
| **TC9** | Kho="KHO_HN_01", NCC="NCC001", SP=[{"SP001", -10}], Kho còn trống 1000 | Lỗi: Số lượng nhập không hợp lệ |
| **TC10**| Kho="KHO_FAKE", NCC="NCC001", SP=[{"SP001", 10}] | Lỗi: Kho hàng không tồn tại |

**=> Kết hợp hai phương pháp trên ta thấy:** Quy trình nhập kho yêu cầu xác thực đồng thời cả kho hàng, nhà cung cấp, thông tin sản phẩm và tính toán sức chứa thực tế. Tổng cộng cần 9 Testcase độc lập để kiểm thử toàn diện chức năng nhập kho.

3.7 Chức năng quản lý nhà cung cấp (Thêm nhà cung cấp)

3.7.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Các trường bắt buộc nhập: Mã nhà cung cấp, Tên nhà cung cấp.
2, Mã nhà cung cấp (code): Phải duy nhất trong hệ thống, không được để trống.
3, Số điện thoại (phone): Nếu nhập thì phải đúng định dạng 10 chữ số.
4, Email (email): Nếu nhập thì phải đúng định dạng example@company.com.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Mã nhà cung cấp (code) | Chưa tồn tại trong hệ thống | A1 | Đã tồn tại trong hệ thống | U1 |
| | Không rỗng | A2 | Rỗng | U2 |
| Tên nhà cung cấp (name) | Không rỗng | A3 | Rỗng | U3 |
| Số điện thoại (phone) | Đúng 10 chữ số | A4 | Khác 10 chữ số / chứa chữ | U4 |
| Email (email) | Định dạng example@company.com | A5 | Sai định dạng email | U5 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=mã NCC, b=tên NCC, c=SĐT, d=email) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2, A3, A4, A5 | a="NCC001"; b="Công ty TH True Milk"; c="0987654321"; d="info@thmilk.com" | Thêm nhà cung cấp thành công |
| **TC2** | **U1**, A2, A3, A4, A5 | a="NCC001" (Đã có); b="Công ty sữa TH"; c="0987654321"; d="info@thmilk.com" | Lỗi: Mã nhà cung cấp đã tồn tại |
| **TC3** | **U2**, A3 | a=""; b="Công ty sữa TH" | Lỗi: Mã nhà cung cấp là bắt buộc |
| **TC4** | A1, A2, **U3** | a="NCC002"; b="" | Lỗi: Tên nhà cung cấp không được để trống |
| **TC5** | A1, A2, A3, **U4**, A5 | a="NCC002"; b="Công ty sữa TH"; c="12345"; d="info@thmilk.com" | Lỗi: Số điện thoại phải là 10 chữ số |
| **TC6** | A1, A2, A3, A4, **U5** | a="NCC002"; b="Công ty sữa TH"; c="0987654321"; d="info@thmilk" | Lỗi: Email phải có định dạng example@company.com |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| --- | --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Số điện thoại hợp lệ (nếu nhập) (T/F) | T | F | T | T |
| | Email đúng định dạng (nếu nhập) (T/F) | T | T | F | T |
| | Mã nhà cung cấp không trùng (T/F) | T | T | T | F |
| **Hành động đầu ra** | Thêm nhà cung cấp thành công | X | | | |
| | Báo lỗi dữ liệu | | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC7** | Mã="NCC003", SĐT="0123456789", Email="contact@ncc.com" | Thêm nhà cung cấp thành công |
| **TC8** | Mã="NCC003", SĐT="01234", Email="contact@ncc.com" | Lỗi: Số điện thoại không hợp lệ |
| **TC9** | Mã="NCC003", SĐT="0123456789", Email="contact@ncc" | Lỗi: Email không hợp lệ |
| **TC10**| Mã="NCC001" (Đã có), SĐT="0123456789", Email="contact@ncc.com" | Lỗi: Mã nhà cung cấp đã tồn tại |

**=> Kết hợp hai phương pháp trên ta thấy:** Gộp trường hợp TC1 và TC7, hệ thống cần tối thiểu 9 Testcase cơ bản để kiểm tra các ràng buộc định dạng và sự duy nhất của mã nhà cung cấp.

3.8 Chức năng chuyển kho (Tạo phiếu chuyển kho)

3.8.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Người dùng đã đăng nhập (Token JWT hợp lệ).
2, Các trường bắt buộc: Kho nguồn, Kho đích, Danh sách sản phẩm cần chuyển.
3, Kho nguồn và kho đích phải tồn tại và khác nhau (`from_warehouse_id != to_warehouse_id`).
4, Số lượng sản phẩm chuyển ở mỗi dòng phải là số nguyên dương (> 0) và nhỏ hơn hoặc bằng số lượng tồn kho thực tế của sản phẩm đó tại kho nguồn.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Kho hàng nguồn/đích | Kho nguồn khác kho đích | A1 | Kho nguồn trùng kho đích | U1 |
| | Kho hàng tồn tại | A2 | Kho hàng không tồn tại | U2 |
| Danh sách sản phẩm | Không rỗng, sản phẩm tồn tại | A3 | Rỗng / Sản phẩm không tồn tại | U3 |
| Số lượng chuyển | Số nguyên dương > 0 | A4 | Số lượng <= 0 hoặc không là số | U4 |
| | Nhỏ hơn hoặc bằng tồn kho nguồn | A5 | Vượt quá tồn kho tại kho nguồn | U5 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=kho nguồn, b=kho đích, c=sản phẩm, d=tồn kho nguồn) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2, A3, A4, A5 | a="KHO_HN_01"; b="KHO_SG_01"; c=[{sp="SP001", sl=50}]; d=Tồn kho nguồn: 100 | Tạo phiếu chuyển kho thành công |
| **TC2** | **U1**, A2, A3, A4, A5 | a="KHO_HN_01"; b="KHO_HN_01"; c=[{sp="SP001", sl=50}]; d=100 | Lỗi: Kho nguồn và kho đích không được trùng nhau |
| **TC3** | A1, **U2**, A3, A4 | a="KHO_KHONG_TON_TAI"; b="KHO_SG_01"; c=[{sp="SP001", sl=50}] | Lỗi: Kho hàng không tồn tại |
| **TC4** | A1, A2, **U3**, A4 | a="KHO_HN_01"; b="KHO_SG_01"; c=[] | Lỗi: Danh sách sản phẩm không được để trống |
| **TC5** | A1, A2, A3, **U4** | a="KHO_HN_01"; b="KHO_SG_01"; c=[{sp="SP001", sl=-10}] | Lỗi: Số lượng chuyển phải lớn hơn 0 |
| **TC6** | A1, A2, A3, A4, **U5** | a="KHO_HN_01"; b="KHO_SG_01"; c=[{sp="SP001", sl=150}]; d=100 | Lỗi: Số lượng chuyển vượt quá số lượng tồn kho nguồn |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** | **Luật 4** |
| --- | --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Kho nguồn khác kho đích (T/F) | T | F | T | T |
| | Danh sách sản phẩm & số lượng hợp lệ (T/F) | T | T | F | T |
| | Tồn kho kho nguồn đủ đáp ứng (T/F) | T | T | T | F |
| **Hành động đầu ra** | Tạo phiếu chuyển kho thành công | X | | | |
| | Báo lỗi giao dịch | | X | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC7** | Nguồn="KHO_HN_01", Đích="KHO_SG_01", SP=[{"SP001", 30}], Tồn nguồn=50 | Tạo phiếu chuyển kho thành công |
| **TC8** | Nguồn="KHO_HN_01", Đích="KHO_HN_01", SP=[{"SP001", 30}], Tồn nguồn=50 | Lỗi: Kho nguồn và kho đích giống nhau |
| **TC9** | Nguồn="KHO_HN_01", Đích="KHO_SG_01", SP=[{"SP001", -10}], Tồn nguồn=50 | Lỗi: Số lượng không hợp lệ |
| **TC10**| Nguồn="KHO_HN_01", Đích="KHO_SG_01", SP=[{"SP001", 80}], Tồn nguồn=50 | Lỗi: Tồn kho nguồn không đủ |

**=> Kết hợp hai phương pháp trên ta thấy:** Phiếu chuyển kho đòi hỏi kiểm soát chặt chẽ mối liên hệ giữa kho đi, kho đến và tồn kho khả dụng của sản phẩm tại thời điểm giao dịch. Gộp TC1 và TC7, chúng ta cần 9 Testcase cốt lõi để bảo đảm an toàn dữ liệu khi thực hiện chuyển kho.

3.9 Chức năng xem chi tiết sản phẩm

3.9.1 Phân tích thiết kế kiểm thử

a) Giao diện chức năng

![](data:image/png;base64...)

b) Mô tả điều kiện để thực hiện thành công

1, Người dùng đã đăng nhập vào hệ thống (Token JWT gửi kèm trong Header Authorization hợp lệ và còn hiệu lực).
2, Mã sản phẩm (id) được truyền trực tiếp trên URL path `/products/:id` phải tồn tại trong bảng products.

c) Phương pháp tìm testcase: Dùng phương pháp phân vùng tương đương và bảng quyết định

1. Phân vùng tương đương

- Bảng phân vùng tương đương:

| Đầu vào | Vùng hợp lệ | Kí hiệu | Vùng không hợp lệ | Kí hiệu |
| --- | --- | --- | --- | --- |
| Phiên đăng nhập (Token) | JWT hợp lệ & còn hạn | A1 | Không gửi token / token rỗng | U1 |
| | | | Token không hợp lệ / hết hạn | U2 |
| Mã sản phẩm (id) | Tồn tại trong DB | A2 | Không tồn tại trong DB | U3 |
| | | | Bị rỗng / Không đúng định dạng | U4 |

- Bảng thiết kế testcase phân vùng tương đương:

| Test Case ID | Ghi chú | Đầu vào (Input) (a=Token JWT, b=Mã sản phẩm trong URL) | Đầu ra (Output) |
| --- | --- | --- | --- |
| **TC1** | A1, A2 | a= Token hợp lệ; b= "SP_TH_001" | Hiển thị thông tin chi tiết sản phẩm và tổng lượng tồn kho |
| **TC2** | **U1**, A2 | a= ""; b= "SP_TH_001" | Lỗi HTTP 401 (Access token required) |
| **TC3** | **U2**, A2 | a= Token sai/hết hạn; b= "SP_TH_001" | Lỗi HTTP 403 (Invalid token) |
| **TC4** | A1, **U3** | a= Token hợp lệ; b= "SP_KHONG_TON_TAI" | Lỗi HTTP 404 (Product not found) |

2. Phương pháp bảng quyết định

T: Có thỏa mãn điều kiện
F: Không thỏa mãn điều kiện

| | | **Luật 1** | **Luật 2** | **Luật 3** |
| --- | --- | --- | --- | --- |
| **Điều kiện đầu vào** | Token đăng nhập hợp lệ (T/F) | T | T | F |
| | Mã sản phẩm tồn tại trong DB (T/F) | T | F | T |
| **Hành động đầu ra** | Hiển thị chi tiết sản phẩm | X | | |
| | Báo lỗi hệ thống (401/403/404) | | X | X |

- Bảng thiết kế Testcase theo bảng quyết định:

| TC | Đầu vào | Đầu ra mong đợi |
| --- | --- | --- |
| **TC5** | Token = Hợp lệ, Mã sản phẩm = "SP_TH_001" (Đã có trong DB) | Trả về thông tin sản phẩm: tên, giá, mô tả, tồn kho... |
| **TC6** | Token = Hợp lệ, Mã sản phẩm = "SP_NONE_123" (Không có trong DB) | Trả về lỗi 404: Product not found |
| **TC7** | Token = Không gửi hoặc không hợp lệ, Mã sản phẩm = "SP_TH_001" | Trả về lỗi 401/403: Không có quyền truy cập |

**=> Kết hợp hai phương pháp trên ta thấy:** Gộp TC1 với TC5, TC2/TC3 với TC7, TC4 với TC6, ta có tổng cộng 4 Testcase đặc trưng quan trọng cần chạy thực tế đối với luồng xem chi tiết sản phẩm của API backend.
