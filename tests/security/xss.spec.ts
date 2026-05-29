/**
 * @module Security Testing — XSS (Cross-Site Scripting)
 * @description
 * Kiểm tra xem thanh tìm kiếm có lọc sạch mã độc XSS hay không.
 *
 * Cách chạy:
 *   npx playwright test tests/security/xss.spec.ts --project="Security"
 */
import { test, expect } from '@playwright/test';
import { loadPayloads } from '../../utils/securityPayloads';

const XSS_PAYLOADS = loadPayloads('data/xss-payloads.txt');

test.describe('Security: XSS — Ô tìm kiếm', () => {

  for (const payload of XSS_PAYLOADS) {
    test(`XSS payload: ${payload}`, async ({ page }) => {
      let alertTriggered = false;

      // Đăng ký bộ lắng nghe hộp thoại để bắt lỗi XSS thành công
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.dismiss();
      });

      // Điều hướng đến trang search với XSS payload
      await page.goto(
        `https://www.iq.com/search?query=${encodeURIComponent(payload)}&lang=vi_vn`,
        { waitUntil: 'domcontentloaded', timeout: 60000 }
      );
      await page.waitForTimeout(2000);

      // 1. Xác nhận không bị trigger hộp thoại cảnh báo alert()
      expect(alertTriggered).toBe(false);

      // 2. Xác nhận payload trong HTML được hiển thị dưới dạng chuỗi an toàn (escaped) thay vì code thực thi
      const hasUnescapedScript = await page.evaluate((txt) => {
        // Tìm xem có thẻ script nào chứa payload được sinh ra động không
        const scripts = Array.from(document.querySelectorAll('script'));
        return scripts.some(s => s.textContent && s.textContent.includes(txt));
      }, payload);

      expect(hasUnescapedScript).toBe(false);
      console.log(`✅ Payload an toàn trước XSS: "${payload}"`);
    });
  }
});
