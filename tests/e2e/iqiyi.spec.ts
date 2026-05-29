import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';
import { IqiyiLibraryPage } from '../../pages/IqiyiLibraryPage';

const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';

test.describe('iQIYI Testing Suite', () => {

  // ================================================================
  // MODULE 1: Kiểm thử Trình phát Video
  // ================================================================
  test('Module 1: Video Player Functionality', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);

    await test.step('Mở trang phim và chờ quảng cáo kết thúc', async () => {
      await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    });

    await test.step('Xác nhận video chính đang phát (currentTime > 0)', async () => {
      await page.waitForTimeout(4000);
      const currentTime = await player.getCurrentPlaybackTime();
      console.log(`⏱ Thời gian phát hiện tại: ${currentTime}s`);
      expect(currentTime).toBeGreaterThan(0);
    });

    await test.step('Tua tiến 60 giây từ vị trí hiện tại', async () => {
      const timeBefore = await player.getCurrentPlaybackTime();
      await player.seekForwardBy(60);
      const timeAfter = await player.getCurrentPlaybackTime();
      console.log(`⏩ Trước khi tua: ${timeBefore.toFixed(1)}s | Sau khi tua: ${timeAfter.toFixed(1)}s`);
      expect(timeAfter).toBeGreaterThan(timeBefore);
    });

    await test.step('Kiểm tra nút Watch Later tồn tại trong DOM', async () => {
      const watchLaterBtn = page.locator('text=Watch Later').first();
      await expect(watchLaterBtn).toBeAttached({ timeout: 5000 });
      console.log('✅ Nút Watch Later tồn tại trong DOM');
    });
  });

  // ================================================================
  // MODULE 2: Luồng Tìm kiếm & Bộ lọc nâng cao
  // ================================================================
  test('Module 2: Search & Advanced Filters', async ({ page }) => {

    await test.step('Tìm kiếm "drama" qua URL trực tiếp', async () => {
      // Navigate thẳng đến trang kết quả search để tránh vấn đề input cũ
      await page.goto('https://www.iq.com/search?query=drama&lang=vi_vn', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await page.waitForTimeout(3000);
    });

    await test.step('Xác nhận trang kết quả tìm kiếm có phìm', async () => {
      // Kiểm tra URL đúng
      await expect(page).toHaveURL(/search/);
      // Dùng JS để đếm link thực sự hiển thị (bằng bounding box)
      const visibleCount = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/album/"], a[href*="/play/"]'));
        return links.filter(a => {
          const rect = a.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight;
        }).length;
      });
      console.log(`🔍 Tìm thấy ${visibleCount} kết quả visible cho "drama"`);
      expect(visibleCount).toBeGreaterThan(0);
    });

    await test.step('Vào trang thư viện phim bộ (Dramas)', async () => {
      await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await page.waitForTimeout(2000);
    });

    await test.step('Kiểm tra bộ lọc hiển thị', async () => {
      const filters = page.locator('.second-label-current, .filter-item, .label-item');
      await expect(filters.first()).toBeVisible({ timeout: 10000 });
      const count = await filters.count();
      console.log(`🎛 Tìm thấy ${count} bộ lọc`);
      expect(count).toBeGreaterThan(0);
    });

    await test.step('Áp dụng bộ lọc Thể loại', async () => {
      const filterItems = page.locator('.second-label-current');
      const count = await filterItems.count();
      if (count > 1) {
        const filterText = await filterItems.nth(1).innerText();
        await filterItems.nth(1).click();
        await page.waitForTimeout(2000);
        console.log(`✅ Đã chọn bộ lọc: "${filterText}"`);
      }
      const visibleCount = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/album/"]'));
        return links.filter(a => {
          const rect = a.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length;
      });
      console.log(`📋 Số phim sau khi lọc: ${visibleCount}`);
      expect(visibleCount).toBeGreaterThan(0);
    });
  });

  // ================================================================
  // MODULE 3: Lưu lịch sử xem tiếp
  // ================================================================
  test('Module 3: Continue Watching History', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    await test.step('Mở trang phim và chờ quảng cáo xong', async () => {
      await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    });

    await test.step('Tua đến 5% để tạo bookmark trong lịch sử', async () => {
      await page.waitForTimeout(3000);
      await player.seekTo(5);
      await page.waitForTimeout(4000);
      const time = await player.getCurrentPlaybackTime();
      console.log(`📍 Đã tua đến: ${time.toFixed(1)}s`);
      expect(time).toBeGreaterThan(0);
    });

    await test.step('Điều hướng đến trang lịch sử xem', async () => {
      await library.goToHistory();
    });

    await test.step('Xác nhận lịch sử có phim đã xem', async () => {
      await expect(page).toHaveURL(/history/);
      const hasItems = await library.hasHistoryItems();
      console.log(`📖 Trang lịch sử có phim: ${hasItems}`);
      expect(hasItems).toBe(true);
    });
  });

  // ================================================================
  // MODULE 4: Danh sách xem sau (Watch Later)
  // ================================================================
  test('Module 4: Watch Later (Collect) List', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    await test.step('Mở trang phim', async () => {
      await page.goto(TEST_VIDEO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
    });

    await test.step('Click nút Watch Later bên dưới player', async () => {
      await player.addToWatchLater();
      console.log('🔖 Đã click Watch Later');
    });

    await test.step('Vào trang danh sách xem sau để xác nhận', async () => {
      await library.goToCollections();
    });

    await test.step('Xác nhận danh sách xem sau có phim', async () => {
      await expect(page).toHaveURL(/collect/);
      const hasItems = await library.hasCollectItems();
      console.log(`📋 Danh sách xem sau có phim: ${hasItems}`);
      expect(hasItems).toBe(true);
    });
  });

});
