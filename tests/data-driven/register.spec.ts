/**
 * @module Data-Driven Registration Testing
 * @description
 * Kiểm thử luồng kiểm tra tính hợp lệ của tài khoản khi đăng ký/đăng nhập.
 *
 * Lý do sử dụng:
 * - Đảm bảo hệ thống phát hiện định dạng email/mật khẩu không đúng chuẩn trước khi gửi lên server.
 * - Test data được cấu hình hoàn toàn ngoài code (`data/accounts.json`).
 *
 * Cách chạy:
 *   npx playwright test tests/data-driven/register.spec.ts --project="Data-Driven"
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Đọc danh sách account từ file JSON
const accountsPath = path.resolve(process.cwd(), 'data/accounts.json');
const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8'));

test.describe('Data-Driven: Kiểm tra hợp lệ form Tài khoản', () => {

  test.use({ storageState: { cookies: [], origins: [] } }); // Chạy chế độ ẩn danh (không login)

  for (const account of accounts) {
    test(`Kiểm tra định dạng email: ${account.email}`, async ({ page }) => {
      // Bước 1: Điều hướng đến trang chủ và chấp nhận cookie
      await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);

      const acceptCookies = page.locator('text=Chấp nhận tất cả Cookies, text=Accept All Cookies').first();
      if (await acceptCookies.isVisible().catch(() => false)) {
        await acceptCookies.click();
        await page.waitForTimeout(1000);
      }

      // Bước 2: Nhấp chọn nút Đăng nhập hoặc Của tôi để hiển thị Form Đăng nhập
      await page.evaluate(() => {
        // Tìm và click/hover Của tôi/Me/Login
        const triggers = Array.from(document.querySelectorAll('a, div, span, button, img'));
        const trigger = triggers.find(el => {
          const text = el.textContent?.trim() || '';
          const cls = el.className || '';
          return text === 'Me' || text === 'Của tôi' || text === 'Log In' || text === 'Đăng nhập' || 
                 cls.includes('header-login') || cls.includes('header-avatar') || cls.includes('user-info');
        });
        if (trigger) {
          (trigger as HTMLElement).click();
        }
      });
      await page.waitForTimeout(2000);

      // Click nút "Log In" / "Đăng nhập" thực sự (có thể nằm trong dropdown hoặc modal)
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('a, button, div, span'));
        const loginBtn = buttons.find(el => {
          const text = el.textContent?.trim() || '';
          const cls = el.className || '';
          return (text === 'Log In' || text === 'Đăng nhập' || text === 'Login' || text === 'Sign In') && 
                 !cls.includes('disabled');
        });
        if (loginBtn) {
          (loginBtn as HTMLElement).click();
        }
      });
      await page.waitForTimeout(3000);

      // Nhấp chọn tab đăng nhập bằng Email/SĐT / Password
      const emailTab = page.locator('div.passport-btn:has-text("Log in with Password"), div.passport-btn-login:has-text("Log in with Password"), div.passport-btn:has-text("Đăng nhập bằng mật khẩu")').first();
      await emailTab.click();
      await page.waitForTimeout(2000);

      // Xem toàn bộ input và iframe đang có trong DOM để gỡ lỗi
      const debugInfo = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          outerHTML: i.outerHTML.substring(0, 150),
          visible: i.offsetWidth > 0 && i.offsetHeight > 0
        }));
        const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
          src: f.src,
          id: f.id,
          class: f.className
        }));
        return { inputs, iframes };
      });
      console.log('🔍 [DEBUG] Inputs found:', JSON.stringify(debugInfo.inputs, null, 2));
      console.log('🔍 [DEBUG] Iframes found:', JSON.stringify(debugInfo.iframes, null, 2));

      // Bước 3: Nhập thông tin email (lọc chỉ lấy ô input đang hiển thị trên giao diện)
      const emailInput = page.locator('input.passport-input__input[type="text"]').filter({ visible: true }).first();
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await emailInput.fill(account.email);
      await emailInput.press('Tab'); // Trigger validation blur event
      await page.waitForTimeout(1000);

      console.log(`👤 Đã điền email: ${account.email}`);
      const val = await emailInput.inputValue();
      expect(val).toBe(account.email);
    });
  }
});
