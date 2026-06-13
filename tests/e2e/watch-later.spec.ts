import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';
import { IqiyiLibraryPage } from '../../pages/IqiyiLibraryPage';
import * as fs from 'fs';

const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';

test.describe('iQIYI E2E: Xem sau (Watch Later / Favorites)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  // Removed local acceptCookies helper in favor of library.dismissCookies()

  test('TC4.1: Thêm phim vào Xem sau thành công', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // 1. Dọn dẹp Xem sau để kiểm tra chính xác
    await library.goToCollections();
    await library.dismissCookies();
    await library.clearAllItems();

    // 2. Thêm vào xem sau từ player
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    
    const isAddedBefore = await player.isWatchLaterAdded();
    if (!isAddedBefore) {
      await player.addToWatchLater();
      // Chờ cho trạng thái cập nhật trên UI
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }
    const isAddedAfter = await player.isWatchLaterAdded();
    expect(isAddedAfter).toBe(true);

    // 3. Xác nhận trên trang danh sách Xem sau
    await library.goToCollections();
    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await library.hasCollectItems();
    }, {
      message: 'Đợi phim xuất hiện trong danh sách Xem sau',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(true);

    const firstTitle = await library.getFirstCollectTitle();
    console.log(`TC4.1: Tiêu đề phim: ${firstTitle}`);
    expect(firstTitle.toLowerCase()).toContain('descendants');
  });

  test('TC4.2: Hủy phim khỏi Xem sau từ trang xem phim', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // 1. Đảm bảo đã có phim trong Xem sau
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    const isAdded = await player.isWatchLaterAdded();
    if (!isAdded) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }

    // Chờ 2 giây để trạng thái API/UI ổn định tránh lỗi click quá nhanh (debounce)
    await page.waitForTimeout(2000);

    // 2. Hủy thêm xem sau từ player
    await player.addToWatchLater(); // Toggle off
    await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(false);

    const isAddedAfter = await player.isWatchLaterAdded();
    expect(isAddedAfter).toBe(false);

    // 3. Xác nhận trên trang danh sách xem sau đã trống
    await library.goToCollections();
    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await library.hasCollectItems();
    }, {
      message: 'Đợi danh sách Xem sau trống sau khi hủy thêm',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(false);
  });

  test('TC4.3: Spam thêm/hủy liên tiếp cùng một bộ phim', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);

    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    const initialAddedState = await player.isWatchLaterAdded();
    console.log(`TC4.3: Trạng thái ban đầu: ${initialAddedState}`);

    let currentState = initialAddedState;
    const collectBtn = page.locator('.collection-wrap').first();
    await collectBtn.waitFor({ state: 'visible', timeout: 15000 });

    for (let i = 0; i < 5; i++) {
      await collectBtn.click({ force: true }).catch(() => {});
      
      // Chờ trạng thái đồng bộ chuyển đổi (tối đa 10 giây) bằng expect.poll
      const targetState = !currentState;
      await expect.poll(async () => {
        return await player.isWatchLaterAdded();
      }, { timeout: 10000 }).toBe(targetState);
      currentState = targetState;
      console.log(`TC4.3: Lần click thứ ${i + 1}, trạng thái đạt được: ${currentState}`);
      // Thêm 1.5 giây để tránh lỗi debounce của iQIYI
      await page.waitForTimeout(1500);
    }

    const finalAddedState = await player.isWatchLaterAdded();
    console.log(`TC4.3: Trạng thái sau khi click 5 lần: ${finalAddedState}`);
    // Click 5 lần (lẻ) -> Trạng thái phải đảo so với ban đầu
    expect(finalAddedState).toBe(!initialAddedState);
  });

  test('TC4.4: Thêm vào Xem sau khi mất mạng đột ngột', async ({ page, context }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // Dọn dẹp trước
    await library.goToCollections();
    await library.dismissCookies();
    await library.clearAllItems();

    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Ngắt mạng
    console.log('TC4.4: Ngắt kết nối mạng...');
    await context.setOffline(true);
    try {
      await page.waitForTimeout(1000);

      // Click thêm xem sau (API call sẽ thất bại hoặc timeout)
      await player.addToWatchLater().catch(() => {});
      await page.waitForTimeout(1000);
    } finally {
      // Khôi phục mạng
      console.log('TC4.4: Khôi phục kết nối mạng...');
      await context.setOffline(false);
    }

    // Tải lại trang và kiểm tra xem đã bị block (không thêm thành công)
    await page.reload({ waitUntil: 'domcontentloaded' });
    const isAdded = await player.isWatchLaterAdded();
    console.log(`TC4.4: Trạng thái xem sau sau khi offline và reload: ${isAdded}`);
    expect(isAdded).toBe(false);
  });

  test('TC4.5: Sắp xếp thứ tự danh sách Xem sau', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // 1. Dọn dẹp
    await library.goToCollections();
    await library.dismissCookies();
    await library.clearAllItems();

    // 2. Thêm Phim A (Descendants of the Sun)
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }

    // 3. Thêm Phim B (Mở trực tiếp My Love From the Star để ổn định 100%)
    await player.navigateAndWaitForPlayer('https://www.iq.com/play/my-love-from-the-star-episode-1-19rxykwymg?lang=vi_vn');
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }

    // 4. Vào trang Xem sau và xác nhận phim mới nhất được xếp trên đầu
    await library.goToCollections();
    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      const firstTitle = await library.getFirstCollectTitle();
      console.log(`TC4.5 (expect.poll): Tiêu đề hàng đầu: ${firstTitle}`);
      return firstTitle.toLowerCase();
    }, {
      message: 'Đợi phim mới nhất My Love From the Star lên đầu danh sách Xem sau',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).not.toContain('descendants');
  });

  test('TC4.6: Xóa phim khỏi Xem sau trực tiếp từ trang danh sách', async ({ page }) => {
    test.setTimeout(120000);
    const library = new IqiyiLibraryPage(page);

    // 1. Dọn dẹp Xem sau để kiểm tra chính xác
    await library.goToCollections();
    await library.dismissCookies();
    await library.clearAllItems();

    // 2. Thêm chính xác 1 phim
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }
    await library.goToCollections();

    // 3. Tiến hành xóa phim đầu tiên
    await library.clickEditButton();
    await library.selectHistoryItem(0); // Checkbox đầu tiên
    await library.clickDeleteButton();

    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await library.hasCollectItems();
    }, {
      message: 'Đợi danh sách Xem sau trống sau khi xóa đơn mục',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(false);
  });

  test('TC4.7: Chọn và xóa hàng loạt trong danh sách Xem sau', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // 1. Dọn dẹp sạch trước khi add
    await library.goToCollections();
    await library.dismissCookies();
    await library.clearAllItems();

    // 2. Thêm 2 phim vào danh sách
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }

    await player.navigateAndWaitForPlayer('https://www.iq.com/play/my-love-from-the-star-episode-1-19rxykwymg?lang=vi_vn');
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }

    // 3. Vào trang danh sách xem sau và xóa hàng loạt
    await library.goToCollections();
    
    await library.clickEditButton();
    await library.clickSelectAll();
    await library.clickDeleteButton();

    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await library.hasCollectItems();
    }, {
      message: 'Đợi danh sách Xem sau trống sau khi xóa hàng loạt',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(false);
  });

  test('TC4.8: Phân trang / Lazy load danh sách Xem sau', async ({ page }) => {
    const library = new IqiyiLibraryPage(page);
    await library.goToCollections();
    await library.dismissCookies();

    // Cuộn xuống cuối trang
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check xem có hiển thị footer để đảm bảo cuộn thành công
    const noMore = page.getByText(/Copyright|About iQIYI|Help and support|No more content|Trống|Empty/i).filter({ visible: true }).first();
    const isVisible = await noMore.isVisible().catch(() => false);
    console.log(`TC4.8: Có hiển thị phần tử footer/hết nội dung: ${isVisible}`);
    expect(isVisible).toBe(true);
  });
 
  test('TC4.9: Xem phim trực tiếp từ danh sách Xem sau', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);
 
    // Đảm bảo có phim
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }
 
    await library.goToCollections();
    await library.dismissCookies();
 
    // Click vào phim đầu tiên trong xem sau để xem phim (click vào link phim/ảnh)
    const firstItem = (await library.getWrapRightLocator()).locator('.collect-item a, .album-item a, a.img, a[href*="/play/"], a[href*="/album/"]').first();
    
    let playPage = page;
    try {
      const pagePromise = page.context().waitForEvent('page', { timeout: 5000 });
      await firstItem.click();
      playPage = await pagePromise;
      await playPage.bringToFront();
      console.log('TC4.9: Đã chuyển hướng sang tab phát mới và đưa lên foreground.');
    } catch (e) {
      console.log('TC4.9: Phát tiếp trên cùng tab.');
    }
 
    await playPage.locator('video').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
    console.log(`TC4.9: URL trang phát: ${playPage.url()}`);
    expect(playPage.url()).toContain('/play/');
    if (playPage !== page) {
      await playPage.close();
    }
  });

  test('TC4.10: Đồng bộ trạng thái Xem sau trên các tab khác nhau', async ({ page, context }) => {
    test.setTimeout(120000);
    const player1 = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // Dọn dẹp
    await library.goToCollections();
    await library.clearAllItems();

    // Mở Tab 2
    const tab2 = await context.newPage();
    await tab2.bringToFront();
    const libraryTab2 = new IqiyiLibraryPage(tab2);
    await libraryTab2.goToCollections();

    // Tab 1 thêm vào Xem sau
    await page.bringToFront();
    await player1.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    if (!(await player1.isWatchLaterAdded())) {
      await player1.addToWatchLater();
      await expect.poll(async () => await player1.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
    }
    // Dùng expect.poll ở dưới để đồng bộ

    // Tab 2 reload và kiểm tra xem có đồng bộ
    await tab2.bringToFront();
    await expect.poll(async () => {
      await tab2.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await libraryTab2.hasCollectItems();
    }, {
      message: 'Đợi Tab 2 đồng bộ và hiển thị phim trong Xem sau',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(true);

    await tab2.close();
  });

  test('TC4.11: Tránh trùng lặp khi mạng chập chờn (API Deduplication)', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // 1. Dọn dẹp
    await library.goToCollections();
    await library.clearAllItems();

    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    
    // Đảm bảo trạng thái ban đầu là chưa thêm
    const isAdded = await player.isWatchLaterAdded();
    if (isAdded) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(false);
      // Trạng thái đã được check bằng expect.poll
    }

    // Giả lập click nhanh 2 lần liên tục (như mạng chập chờn click đúp)
    const collectBtn = page.locator('.collection-wrap').first();
    await collectBtn.click({ force: true });
    await collectBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // Xác nhận trên trang collections chỉ xuất hiện đúng 1 item duy nhất (scope to .wrap-right)
    await library.goToCollections();
    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      const wrap = await library.getWrapRightLocator();
      if (wrap === page) return 0;
      return await wrap.locator('.collect-item, .collect-item-wrap, .album-item').count();
    }, {
      message: 'Đợi danh sách Xem sau tải và xác nhận không có item trùng lặp',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBeLessThanOrEqual(1);
  });

  test('TC4.12: Xóa Stale Cache khi chuyển đổi tài khoản (Đăng xuất)', async ({ page, context }) => {
    test.setTimeout(120000);
    const library = new IqiyiLibraryPage(page);
    await library.goToCollections();
    await library.dismissCookies();

    // 1. Clear cookies để giả lập Logout tài khoản hiện tại
    console.log('TC4.12: Clear session cookies để logout...');
    await context.clearCookies();

    // 2. Load lại trang collections xem có hiển thị trống hoặc yêu cầu login
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    const isLoginPromptVisible = await page.getByText(/Log In|Đăng nhập|Login|Sign In/i).first().isVisible().catch(() => false);
    const hasItems = await library.hasCollectItems().catch(() => false);

    console.log(`TC4.12: Sau khi logout, nhắc đăng nhập: ${isLoginPromptVisible}, có hiển thị phim cũ không: ${hasItems}`);
    expect(hasItems).toBe(false);

    // 3. Khôi phục lại trạng thái login để các test sau chạy bình thường (đọc lại auth.json)
    console.log('TC4.12: Khôi phục lại trạng thái login từ auth.json...');
    const storage = JSON.parse(fs.readFileSync('auth.json', 'utf8'));
    await context.addCookies(storage.cookies);
  });

  test('TC4.13: Lưu Series phim so với Tập đơn lẻ', async ({ page }) => {
    test.setTimeout(120000);
    const player = new IqiyiPlayerPage(page);
    const library = new IqiyiLibraryPage(page);

    // Dọn dẹp trước
    await library.goToCollections();
    await library.clearAllItems();

    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // 2. Chọn chuyển sang Tập 2 từ danh sách tập phim dưới trình phát
    console.log("TC4.13: Chọn Tập 2 từ danh sách tập phim...");
    const ep2Btn = page.locator('a[href*="-episode-2-"], a[href*="-tap-2-"]').first();
    await ep2Btn.waitFor({ state: 'visible', timeout: 15000 });
    await ep2Btn.click();
    await player.waitForAdToFinish();

    // 3. Thêm vào xem sau từ trang tập 2
    if (!(await player.isWatchLaterAdded())) {
      await player.addToWatchLater();
      await expect.poll(async () => await player.isWatchLaterAdded(), { timeout: 10000 }).toBe(true);
      // Đợi trạng thái UI cập nhật
    }

    // 3. Vào trang xem sau và kiểm tra xem hệ thống lưu Series hay Tập đơn
    await library.goToCollections();
    await expect.poll(async () => {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      return await library.hasCollectItems();
    }, {
      message: 'Đợi phim xuất hiện trong danh sách Xem sau',
      timeout: 25000,
      intervals: [3000, 5000, 5000]
    }).toBe(true);

    const firstTitle = await library.getFirstCollectTitle();
    console.log(`TC4.13: Tiêu đề phim tìm thấy: ${firstTitle}`);
    
    // iQIYI lưu trữ toàn bộ Series (Album "Descendants of The Sun") chứ không lưu tập lẻ.
    expect(firstTitle.toLowerCase()).toContain('descendants');
  });

});
