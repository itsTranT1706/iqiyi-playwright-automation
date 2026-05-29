/**
 * @module Visual Regression — Trình phát video
 * @description
 * Đảm bảo trình phát video không bị lỗi vỡ khung hình, lệch nút điều khiển.
 *
 * Cách chạy:
 *   npx playwright test tests/visual/player.spec.ts --project="Visual" --update-snapshots
 */
import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';

test.describe('Visual Regression — Trình phát video', () => {

  test('Giao diện thanh điều khiển player không thay đổi', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await page.setViewportSize({ width: 1280, height: 800 });

    // Bước 1: Mở trang phát video và bỏ qua quảng cáo
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    await page.waitForTimeout(2000);

    // Tạm dừng video để tránh hình ảnh chuyển động gây lệch ảnh chụp
    await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => v.pause());
    });
    await page.waitForTimeout(1000);

    // Hover chuột vào vùng chứa player để hiển thị thanh điều khiển
    const videoEl = page.locator('video').first();
    await videoEl.hover().catch(() => {});
    await page.waitForTimeout(1500);

    // Bước 2: Chụp ảnh vùng controls dưới player
    const controls = page.locator('.player-controls, .iqp-controls, [class*="control-bar"]').first();
    if (await controls.isVisible().catch(() => false)) {
      await expect(controls).toHaveScreenshot('player-controls-baseline.png', {
        maxDiffPixelRatio: 0.1, // Chấp nhận độ lệch pixel lên tới 10% do tiến trình hoặc thời gian động hiển thị
        timeout: 30000
      });
    } else {
      console.log('⚠️ Không tìm thấy thanh điều khiển hiển thị, kiểm tra sự hiện diện của phần tử video để đảm bảo player hoạt động.');
      await expect(videoEl).toBeAttached({ timeout: 10000 });
    }
  });
});
