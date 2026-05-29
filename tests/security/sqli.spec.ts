/**
 * @module Security Testing — SQL Injection
 * @description
 * Kiểm tra xem thanh tìm kiếm có an toàn trước các payload SQL Injection cơ bản.
 *
 * Cách chạy:
 *   npx playwright test tests/security/sqli.spec.ts --project="Security"
 */
import { test, expect } from '@playwright/test';
import { loadPayloads } from '../../utils/securityPayloads';

const SQLI_PAYLOADS = loadPayloads('data/sqli-payloads.txt');

// Dấu hiệu các lỗi cơ sở dữ liệu phổ biến hiển thị ra màn hình
const SQL_ERROR_SIGNATURES = [
  'syntax error', 'mysql_fetch', 'ORA-', 'SQL syntax',
  'sqlite_', 'PostgreSQL', 'Microsoft OLE DB', 'ODBC SQL'
];

test.describe('Security: SQL Injection — Ô tìm kiếm', () => {

  for (const payload of SQLI_PAYLOADS) {
    test(`SQLi payload: ${payload}`, async ({ page }) => {

      // Bước 1: Gửi payload qua URL tìm kiếm
      const response = await page.goto(
        `https://www.iq.com/search?query=${encodeURIComponent(payload)}&lang=vi_vn`,
        { waitUntil: 'domcontentloaded', timeout: 60000 }
      );

      // Bước 2: Phản hồi HTTP không được là mã lỗi server 500
      expect(response?.status()).not.toBe(500);

      // Bước 3: Đảm bảo giao diện không hiển thị lỗi database thô
      const pageContent = await page.content();
      const leakedError = SQL_ERROR_SIGNATURES.find(sig =>
        pageContent.toLowerCase().includes(sig.toLowerCase())
      );

      expect(leakedError).toBeUndefined();
      console.log(`✅ Payload an toàn trước SQLi: "${payload}"`);
    });
  }
});
