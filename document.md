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

3.2 Chức năng đăng xuất

3.2.1 Phân tích thiết kế kiểm thử

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
