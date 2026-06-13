import { test } from '@playwright/test';

test('Manual Login and Save Session', async ({ page }) => {
  // Set window size
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating to iQIYI homepage...');
  await page.goto('https://www.iq.com/?lang=vi_vn');

  console.log('*** VUI LÒNG ĐĂNG NHẬP TRÊN TRÌNH DUYỆT ĐANG MỞ ***');
  console.log('Đang chờ bạn đăng nhập (tối đa 3 phút)...');

  // Chờ cho avatar xuất hiện
  await page.waitForSelector('div.userImg-wrap, .userImg-wrap, [class*="userImg"]', { timeout: 180000 });

  console.log('✅ Đã đăng nhập thành công!');
  
  // Lưu cookie và storage state mới vào auth.json
  await page.context().storageState({ path: 'auth.json' });
  console.log('✅ Đã cập nhật session mới vào auth.json!');
});
