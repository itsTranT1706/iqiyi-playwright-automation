# iQIYI Automation Testing Framework

Dự án này xây dựng một khung kiểm thử tự động (Automation Testing Framework) hoàn chỉnh cho nền tảng xem phim trực tuyến **iQIYI** (trang web [iq.com](https://www.iq.com)) bằng việc sử dụng **Playwright** và **TypeScript**. 

Khung kiểm thử được thiết kế theo mô hình **Page Object Model (POM)** và phân tách thành nhiều dự án nhỏ (E2E, Data-Driven, Security, Visual, Broken Links) nhằm đảm bảo tính ổn định, dễ bảo trì và tối ưu hiệu năng.

---

## 📂 Cấu trúc dự án

```text
├── .github/               # Cấu hình GitHub Actions CI (nếu có)
├── data/                  # Dữ liệu phục vụ kiểm thử (CSV, JSON, Txt payloads)
│   ├── accounts.json      # Danh sách tài khoản mẫu để test đăng nhập/đăng ký
│   ├── keywords.csv       # Danh sách từ khóa test tìm kiếm data-driven
│   ├── sqli-payloads.txt  # Danh sách payload kiểm thử tấn công SQL Injection
│   └── xss-payloads.txt   # Danh sách payload kiểm thử tấn công XSS
├── pages/                 # Các Page Objects định nghĩa phần tử & hành động trên giao diện (POM)
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── IqiyiHomePage.ts
│   ├── IqiyiLibraryPage.ts
│   ├── IqiyiPlayerPage.ts
│   └── IqiyiSearchPage.ts
├── tests/                 # Thư mục chứa các kịch bản kiểm thử phân loại theo module
│   ├── broken-links/      # Kiểm tra các liên kết hỏng (Broken links crawler)
│   ├── data-driven/       # Kiểm thử hướng dữ liệu (Search & Register)
│   ├── e2e/               # Kịch bản kiểm thử luồng người dùng đầu cuối (E2E)
│   ├── security/          # Kiểm thử lỗ hổng bảo mật (XSS, SQL Injection)
│   └── visual/            # Kiểm thử giao diện trực quan (Visual Regression)
├── utils/                 # Các module hỗ trợ đọc file, thu thập liên kết, xử lý phụ trợ
├── auth.json              # Lưu trữ trạng thái phiên đăng nhập (Cookies/Storage State)
├── playwright.config.ts   # Tệp cấu hình chính của Playwright (định nghĩa 5 Projects)
└── package.json           # Quản lý thư viện phụ thuộc và các câu lệnh chạy nhanh
```

---

## 🛠️ Các chức năng và kịch bản đã được kiểm thử

Dự án kiểm thử tự động bao gồm 5 nhóm dự án (Playwright Projects) tương ứng với các chức năng cụ thể sau:

### 1. Luồng nghiệp vụ người dùng cuối (`tests/e2e/`)
Kiểm thử các hành động tương tác chính của một tài khoản người dùng trên hệ thống:
*   **Trình phát Video (Video Player):** Tự động phát hiện và bỏ qua quảng cáo (Skip Ads), xác nhận luồng stream chính hoạt động, thực hiện tua tiến/lùi thời gian phát và kiểm tra nút Xem sau.
*   **Bộ lọc tìm kiếm nâng cao (Advanced Filters):** Điều hướng trang kết quả tìm kiếm, đi tới thư viện phim bộ, áp dụng các bộ lọc phân loại theo khu vực/thể loại và xác thực danh sách hiển thị cập nhật đúng.
*   **Lịch sử xem phim (Continue Watching):** Xem phim đạt mốc quy định, điều hướng trang lịch sử cá nhân để xác minh phim đã lưu dấu thành công.
*   **Danh sách xem sau (Watch Later):** Thêm phim vào danh sách từ trình phát, kiểm tra thông báo thành công và kiểm tra phim xuất hiện trong kho lưu trữ cá nhân.

### 2. Kiểm thử hướng dữ liệu (`tests/data-driven/`)
Tách rời kịch bản kiểm thử và dữ liệu đầu vào để kiểm tra tính toàn vẹn của ứng dụng trên quy mô lớn:
*   **Tìm kiếm hàng loạt:** Đọc dữ liệu từ file `data/keywords.csv` để kiểm thử tìm kiếm với các ngôn ngữ tiếng Anh, tiếng Việt có dấu, show cụ thể, từ khóa không tồn tại, từ khóa chứa HTML đặc biệt và khoảng trắng.
*   **Xác thực đăng ký:** Nạp dữ liệu từ `data/accounts.json` để kiểm tra độ chính xác của cơ chế validate định dạng email/mật khẩu phía Client trước khi gửi request tới máy chủ iQIYI.

### 3. Kiểm thử bảo mật cơ bản (`tests/security/`)
*   **SQL Injection:** Gửi trực tiếp các payload SQLi (như `' OR '1'='1`) qua tham số URL tìm kiếm nhằm phát hiện xem máy chủ có trả về lỗi 500 hoặc hiển thị thông tin rò rỉ cơ sở dữ liệu trên giao diện.
*   **XSS (Cross-Site Scripting):** Truyền các đoạn mã độc dạng thẻ `<script>` hoặc `<img onerror>` qua thanh tìm kiếm, bắt sự kiện popup cảnh báo để đảm bảo hệ thống đã lọc sạch (escape) đầu vào trước khi render hiển thị.

### 4. Quét liên kết hỏng (`tests/broken-links/`)
*   **Link Crawler:** Tự động thu thập toàn bộ các liên kết động trên trang chủ iQIYI (lên tới hơn **500 links**), chọn ra tập mẫu và gửi yêu cầu kiểm tra HTTP HEAD/GET để đảm bảo không có đường dẫn nào bị lỗi liên kết hoặc trả về mã lỗi 4xx/5xx.

### 5. Nhất quán giao diện trực quan (`tests/visual/`)
*   **Visual Regression:** Chụp ảnh Header, Footer và đối chiếu sai lệch pixel so với ảnh chuẩn (baseline) với độ lệch tối đa cho phép là 5% (đã loại trừ các khu vực quảng cáo động hoặc banner chuyển động để tránh báo lỗi giả).
*   **Lazy Loading:** Sử dụng cơ chế tự động cuộn trang dần dần (`progressive auto-scrolling`) để tải đầy đủ dữ liệu trước khi so sánh giao diện Footer.

---

## 🚀 Hướng dẫn thiết lập và chạy kiểm thử

### 1. Cài đặt các thư viện phụ thuộc
Yêu cầu máy đã cài đặt Node.js. Chạy câu lệnh sau tại thư mục gốc của dự án:
```bash
npm install
npx playwright install chrome
```

### 2. Chạy mặc định (Chỉ chạy 4 chức năng E2E chính)
Theo cấu hình mặc định trong `playwright.config.ts`, khi bạn chạy câu lệnh dưới đây, hệ thống sẽ **chỉ chạy 4 chức năng E2E cốt lõi**:
*   *Trình phát Video*
*   *Tìm kiếm & Bộ lọc*
*   *Lưu lịch sử xem tiếp*
*   *Danh sách xem sau*

```bash
# Chạy mặc định 4 chức năng E2E chính
npx playwright test
```

### 3. Chạy kiểm thử cho các dự án/module nâng cao khác
Bạn có thể chạy riêng từng Project nâng cao bằng cách chỉ định cờ `--project` tương ứng:

*   **Chạy luồng E2E trên trình duyệt Chrome thực tế:**
    ```bash
    npx playwright test --project="E2E - Chrome"
    ```
*   **Chạy kiểm thử hướng dữ liệu (Data-Driven):**
    ```bash
    npx playwright test tests/data-driven --project="Data-Driven"
    ```
*   **Chạy kiểm thử bảo mật (SQLi & XSS):**
    ```bash
    npx playwright test tests/security --project="Security"
    ```
*   **Chạy quét liên kết lỗi (Broken Links):**
    ```bash
    npx playwright test tests/broken-links --project="Broken Links"
    ```
*   **Chạy so khớp giao diện trực quan (Visual Regression):**
    *   *Tạo/Cập nhật ảnh chuẩn (Lần đầu):*
        ```bash
        npx playwright test tests/visual --project="Visual" --update-snapshots
        ```
    *   *So sánh đối chiếu thực tế:*
        ```bash
        npx playwright test tests/visual --project="Visual"
        ```

### 4. Cheatsheet Câu lệnh thường dùng (Dành cho QA)

Dưới đây là các câu lệnh hữu ích để thực thi test script trong các tình huống thực tế:

*   **Chạy toàn bộ các test cases (Chạy tổng bộ):**
    ```bash
    npx playwright test
    ```
*   **Chạy tất cả test của một chức năng cụ thể (Ví dụ: Tìm kiếm):**
    ```bash
    npx playwright test tests/e2e/search.spec.ts
    ```
*   **Chạy riêng một Test Case cụ thể (Bằng mã TC hoặc tên):**
    ```bash
    npx playwright test -g "TC2.16"
    ```
*   **Chạy riêng kiểm thử lỗi liệt nút Bình luận (BUG-005):**
    ```bash
    npx playwright test tests/e2e/comments.spec.ts --project="E2E - Chrome"
    ```
*   **Chạy riêng kiểm thử rò rỉ Bảo mật Server (BUG-SEC-001):**
    ```bash
    npx playwright test tests/e2e/security.spec.ts --project="E2E - Chrome"
    ```
*   **Xóa phiên đăng nhập (Auth Session) để ép chạy lại luồng Login từ đầu:**
    ```bash
    Remove-Item auth.json -ErrorAction SilentlyContinue
    ```
    *(Đối với Linux/macOS: `rm -f auth.json`)*

*   **Tạo và xem báo cáo kiểm thử tự động (HTML Report):**
    Sau khi chạy xong, Playwright tự động lưu kết quả. Để mở báo cáo lên xem ảnh/video lỗi:
    ```bash
    npx playwright show-report
    ```
