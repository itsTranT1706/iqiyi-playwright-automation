import { chromium } from '@playwright/test';

async function saveAuth() {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.iq.com/?lang=vi_vn');

  // Chờ người dùng đã đăng nhập (kiểm tra avatar xuất hiện)
  console.log('Đang kiểm tra trạng thái đăng nhập...');
  // Tăng timeout lên 180 giây (3 phút) để người dùng có thời gian đăng nhập thủ công
  await page.waitForSelector('div.userImg-wrap', { timeout: 180000 });
  console.log('✅ Đã đăng nhập thành công!');

  // Lưu cookie và storage state
  await context.storageState({ path: 'auth.json' });
  console.log('✅ Đã lưu phiên đăng nhập vào auth.json');

  await browser.close();
}

saveAuth().catch(console.error);
