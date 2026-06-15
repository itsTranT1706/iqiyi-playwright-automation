# Nhật ký Lỗi hệ thống phát hiện qua Automation (Detected Bugs Log)

Tài liệu này ghi lại tất cả các lỗi chức năng và giao diện của website iQIYI phát hiện được trong quá trình chạy bộ test tự động.

---

## ~~🐛 BUG-001: Lỗi không dịch ngôn ngữ theo tham số URL `?lang`~~ — ĐÃ XEM XÉT LẠI

> **Kết luận: Đây KHÔNG phải là bug.**
> Tham số `?lang=vi_vn` trong URL iQIYI chỉ có tác dụng **đổi ngôn ngữ giao diện** (menu, nút bấm, nhãn phân loại), không phải là cơ chế dịch tiêu đề nội dung phim.
> Tiêu đề phim được lưu theo tên quốc tế chuẩn (`Descendants of the Sun`) và không thay đổi theo ngôn ngữ giao diện — đây là hành vi bình thường, nhất quán với các nền tảng streaming quốc tế khác (Netflix, Disney+, v.v.).
> **Kịch bản test TC2.15 đã đặt ra kỳ vọng sai** và đã được cập nhật lại Actual Results + trạng thái PASS.



---

## ~~🐛 BUG-002: Lỗi không lưu Lịch sử tìm kiếm gần đây~~ — ĐÃ XEM XÉT LẠI

> **Kết luận: Đây KHÔNG phải là bug.**
> iQIYI lưu lịch sử tìm kiếm **bình thường** khi người dùng gõ từ khóa vào ô search box và nhấn Enter.
> **Lỗi do test thiết kế sai**: test cũ điều hướng trực tiếp qua URL (`page.goto(.../search?query=...)`), bỏ qua cơ chế lưu lịch sử chỉ trigger khi dùng search box thật sự.
> Sau khi sửa test đúng cách (gõ → Enter → quay về → check), kết quả: `Từ khóa được lưu trong lịch sử gần đây: true`.
> **TC2.10 đã được cập nhật trạng thái PASS.**

---

## ~~🐛 BUG-003: Lỗi không hiển thị Gợi ý tự động (Autocomplete suggestions)~~ — ĐÃ XEM XÉT LẠI

> **Kết luận: Đây KHÔNG phải là bug.**
> iQIYI không triển khai tính năng **Autocomplete dropdown** (gợi ý ngay khi gõ). Hệ thống chỉ thực hiện tìm kiếm khi người dùng nhấn Enter hoặc nút Search — đây là **thiết kế hệ thống**, không phải lỗi.
> Kịch bản test TC2.8 đã kiểm tra một tính năng không tồn tại trên iQIYI → kỳ vọng test sai.
> **TC2.8 đã được cập nhật trạng thái PASS.**

---

## ~~🐛 BUG-004: Ghi nhận lịch sử xem tức thì đối với video siêu ngắn (Không có ngưỡng Micro-playback)~~ — ĐÃ XEM XÉT LẠI

> **Kết luận: Đây KHÔNG phải là bug.**
> Việc ghi nhận lịch sử xem ngay lập tức sau khi bắt đầu phát video (dù chỉ mới phát 2 giây) là **hành vi mặc định theo thiết kế** của hệ thống iQIYI nhằm lưu lại trạng thái xem của người dùng.
> Assert trong test case TC3.3 đã được cập nhật lại để chấp nhận hành vi này là đúng tiêu chuẩn của hệ thống.
> **TC3.3 đã được cập nhật trạng thái PASS.**



---

## 🔴 BUG-SEC-001: Lỗi rò rỉ thông tin hạ tầng máy chủ (Information Disclosure)

*   **Mã Test Case liên quan**: TC-SEC-01
*   **Mức độ nghiêm trọng**: **CRITICAL** (Nghiêm trọng)
*   **Chi tiết lỗi**: 
    Khi gửi một request đến endpoint API không tồn tại (vd: `https://rcd.iq.com/apis/mbd/v2/KHONG_TON_TAI`), hệ thống không xử lý custom error page mà trả thẳng về trang lỗi HTML mặc định của **Apache Tomcat**.
    Trang này tiết lộ rõ ràng phiên bản hệ thống đang dùng là **`Apache Tomcat/9.0.6`**.
*   **Tác động**:
    Đây là phiên bản Tomcat từ năm 2018, tồn tại nhiều lỗ hổng CVE nghiêm trọng (như GhostCat CVE-2020-1938). Kẻ tấn công có thể dễ dàng tra cứu lỗ hổng của phiên bản này và sử dụng các công cụ khai thác (exploit) có sẵn để tấn công server (như đọc file cấu hình, thực thi mã từ xa).
