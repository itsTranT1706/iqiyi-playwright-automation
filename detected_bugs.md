# Nhật ký Lỗi hệ thống phát hiện qua Automation (Detected Bugs Log)

Tài liệu này ghi lại tất cả các lỗi chức năng và giao diện của website iQIYI phát hiện được trong quá trình chạy bộ test tự động.

---

## 🐛 BUG-001: Lỗi không dịch ngôn ngữ theo tham số URL `?lang`

*   **Mã Test Case liên quan**: [TC2.15: Đồng nhất ngôn ngữ hiển thị bản dịch theo tham số ?lang trên URL](file:///e:/My%20workspace/tester/tests/e2e/search.spec.ts)
*   **Mức độ nghiêm trọng**: Trung bình (Medium) - Ảnh hưởng đến trải nghiệm quốc tế hóa người dùng.
*   **Mô tả**: Khi người dùng truy cập trang web thông qua một URL có chứa tham số ngôn ngữ tiếng Việt (`?lang=vi_vn`), trang kết quả tìm kiếm không chuyển ngữ tiêu đề của các tác phẩm quốc tế sang tiếng Việt.
*   **Các bước tái hiện (Steps to Reproduce)**:
    1. Mở trình duyệt và truy cập: `https://www.iq.com/search?query=Descendants%20of%20the%20sun&lang=vi_vn`
    2. Chờ trang kết quả tìm kiếm tải xong.
    3. Quan sát tiêu đề của bộ phim đầu tiên hiển thị trên màn hình.
*   **Kết quả kỳ vọng (Expected Behavior)**:
    * Tiêu đề bộ phim phải được bản địa hóa và hiển thị bằng tiếng Việt: `"Hậu duệ mặt trời"` (hoặc `"Hậu Duệ Mặt Trời"`).
*   **Kết quả thực tế (Actual Behavior)**:
    * Tiêu đề phim vẫn hiển thị nguyên bản tiếng Anh: `"Descendants of the Sun"`.
    * Log ghi nhận: `TC2.15: Hiển thị tiêu đề Tiếng Việt khi lang=vi_vn: false`.

---

## 🐛 BUG-002: Lỗi không lưu Lịch sử tìm kiếm gần đây

*   **Mã Test Case liên quan**: [TC2.10: Lưu từ khóa tìm kiếm gần đây](file:///e:/My%20workspace/tester/tests/e2e/search.spec.ts)
*   **Mức độ nghiêm trọng**: Thấp (Low) - Ảnh hưởng đến tính tiện ích khi tìm kiếm.
*   **Mô tả**: Sau khi thực hiện tìm kiếm một từ khóa bất kỳ, hệ thống không lưu lại từ khóa đó vào phần "Tìm kiếm gần đây" (Recent Searches) xuất hiện khi click vào ô tìm kiếm ở trang chủ.
*   **Các bước tái hiện (Steps to Reproduce)**:
    1. Truy cập trang kết quả tìm kiếm với một từ khóa mới: `https://www.iq.com/search?query=HistoryTest123&lang=vi_vn`
    2. Sau khi trang tìm kiếm tải xong, quay lại trang chủ iQIYI: `https://www.iq.com/?lang=vi_vn`
    3. Click vào ô tìm kiếm trên thanh Header để mở danh sách gợi ý và lịch sử gần đây.
*   **Kết quả kỳ vọng (Expected Behavior)**:
    * Từ khóa `"HistoryTest123"` vừa tìm kiếm ở bước 1 phải xuất hiện trong phần lịch sử tìm kiếm gần đây trên trang chủ.
*   **Kết quả thực tế (Actual Behavior)**:
    * Từ khóa không xuất hiện trong lịch sử tìm kiếm gần đây.
    * Log ghi nhận: `Từ khóa được lưu trong lịch sử gần đây: false`.

---

## 🐛 BUG-003: Lỗi không hiển thị Gợi ý tự động (Autocomplete suggestions)

*   **Mã Test Case liên quan**: [TC2.8: Gợi ý tìm kiếm khi nhập liệu](file:///e:/My%20workspace/tester/tests/e2e/search.spec.ts)
*   **Mức độ nghiêm trọng**: Trung bình (Medium) - Giảm khả năng tiếp cận nhanh nội dung của người dùng.
*   **Mô tả**: Khi gõ từ khóa vào ô tìm kiếm trên trang chủ, hộp danh sách gợi ý tự động (autocomplete dropdown list) không hiển thị để gợi ý các bộ phim khớp với từ khóa đang nhập.
*   **Các bước tái hiện (Steps to Reproduce)**:
    1. Truy cập trang chủ iQIYI: `https://www.iq.com/?lang=vi_vn`
    2. Click vào ô tìm kiếm trên thanh Header.
    3. Nhập từ khóa `"de"`.
*   **Kết quả kỳ vọng (Expected Behavior)**:
    * Xuất hiện menu gợi ý tự động chứa danh sách các phim chứa chữ `"de"` (Ví dụ: *Descendants of the Sun*, *Dazzling*, v.v.).
*   **Kết quả thực tế (Actual Behavior)**:
    * Hộp gợi ý tự động không hiển thị trên màn hình.
    * Log ghi nhận: `TC2.8: Menu gợi ý tìm kiếm hiển thị: false`.
