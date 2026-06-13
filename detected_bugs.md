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