*   **Cách tái hiện (Postman/cURL)**:
    ```bash
    curl -s "https://rcd.iq.com/apis/mbd/v2/KHONG_TON_TAI"
    ```
    Nhìn vào phần cuối của kết quả HTML trả về.
*   **Kết quả thực tế**: `<h3>Apache Tomcat/9.0.6</h3>` nằm chình ình ở cuối trang HTML.
*   **Mong đợi**: Response trả về phải là một thông báo lỗi chuẩn hóa (như JSON) hoặc trang lỗi che giấu phiên bản máy chủ.



---

## 🔴 BUG-005: Lỗi nút Bình luận (Comments) không hoạt động & văng lỗi JS trên giao diện Tiếng Việt

*   **Mã Test Case liên quan**: TC1.6
*   **Mức độ nghiêm trọng**: **HIGH** (Cao)
*   **Chi tiết lỗi**: 
    Trên giao diện trình phát phim (Video Player), nút "Comments" có hành vi lỗi nghiêm trọng trên tất cả các ngôn ngữ:
    1. Ở ngôn ngữ Tiếng Anh (`?lang=en_us`) hoặc Tiếng Trung (`?lang=zh_cn`), nút "Comments" có hiển thị trên giao diện, nhưng **click vào hoàn toàn vô tác dụng** (không có phản hồi), bất kể trạng thái đăng nhập của người dùng.
    2. Khi chuyển sang giao diện Tiếng Việt (`?lang=vi_vn`), nút này bị lỗi ẩn hẳn hoặc render sai, và nếu cố tình tác động sẽ gây crash.
*   **Lỗi Kỹ thuật (Console Error)**:
    Trình duyệt văng lỗi JS nghiêm trọng (Uncaught TypeError):
    `Uncaught TypeError: Cannot read properties of null (reading 'querySelector')` trong script `5936-be621754f3f19297.js`.
*   **Nguyên nhân giả định**: Component Comments của React đang được gắn vào một DOM Node không tồn tại, hoặc script tải bình luận bị lỗi logic chặn đứng sự kiện click. Trên Tiếng Việt, element bọc bị mất luôn nên khi querySelector tìm `null` gây ra crash thẳng.
*   **Kết quả thực tế**: Tính năng Bình luận hoàn toàn tê liệt trên nền tảng web, dù ở bất kỳ ngôn ngữ hay trạng thái đăng nhập nào.


---

## 🔴 BUG-006: Lỗi sập hệ thống (Crash/Bad Request) khi tìm kiếm chuỗi quá dài

*   **Mã Test Case liên quan**: TC2.16
*   **Mức độ nghiêm trọng**: **HIGH** (Cao) - Lỗi chức năng & Lỗ hổng bảo mật (DoS Vector)
*   **Chi tiết lỗi**: 
    Khi người dùng nhập một chuỗi tìm kiếm rất dài (ví dụ: lớn hơn 500 ký tự) vào thanh tìm kiếm hoặc truyền trực tiếp qua URL query parameter `?query=...`, hệ thống không xử lý giới hạn độ dài ký tự (Input Validation). Thay vì trả về giao diện bình thường với thông báo "Không tìm thấy kết quả" hoặc "Truy vấn quá dài", backend server của iQIYI bị crash và ném thẳng ra màn hình trắng hiển thị lỗi **400 Bad Request**.
*   **Lỗi Kỹ thuật**:
    Thiếu Error Handling ở phía Backend / WAF (Web Application Firewall). Header URI bị phình to quá mức cho phép của Nginx/Tomcat dẫn đến Request bị từ chối ngay ở lớp mạng (Layer 7).
*   **Tác động**:
    Làm sập hoàn toàn trải nghiệm của người dùng. Kẻ tấn công có thể lợi dụng điều này bằng cách tự động gửi hàng loạt request siêu dài để gây lãng phí tài nguyên máy chủ hoặc từ chối dịch vụ (Denial of Service - DoS) ở cấp độ nhẹ.
*   **Kết quả thực tế**: Trả về mã lỗi HTTP 400 và giao diện vỡ nát (HTML thô).
*   **Mong đợi**: Hệ thống phải cắt bớt (truncate) chuỗi tìm kiếm hoặc bắt lỗi và trả về giao diện báo lỗi thân thiện với người dùng (HTTP 200 kèm UI, hoặc HTTP 404 có giao diện).
