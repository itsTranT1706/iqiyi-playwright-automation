import { test, expect } from '@playwright/test';

test.describe('iQIYI E2E: Kiểm thử Bảo mật (Security Tests)', () => {

  test('TC-SEC-01: Rò rỉ thông tin hạ tầng máy chủ trên trang lỗi API 404', async ({ request }) => {
    // 1. Gửi HTTP GET request tới một endpoint API hoàn toàn không tồn tại
    const testUrl = 'https://rcd.iq.com/apis/mbd/v2/KHONG_TON_TAI_TRONG_HE_THONG_123';
    
    console.log(`Gửi request tới API không tồn tại: ${testUrl}`);
    const response = await request.get(testUrl, {
      ignoreHTTPSErrors: true
    });

    // 2. Hệ thống phải trả về mã lỗi 404
    expect(response.status()).toBe(404);

    // 3. Trích xuất toàn bộ nội dung HTML/JSON trả về
    const body = await response.text();

    // 4. Assert: Đảm bảo body KHÔNG chứa thông tin phiên bản máy chủ nhạy cảm
    // Lỗi hiện tại: "<h3>Apache Tomcat/9.0.6</h3>"
    // Ghi chú: Expect này SẼ THẤT BẠI (FAIL) vì đây là lỗi đang tồn tại trên iQIYI.
    expect(body, '❌ BUG-SEC-001: Phát hiện lỗ hổng Information Disclosure! Response trả về để lộ phiên bản máy chủ Apache Tomcat')
        .not.toMatch(/Apache Tomcat\/\d+\.\d+\.\d+/i);
  });

});
