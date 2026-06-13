import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load .env variables manually to ensure no third-party package dependencies
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
          console.log(`Loaded Env: ${key}`);
        }
      }
    });
  } else {
    console.log('⚠️ Không tìm thấy file .env, sẽ sử dụng biến môi trường hệ thống nếu có.');
  }
}

export async function autoLogin(force: boolean = false) {
  loadEnv();
  
  const email = process.env.IQIYI_EMAIL;
  const password = process.env.IQIYI_PASSWORD;

  if (!email || !password) {
    console.error('❌ Lỗi: IQIYI_EMAIL hoặc IQIYI_PASSWORD không được cấu hình trong file .env');
    return false;
  }

  const authPath = path.resolve(process.cwd(), 'auth.json');
  let sessionValid = false;

  // 1. Kiểm tra session hiện tại nếu không bắt buộc đăng nhập lại (force = false)
  if (!force && fs.existsSync(authPath)) {
    console.log('🔍 Đang kiểm tra phiên đăng nhập hiện tại trong auth.json...');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
      const context = await browser.newContext({ storageState: authPath });
      const page = await context.newPage();
      
      // Đi tới trang chủ iQIYI
      await page.goto('https://www.iq.com/?lang=vi_vn', { timeout: 30000 });
      await page.waitForTimeout(3000);
      
      // Kiểm tra xem avatar người dùng đã đăng nhập có hiển thị không
      const userAvatar = page.locator('div.userImg-wrap, .userImg-wrap, [class*="userImg"]').first();
      if (await userAvatar.isVisible()) {
        console.log('✅ Phiên đăng nhập trong auth.json vẫn còn hiệu lực!');
        sessionValid = true;
      } else {
        console.log('⚠️ Không tìm thấy avatar người dùng, phiên có thể đã hết hạn.');
      }
    } catch (e) {
      console.log(`⚠️ Lỗi khi kiểm tra phiên đăng nhập: ${e.message}`);
    } finally {
      await browser.close();
    }
  }

  if (sessionValid) {
    return true;
  }

  // 2. Tiến hành đăng nhập tự động bằng Email & Mật khẩu
  console.log('🔑 Bắt đầu quá trình tự động đăng nhập iQIYI...');
  const browser = await chromium.launch({ channel: 'chrome', headless: false }); // Chạy headed để dễ debug/vượt captcha nếu cần
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://www.iq.com/?lang=vi_vn', { timeout: 40000 });
    await page.waitForTimeout(4000);

    // Chấp nhận cookie nếu xuất hiện
    const acceptBtn = page.locator('text=Chấp nhận tất cả Cookies, text=Accept All Cookies, .cookie-accept-btn').first();
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      console.log('👉 Đã chấp nhận Cookies');
      await page.waitForTimeout(1000);
    }

    // Click nút Đăng nhập ở Header
    const loginBtn = page.locator('.login-button, .userImg-wrap').first();
    if (!(await loginBtn.isVisible())) {
      throw new Error('Không tìm thấy nút đăng nhập trên trang chủ iQIYI');
    }
    console.log('👉 Click nút Đăng nhập...');
    await loginBtn.click();
    await page.waitForTimeout(3000);

    // Click "Đăng nhập bằng mật khẩu" (Log in with Password)
    const pwdLoginTab = page.locator('.passport-btn', { hasText: /Log in with Password|Đăng nhập bằng mật khẩu/i }).first();
    if (!(await pwdLoginTab.isVisible())) {
      throw new Error('Không tìm thấy nút "Đăng nhập bằng mật khẩu" (Password Login tab)');
    }
    console.log('👉 Click Đăng nhập bằng mật khẩu...');
    await pwdLoginTab.click();
    await page.waitForTimeout(2000);

    // Tìm và điền Email
    const emailInput = page.locator('.global-passport input[type="text"]').first();
    if (!(await emailInput.isVisible())) {
      throw new Error('Không tìm thấy ô nhập Email');
    }
    console.log('👉 Điền Email...');
    await emailInput.fill(email);

    // Tìm và điền Mật khẩu
    const pwdInput = page.locator('.global-passport input[type="password"]').first();
    if (!(await pwdInput.isVisible())) {
      throw new Error('Không tìm thấy ô nhập Mật khẩu');
    }
    console.log('👉 Điền Mật khẩu...');
    await pwdInput.fill(password);

    // Click nút xác nhận Đăng nhập
    const submitBtn = page.locator('.global-passport .passport-btn-primary').first();
    if (!(await submitBtn.isVisible())) {
      throw new Error('Không tìm thấy nút Đăng nhập chính');
    }
    console.log('👉 Click nút Đăng nhập chính...');
    await submitBtn.click();

    // Chờ xem có yêu cầu mã xác minh (Captcha) hay không
    console.log('⏳ Đang chờ hệ thống xử lý đăng nhập...');
    
    // Đợi tối đa 2 phút phòng trường hợp có Captcha cần giải thủ công
    try {
      await page.waitForSelector('div.userImg-wrap, .userImg-wrap, [class*="userImg"]', { timeout: 120000 });
      console.log('✅ Đăng nhập thành công!');
      
      // Lưu lại phiên đăng nhập
      await context.storageState({ path: authPath });
      console.log(`✅ Đã lưu phiên đăng nhập mới vào ${authPath}`);
      return true;
    } catch (e) {
      console.error('❌ Không thể xác nhận đăng nhập thành công. Có thể do sai thông tin hoặc bị chặn bởi Captcha.');
      // Chụp màn hình lỗi để debug
      await page.screenshot({ path: 'login_error.png' });
      console.log('📸 Đã chụp ảnh màn hình lỗi tại login_error.png');
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi trong quá trình tự động đăng nhập: ${error.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

// Nếu script được chạy trực tiếp (ví dụ: qua npx ts-node)
if (require.main === module) {
  autoLogin().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
