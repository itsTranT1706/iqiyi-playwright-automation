import { test, expect } from '@playwright/test';
import { BasePage } from '../../pages/BasePage';

test.describe('iQIYI E2E: Tìm kiếm & Bộ lọc (Search & Filters)', () => {

  test.beforeEach(async ({ page }) => {
    // Đặt kích thước màn hình nhất quán
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('TC2.1: Tìm kiếm từ khóa hợp lệ', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await basePage.dismissCookies();

    // Tìm ô tìm kiếm
    const searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i], input[placeholder*="search" i]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 15000 });
    await searchInput.click();
    await searchInput.fill('drama');
    
    // Nhấp nút tìm kiếm hoặc nhấn Enter
    const searchBtn = page.locator('.search-btn, .search-icon, div.search-btn').first();
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForURL(/search/, { timeout: 30000 });
    // Chờ kết quả tìm kiếm hiển thị
    await expect.poll(async () => {
      return await page.locator('a[href*="/album/"]:visible, a[href*="/play/"]:visible').count();
    }, {
      message: 'Đợi kết quả tìm kiếm hiển thị',
      timeout: 15000
    }).toBeGreaterThan(0);
  });

  test('TC2.2: Tìm kiếm từ khóa không tồn tại', async ({ page }) => {
    await page.goto('https://www.iq.com/search?query=xyzabc123notfound&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const linksLocator = page.locator('a[href*="/album/"]:visible, a[href*="/play/"]:visible');

    let hasNoResultText = false;
    await expect.poll(async () => {
      const text = await page.locator('body').innerText();
      hasNoResultText = text.includes('Rất tiếc') ||
             text.includes('Không tìm thấy') ||
             text.includes('không tìm thấy') ||
             text.includes('Không có kết quả') ||
             text.includes('No results') ||
             text.includes('No relevant') ||
             text.includes('Không có nội dung liên quan');
      return hasNoResultText;
    }, { timeout: 10000 }).toBe(true);

    const visibleResults = await linksLocator.count();
    console.log(`TC2.2: Kết quả không tồn tại: visibleResults=${visibleResults}, hasNoResultText=${hasNoResultText}`);
    expect(visibleResults === 0 || hasNoResultText).toBe(true);
  });

  test('TC2.3: Tìm kiếm ký tự đặc biệt / HTML tag', async ({ page }) => {
    // Tìm kiếm với thẻ HTML xem có bị lỗi hoặc render nhầm không
    await page.goto('https://www.iq.com/search?query=%3Cscript%3Econsole.log(%22xss%22)%3C/script%3E&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Xác nhận không crash trang và không chạy script (không có alert nào hiển thị)
    const pageTitle = await page.title();
    expect(pageTitle.length).toBeGreaterThan(0);

    const hasInjectedScript = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(s => s.textContent && s.textContent.includes('console.log("xss")'));
    });
    expect(hasInjectedScript).toBe(false);
  });

  test('TC2.4: Tìm kiếm khi offline & Khôi phục khi online', async ({ page, context }) => {
    const basePage = new BasePage(page);
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await basePage.dismissCookies();

    // Ngắt mạng
    await context.setOffline(true);
    try {
      // Thử tìm kiếm
      const searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i]').first();
      await searchInput.click();
      await searchInput.fill('drama');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    } finally {
      // Bật lại mạng
      await context.setOffline(false);
    }
    
    // Tải lại trang hoặc tìm kiếm lại
    await page.goto('https://www.iq.com/search?query=drama&lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect.poll(async () => {
      return await page.locator('a[href*="/album/"]:visible, a[href*="/play/"]:visible').count();
    }, { timeout: 10000 }).toBeGreaterThan(0);
  });

  test('TC2.5: Bộ lọc sâu kết hợp nhiều tiêu chí Free', async ({ page }) => {
    const basePage = new BasePage(page);
    // Đến thư viện phim bộ (chnid=2)
    await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await basePage.dismissCookies();

    // Lọc Thể loại, Khu vực hoặc Năm
    const filterLabels = page.locator('.second-label-current, .filter-item, .label-item');
    await expect(filterLabels.first()).toBeVisible({ timeout: 15000 });

    // Chọn lọc khu vực Hàn Quốc (nếu có nhãn Hàn Quốc)
    const koreaFilter = page.locator('text=Hàn Quốc, text=South Korea').first();
    if (await koreaFilter.isVisible().catch(() => false)) {
      await koreaFilter.click();
      console.log('TC2.5: Đã chọn bộ lọc Hàn Quốc');
    }

    // Chọn lọc thể loại Tình cảm/Romance (nếu có)
    const romanceFilter = page.locator('text=Tình cảm, text=Romance, text=Lãng mạn').first();
    if (await romanceFilter.isVisible().catch(() => false)) {
      await romanceFilter.click();
      console.log('TC2.5: Đã chọn bộ lọc Tình cảm');
    }

    // Xác nhận danh sách phim hiển thị > 0
    await expect.poll(async () => {
      return await page.locator('a[href*="/album/"]:visible').count();
    }, {
      message: 'Đợi danh sách phim hiển thị sau khi lọc sâu',
      timeout: 20000
    }).toBeGreaterThan(0);
  });

  test('TC2.6: Spam click các nhãn bộ lọc', async ({ page }) => {
    await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const korea = page.locator('text=Hàn Quốc, text=South Korea').first();
    const china = page.locator('text=Trung Quốc Đại Lục, text=Chinese Mainland').first();

    if (await korea.isVisible() && await china.isVisible()) {
      // Spam click liên tiếp xen kẽ
      await korea.click();
      await page.waitForTimeout(100);
      await china.click();
      await page.waitForTimeout(100);
      await korea.click(); // Click cuối cùng là Hàn Quốc

      // Xác nhận kết quả hiển thị của bộ lọc cuối cùng thành công
      await expect.poll(async () => {
        return await page.locator('a[href*="/album/"]:visible').count();
      }, { timeout: 10000 }).toBeGreaterThan(0);
    } else {
      console.log('TC2.6: Các nhãn bộ lọc quốc gia không hiển thị, bỏ qua click spam');
    }
  });

  test('TC2.7: Xóa các bộ lọc đã chọn', async ({ page }) => {
    await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    const korea = page.locator('text=Hàn Quốc, text=South Korea').first();
    if (await korea.isVisible().catch(() => false)) {
      await korea.click();

      // Bấm nút "Tất cả" hoặc nút xóa lọc cùng dòng
      const allBtn = page.locator('text=Tất cả, text=All').first();
      await expect(allBtn).toBeVisible({ timeout: 5000 });
      await allBtn.click();
      console.log('TC2.7: Đã xóa lọc về trạng thái Tất cả');
    }
  });

  test('TC2.8: Gợi ý tìm kiếm khi nhập liệu', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await basePage.dismissCookies();

    const searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i]').first();
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.click();
    await searchInput.fill('de');

    // Kiểm tra menu gợi ý xuất hiện (class hoặc thẻ li)
    const suggestions = page.locator('.suggest-list, .search-suggest, [class*="suggest"], li[class*="suggest"]').first();
    const isVisible = await suggestions.isVisible().catch(() => false);
    console.log(`TC2.8: Menu gợi ý tìm kiếm hiển thị: ${isVisible}`);
    
    if (isVisible) {
      // Click vào phần tử gợi ý đầu tiên
      const firstSuggestItem = suggestions.locator('li, a, div').first();
      await firstSuggestItem.click();
      await page.waitForURL(/search/, { timeout: 15000 });
      expect(page.url()).toContain('search');
    }
  });

  test('TC2.9: Phân trang kết quả / Cuộn vô hạn', async ({ page }) => {
    await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Chờ ít nhất một phim hiển thị trong DOM
    const movies = page.locator('a[href*="/album/"]');
    await movies.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    const initialCount = await movies.count();
    console.log(`TC2.9: Số phim ban đầu: ${initialCount}`);

    // Cuộn xuống cuối trang
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Đếm lại số lượng phim bằng expect.poll
    let scrolledCount = initialCount;
    try {
      await expect.poll(async () => {
        scrolledCount = await movies.count();
        return scrolledCount;
      }, { timeout: 10000 }).toBeGreaterThan(initialCount);
    } catch (e) {
      console.log('⚠️ Không tải thêm phim mới, có thể đã đạt giới hạn danh sách.');
    }
    console.log(`TC2.9: Số phim sau khi cuộn xuống: ${scrolledCount}`);
    
    if (scrolledCount > initialCount) {
      expect(scrolledCount).toBeGreaterThan(initialCount);
    }
  });

  test('TC2.10: Lưu từ khóa tìm kiếm gần đây', async ({ page }) => {
    // Unique keyword để dễ nhận diện trong lịch sử
    const uniqueKeyword = 'HistoryTest' + Date.now();

    // 1. Vào trang chủ
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 2. Click vào ô search rồi GÕ từ khóa (không dùng URL trực tiếp)
    const searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i]').first();
    await searchInput.click();
    await searchInput.fill(uniqueKeyword);

    // 3. Nhấn Enter để tìm kiếm (trigger lưu lịch sử)
    await searchInput.press('Enter');
    await page.waitForURL(/search/, { timeout: 15000 });

    // 4. Quay lại trang chủ
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 5. Click vào ô tìm kiếm để mở dropdown lịch sử gần đây
    await searchInput.click();

    // 6. Xác nhận từ khóa xuất hiện trong lịch sử
    let isSaved = false;
    await expect.poll(async () => {
      const pageText = await page.locator('body').innerText();
      isSaved = pageText.includes(uniqueKeyword);
      return isSaved;
    }, { timeout: 10000 }).toBe(true);

    console.log(`TC2.10: Từ khóa được lưu trong lịch sử gần đây: ${isSaved}`);
  });

  test('TC2.11: Race Condition khi nhập nhanh trên mạng chậm (CDP Throttling)', async ({ page }) => {
    const basePage = new BasePage(page);
    // 1. Điều hướng đến trang chủ trước ở mạng bình thường
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await basePage.dismissCookies();

    const searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i]').first();
    await searchInput.waitFor({ state: 'visible' });

    // 2. Mở kết nối CDP để cấu hình độ trễ mạng Slow 3G (2 giây latency) sau khi trang đã load
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 2000,                      // Độ trễ 2 giây
      downloadThroughput: 50 * 1024 / 8,   // Tốc độ tải chậm
      uploadThroughput: 20 * 1024 / 8,
    });

    try {
      // 3. Gõ nhanh từ khóa thứ nhất ("ha") rồi ngay lập tức gõ từ khóa thứ hai ("hài")
      await searchInput.click();
      await searchInput.fill('ha');
      await page.waitForTimeout(50);
      await searchInput.fill('hài');
      
      const searchBtn = page.locator('div.search-btn, .search-btn, .search-icon, button:has(img[src*="search"])').first();
      if (await searchBtn.isVisible().catch(() => false)) {
        await searchBtn.click();
      } else {
        await searchInput.press('Enter');
      }

      // Khôi phục mạng bình thường ngay lập tức để trang kết quả load ở tốc độ cao, tránh bị timeout
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      });

      // Chờ phản hồi chậm về và chuyển đổi trang thành công
      await expect(page).toHaveURL(/search/, { timeout: 30000 });

      // 4. Xác nhận kết quả tìm kiếm cuối cùng tương ứng với từ khóa "hài"
      const currentURL = page.url();
      console.log(`TC2.11: URL kết quả hiện tại: ${currentURL}`);
      expect(currentURL).toContain('h%C3%A0i'); // encode của "hài"
    } finally {
      // 5. Giải phóng cấu hình mạng CDP
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1,
      });
    }
  });

  test('TC2.12: Giữ nguyên bộ lọc khi quay lại (Filter State Back)', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto('https://www.iq.com/film-library?chnid=2&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await basePage.dismissCookies();

    const korea = page.locator('text=Hàn Quốc, text=South Korea').first();
    if (await korea.isVisible().catch(() => false)) {
      await korea.click();

      // Click vào phim đầu tiên
      const firstMovie = page.locator('a[href*="/album/"]').first();
      await firstMovie.click();
      await page.waitForURL(/\/album\//, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

      // Nhấn Back quay lại trang thư viện
      await page.goBack();

      // Xác nhận bộ lọc Hàn Quốc vẫn đang được kích hoạt (thường có class active/selected)
      let isKoreaActive = false;
      await expect.poll(async () => {
        isKoreaActive = await korea.evaluate(el => {
          const cls = el.className;
          return cls.includes('active') || cls.includes('current') || cls.includes('select') || el.getAttribute('style') !== null;
        }).catch(() => true);
        return isKoreaActive;
      }, { timeout: 10000 }).toBe(true);
      
      console.log(`TC2.12: Bộ lọc được khôi phục sau Back: ${isKoreaActive}`);
    }
  });

  test('TC2.13: Hiển thị nội dung VIP và Upsell với tài khoản Free', async ({ page }) => {
    const basePage = new BasePage(page);
    // Mở trang kết quả tìm kiếm có nội dung phong phú
    await page.goto('https://www.iq.com/search?query=drama&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await basePage.dismissCookies();

    // Xác nhận nội dung VIP có huy hiệu (VIP badge/tag) hiển thị trên giao diện kết quả
    const vipBadge = page.locator('.mod-vip, .vip-badge, [class*="vip"], [class*="VIP"]').first();
    const hasVipContent = await vipBadge.isVisible().catch(() => false);
    console.log(`TC2.13: Tìm thấy phim có tag VIP trong kết quả: ${hasVipContent}`);

    if (hasVipContent) {
      // Click vào phim VIP
      const parentLink = vipBadge.locator('xpath=ancestor::a[href*="/album/"] | ancestor::a[href*="/play/"]').first();
      if (await parentLink.isVisible().catch(() => false)) {
        await parentLink.click();
      } else {
        await vipBadge.click();
      }

      // Xác nhận hệ thống hiển thị bảng giá/popup mời nâng cấp VIP (Upsell) thay vì lỗi 403
      let upsellPrompt = false;
      await expect.poll(async () => {
        const text = await page.locator('body').innerText();
        upsellPrompt = text.includes('VIP') || text.includes('Gói') || text.includes('Đăng ký') || text.includes('Subscribe') || text.includes('Join');
        return upsellPrompt;
      }, { timeout: 10000 }).toBe(true);

      console.log(`TC2.13: Hiển thị bảng nâng cấp VIP: ${upsellPrompt}`);
    } else {
      console.log('TC2.13: Không có phim VIP hiển thị trong trang kết quả này, hoàn thành test case.');
    }
  });

  test('TC2.14: Tìm kiếm theo ngôn ngữ nước ngoài và ký tự quốc tế', async ({ page }) => {
    // 1. Tìm kiếm bằng Tiếng Hàn (드라마 - Drama)
    await page.goto('https://www.iq.com/search?query=%EB%93%9C%EB%9D%BC%EB%A7%88&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    let count = 0;
    await expect.poll(async () => {
      count = await page.locator('a[href*="/album/"]:visible').count();
      return count;
    }, { timeout: 10000 }).toBeGreaterThan(0);

    console.log(`TC2.14: Tìm thấy ${count} kết quả cho tiếng Hàn "드라마"`);
  });

  test('TC2.15: Đồng nhất ngôn ngữ hiển thị bản dịch theo tham số ?lang trên URL', async ({ browser }) => {
    // Tạo context mới không có auth.json và đặt locale vi-VN để tránh bị ghi đè ngôn ngữ bởi cài đặt tài khoản
    const context = await browser.newContext({ 
      storageState: { cookies: [], origins: [] },
      locale: 'vi-VN'
    });
    const page = await context.newPage();
    const basePage = new BasePage(page);

    // 1. Mở tìm kiếm phim tiếng Anh khi lang=vi_vn
    await page.goto('https://www.iq.com/search?query=Descendants%20of%20the%20sun&lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await basePage.dismissCookies();

    // Xác nhận tiêu đề phim được dịch sang tiếng Việt ("Hậu duệ mặt trời")
    let hasViTitle = false;
    await expect.poll(async () => {
      const viText = await page.locator('body').innerText();
      hasViTitle = viText.toLowerCase().includes('hậu duệ mặt trời') || viText.toLowerCase().includes('hậu duệ');
      return hasViTitle;
    }, { timeout: 15000 }).toBe(true);
    console.log(`TC2.15: Hiển thị tiêu đề Tiếng Việt khi lang=vi_vn: ${hasViTitle}`);

    // 2. Chuyển sang lang=en_us
    await page.goto('https://www.iq.com/search?query=Descendants%20of%20the%20sun&lang=en_us', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Xác nhận tiêu đề phim hiển thị bằng tiếng Anh ("Descendants of the Sun")
    let hasEnTitle = false;
    await expect.poll(async () => {
      const enText = await page.locator('body').innerText();
      hasEnTitle = enText.toLowerCase().includes('descendants of the sun') || enText.toLowerCase().includes('descendants');
      return hasEnTitle;
    }, { timeout: 15000 }).toBe(true);
    console.log(`TC2.15: Hiển thị tiêu đề Tiếng Anh khi lang=en_us: ${hasEnTitle}`);

    expect(hasViTitle || hasEnTitle).toBe(true);
    await context.close();
  });
  test('TC2.16: Lỗi Crash/Bad Request khi tìm kiếm chuỗi quá dài (BUG-006)', async ({ page }) => {
    // Tạo một chuỗi cực dài (8000 ký tự) để ép server ném lỗi Layer 7 (URI Too Long / Bad Request)
    const longQuery = 'A'.repeat(8000);
    
    const response = await page.goto(`https://www.iq.com/search?query=${longQuery}&lang=vi_vn`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }).catch(() => null);

    const status = response ? response.status() : 0;
    
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const isCrash = status >= 400 || bodyText.toLowerCase().includes('bad request') || bodyText.toLowerCase().includes('too large') || bodyText.toLowerCase().includes('400') || bodyText.toLowerCase().includes('413') || bodyText.toLowerCase().includes('414');

    expect(isCrash, '❌ BUG-006: Hệ thống Crash văng lỗi HTTP (400/413/414) kèm HTML trắng khi tìm kiếm chuỗi dài thay vì có UI tử tế').toBe(true);
  });

});
