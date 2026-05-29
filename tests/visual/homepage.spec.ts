/**
 * @module Visual Regression — Trang chủ
 * @description
 * Kiểm thử sự nhất quán của giao diện (Visual Regression Testing) trên trang chủ iQIYI.
 *
 * Lý do sử dụng:
 * - Dùng mắt thường không thể nhận biết được độ lệch giao diện nhỏ (1-2 pixels) hoặc thay đổi thuộc tính CSS ẩn.
 * - Test này tự động so sánh ảnh chụp thực tế với ảnh chuẩn (baseline) từng pixel.
 *
 * Cách chạy:
 *   Lần 1 (Tạo baseline): npx playwright test tests/visual/homepage.spec.ts --project="Visual" --update-snapshots
 *   Lần 2 (So sánh thực tế): npx playwright test tests/visual/homepage.spec.ts --project="Visual"
 */
import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Trang chủ iQIYI', () => {

  test.beforeEach(async ({ page }) => {
    // Đặt kích thước màn hình nhất quán
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Điều hướng trang chủ
    await page.goto('https://www.iq.com/?lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Ẩn bớt các quảng cáo động để tránh false positive khi so sánh ảnh
    await page.addStyleTag({
      content: `
        .banner-ad, .ad-container, [class*="countdown"],
        .marquee, [class*="animate"], .qy-slide-wrap, [class*="slide"] {
          visibility: hidden !important;
        }
      `
    });
    await page.waitForTimeout(3000);
  });

  test('Giao diện header không thay đổi', async ({ page }) => {
    // Chỉ chụp vùng header để tăng tính chính xác
    const header = page.locator('.header-container, .header-inner, header').first();
    await expect(header).toHaveScreenshot('header-baseline.png', {
      maxDiffPixelRatio: 0.05, // Sai số 5% số lượng pixel chấp nhận được do các thay đổi text động
      timeout: 30000
    });
  });

  test('Giao diện footer không thay đổi', async ({ page }) => {
    // Cuộn xuống dần dần để kích hoạt lazy load toàn trang
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 150);
      });
    });
    await page.waitForTimeout(2000);

    // Cuộn xuống footer
    const footer = page.locator('#footer-box, .footer-inner, .footer').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    await expect(footer).toHaveScreenshot('footer-baseline.png', {
      maxDiffPixelRatio: 0.05,
      timeout: 30000
    });
  });
});
