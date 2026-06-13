import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Hàm load file .env thủ công
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
}

test('Login and Save Session (Auto or Manual)', async ({ page }) => {
  loadEnv();
  const email = process.env.IQIYI_EMAIL;
  const password = process.env.IQIYI_PASSWORD;

  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating to iQIYI homepage...');
  await page.goto('https://www.iq.com/?lang=vi_vn');

  // Chấp nhận cookie nếu xuất hiện
  const acceptBtn = page.locator('text=Chấp nhận tất cả Cookies, text=Accept All Cookies, .cookie-accept-btn').first();
  if (await acceptBtn.isVisible().catch(() => false)) {
    await acceptBtn.click();
    console.log('👉 Đã chấp nhận Cookies');
  }

  if (email && password) {
    console.log('🔑 Phát hiện thông tin tài khoản trong .env. Bắt đầu tự động đăng nhập...');
    try {
      // Click nút Đăng nhập ở Header
      const loginBtn = page.locator('.login-button, .userImg-wrap').first();
      await loginBtn.click();
      await page.waitForTimeout(3000);

      // Click "Đăng nhập bằng mật khẩu" (Log in with Password)
      const pwdLoginTab = page.locator('.passport-btn', { hasText: /Log in with Password|Đăng nhập bằng mật khẩu/i }).first();
      await pwdLoginTab.click();
      await page.waitForTimeout(2000);

      // Điền Email & Mật khẩu
      await page.locator('.global-passport input[type="text"]').first().fill(email);
      await page.locator('.global-passport input[type="password"]').first().fill(password);

      // Click nút Đăng nhập chính
      await page.locator('.global-passport .passport-btn-primary').first().click();
      console.log('⏳ Đang chờ hoàn tất đăng nhập (hoặc giải Captcha nếu có)...');
      
      // Chờ avatar người dùng xuất hiện (cho phép 45 giây để tự động hoặc giải captcha nhanh)
      await page.waitForSelector('div.userImg-wrap, .userImg-wrap, [class*="userImg"]', { timeout: 45000 });
      console.log('✅ Tự động đăng nhập thành công!');
    } catch (error) {
      console.log(`⚠️ Tự động đăng nhập thất bại hoặc bị chặn bởi Captcha: ${error.message}`);
      console.log('👉 Chuyển sang chế độ ĐĂNG NHẬP THỦ CÔNG...');
      console.log('*** VUI LÒNG ĐĂNG NHẬP TRÊN TRÌNH DUYỆT ĐANG MỞ ***');
      await page.waitForSelector('div.userImg-wrap, .userImg-wrap, [class*="userImg"]', { timeout: 180000 });
    }
  } else {
    console.log('⚠️ Không tìm thấy IQIYI_EMAIL / IQIYI_PASSWORD trong .env.');
    console.log('👉 Chuyển sang chế độ ĐĂNG NHẬP THỦ CÔNG...');
    console.log('*** VUI LÒNG ĐĂNG NHẬP TRÊN TRÌNH DUYỆT ĐANG MỞ ***');
    console.log('Đang chờ bạn đăng nhập (tối đa 3 phút)...');
    
    // Chờ cho avatar xuất hiện
    await page.waitForSelector('div.userImg-wrap, .userImg-wrap, [class*="userImg"]', { timeout: 180000 });
  }

  // Lưu cookie và storage state mới vào auth.json
  await page.context().storageState({ path: 'auth.json' });
  console.log('✅ Đã cập nhật session mới vào auth.json!');
});

