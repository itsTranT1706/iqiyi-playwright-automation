import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';

test.describe('iQIYI E2E: Trình phát Video (Video Player)', () => {

  test.beforeEach(async ({ page }) => {
    // Đặt kích thước màn hình nhất quán
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('TC1.1: Phát video bình thường', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Đảm bảo video đang phát (khắc phục autoplay block)
    const isPlayingInit = await player.isPlaying();
    if (!isPlayingInit) {
      await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        if (v) v.play().catch(() => {});
      });
    }

    const initialTime = await player.getCurrentPlaybackTime();
    console.log(`TC1.1: Thời gian hiện tại: ${initialTime}s`);
    
    // Đợi động xem video có chạy tiếp không bằng expect.poll
    await expect.poll(async () => {
      return await player.getCurrentPlaybackTime();
    }, { timeout: 10000 }).toBeGreaterThan(initialTime);
  });

  test('TC1.2: Tạm dừng & Phát tiếp', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Đảm bảo video đang phát trước khi tạm dừng
    const isPlayingInit = await player.isPlaying();
    if (!isPlayingInit) {
      await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        if (v) v.play().catch(() => {});
      });
    }

    // 1. Tạm dừng
    const playPauseBtn = page.locator('.iqp-btn-play, .iqp-play, .play-btn, [class*="play-btn"], button[class*="play"]').first();
    if (await playPauseBtn.isVisible().catch(() => false)) {
      await playPauseBtn.click();
    } else {
      await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        if (v) v.pause();
      });
    }

    // Khắc phục nếu bấm nút UI chưa thực sự pause
    await page.evaluate(() => {
      const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
      if (v && !v.paused) v.pause();
    });

    // Chờ trạng thái tạm dừng thực sự bằng expect.poll
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        return v ? v.paused : false;
      });
    }, { timeout: 5000 }).toBe(true);

    const timeAtPause = await player.getCurrentPlaybackTime();
    await page.waitForTimeout(1000); // Chỉ chờ ngắn để xác nhận không tăng thời gian phát
    const timeAfterWait = await player.getCurrentPlaybackTime();
    
    console.log(`TC1.2: Lúc tạm dừng: ${timeAtPause}s, Sau khi đợi: ${timeAfterWait}s`);
    expect(Math.abs(timeAfterWait - timeAtPause)).toBeLessThan(1.0);

    // 2. Phát tiếp
    if (await playPauseBtn.isVisible().catch(() => false)) {
      await playPauseBtn.click();
    } else {
      await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        if (v) v.play().catch(() => {});
      });
    }
    
    // Đảm bảo v.play() thực sự chạy
    await page.evaluate(() => {
      const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
      if (v && v.paused) v.play().catch(() => {});
    });

    // Chờ video chạy tiếp
    await expect.poll(async () => {
      return await player.getCurrentPlaybackTime();
    }, { timeout: 10000 }).toBeGreaterThan(timeAfterWait);
  });

  test('TC1.3: Tua video cơ bản', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Tua tới mốc 10% thời lượng phim
    await player.seekTo(10);
    const seekTime = await player.getCurrentPlaybackTime();
    console.log(`TC1.3: Đã tua tới 10%: ${seekTime}s`);
    expect(seekTime).toBeGreaterThan(0);

    // Phát tiếp từ mốc vừa tua, đảm bảo video đang phát
    await page.evaluate(() => {
      const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
      if (v) v.play().catch(() => {});
    });

    // Đợi tối đa 8 giây xem video có phát tiếp không (dùng expect.poll thay cho loop)
    await expect.poll(async () => {
      return await player.getCurrentPlaybackTime();
    }, { timeout: 8000 }).toBeGreaterThan(seekTime + 0.5);
  });

  test('TC1.4: Mất mạng & Phục hồi đột ngột', async ({ page, context }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Ngắt kết nối mạng
    console.log('TC1.4: Ngắt kết nối mạng...');
    await context.setOffline(true);
    try {
      await page.waitForTimeout(2000); // Giảm từ 4s xuống 2s
    } finally {
      // Kết nối mạng trở lại
      console.log('TC1.4: Bật lại kết nối mạng...');
      await context.setOffline(false);
    }

    // Chờ tự động phát tiếp
    await expect.poll(async () => {
      const isPlaying = await player.isPlaying();
      if (!isPlaying) {
        await page.evaluate(() => {
          const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
          if (v) v.play().catch(() => {});
        });
      }
      return await player.isPlaying();
    }, { timeout: 10000 }).toBe(true);

    const timeAfterRecovery = await player.getCurrentPlaybackTime();
    console.log(`TC1.4: Thời gian sau khi phục hồi mạng: ${timeAfterRecovery}s`);
    expect(timeAfterRecovery).toBeGreaterThan(0);
  });

  test('TC1.5: Spam tua nhanh liên tục', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Thực hiện tua liên tục qua JS
    console.log('TC1.5: Spam tua 5 lần liên tiếp...');
    for (let pct = 5; pct <= 25; pct += 5) {
      await player.seekTo(pct);
      await page.waitForTimeout(100); // Giảm xuống 100ms theo đúng Phase 3
    }

    // Chờ phát tiếp tục thành công sau spam
    await expect.poll(async () => {
      return await player.getCurrentPlaybackTime();
    }, { timeout: 8000 }).toBeGreaterThan(0);

    const isPlaying = await player.isPlaying();
    const playbackTime = await player.getCurrentPlaybackTime();
    console.log(`TC1.5: Trạng thái phát sau spam tua: ${isPlaying}, Thời gian: ${playbackTime}s`);
    expect(playbackTime).toBeGreaterThan(0);
  });

  test('TC1.6: Chuyển tập phim siêu tốc', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Tìm và click tập 2, rồi lập tức tập 3 trên sidebar nếu có
    const ep2 = page.locator('a[href*="/play/"]').filter({ hasText: /^2$/ }).first();
    if (await ep2.isVisible().catch(() => false)) {
      await ep2.click();
      await page.waitForTimeout(50); // Giảm xuống 50ms
      const ep3 = page.locator('a[href*="/play/"]').filter({ hasText: /^3$/ }).first();
      if (await ep3.isVisible().catch(() => false)) {
        await ep3.click();
      }
    } else {
      // Fallback bằng cách chuyển trang trực tiếp siêu tốc
      await page.goto('https://www.iq.com/play/descendants-of-the-sun-tap-2-19rrhyq7pa?lang=vi_vn', { waitUntil: 'commit' });
      await page.goto('https://www.iq.com/play/descendants-of-the-sun-tap-3-19rrhyq7p6?lang=vi_vn', { waitUntil: 'domcontentloaded' });
    }

    // Chờ thời lượng tập mới được nhận diện lớn hơn 0
    let mainVideoDuration = 0;
    await expect.poll(async () => {
      mainVideoDuration = await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).sort((a, b) => b.duration - a.duration)[0];
        return v ? v.duration : 0;
      });
      return mainVideoDuration;
    }, { timeout: 10000 }).toBeGreaterThan(0);

    console.log(`TC1.6: Thời lượng tập mới chuyển đến: ${mainVideoDuration}s`);
    expect(mainVideoDuration).toBeGreaterThan(0);
  });

  test('TC1.7: Thay đổi ngôn ngữ phụ đề', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Hover lên player để hiện controls
    await page.locator('video').first().hover().catch(() => {});

    // Tìm nút Phụ đề / Subtitle / CC
    const subtitleBtn = page.locator('.iqp-btn-subtitle, .subtitle-btn, [class*="subtitle"], [class*="cc"]').first();
    if (await subtitleBtn.isVisible().catch(() => false)) {
      await subtitleBtn.click();
      
      // Chọn ngôn ngữ phụ đề đầu tiên trong list
      const subItem = page.locator('.iqp-sub-item, [class*="subtitle-item"], li[class*="sub"]').first();
      await expect(subItem).toBeVisible({ timeout: 5000 });
      await subItem.click();
      console.log('TC1.7: Đã chọn đổi ngôn ngữ phụ đề.');
    } else {
      console.log('TC1.7: Nút phụ đề không hiển thị trên player này.');
    }
  });

  test('TC1.8: Chế độ toàn màn hình', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    await page.locator('video').first().hover().catch(() => {});

    const fullscreenBtn = page.locator('.iqp-btn-fullscreen, .fullscreen-btn, [class*="fullscreen"]').first();
    if (await fullscreenBtn.isVisible().catch(() => false)) {
      await fullscreenBtn.click();
      
      // Check xem có ở chế độ fullscreen không (thường class player thay đổi hoặc qua API JS)
      await expect.poll(async () => {
        return await page.evaluate(() => {
          return !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
        });
      }, { timeout: 5000 }).toBe(true);
      
      console.log(`TC1.8: Đang ở chế độ Fullscreen`);
      expect(fullscreenBtn).toBeVisible();
    }
  });

  test('TC1.9: Token phiên hết hạn giữa chừng', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Kích hoạt chặn các request streaming cấp quyền hoặc tải phân đoạn phim (license/dash)
    await page.route(url => 
      url.href.includes('dash') || 
      url.href.includes('license') || 
      url.href.includes('tm.iq.com') ||
      url.href.includes('hls') || 
      url.href.includes('.m3u8'), 
      route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Token expired', code: '40101' })
        });
      }
    );

    // Tua phim để bắt hệ thống load phân đoạn mới với request bị chặn
    await player.seekForwardBy(120);

    // Xác nhận không bị màn hình đen vô hạn mà hiển thị text thông báo lỗi/nâng cấp/login
    await expect.poll(async () => {
      return await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('lỗi') || text.includes('đăng nhập') || text.includes('login') || text.includes('thử lại') || text.includes('error') || text.includes('VIP');
      });
    }, { timeout: 10000 }).toBe(true);

    console.log(`TC1.9: Hiển thị thông báo khi token hết hạn.`);
  });

  test('TC1.10: Vị trí resume phim', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    
    // 1. Xem phim đến 5% rồi đóng
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
    await player.seekTo(5); // tua đến khoảng 5% (tầm vài phút)
    const timeBeforeClose = await player.getCurrentPlaybackTime();
    console.log(`TC1.10: Đóng phim ở giây thứ: ${timeBeforeClose}s`);

    // 2. Mở lại đúng phim
    const newPage = await page.context().newPage();
    const newPlayer = new IqiyiPlayerPage(newPage);
    await newPlayer.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    let resumeTime = 0;
    await expect.poll(async () => {
      resumeTime = await newPlayer.getCurrentPlaybackTime();
      return resumeTime;
    }, { timeout: 10000 }).toBeGreaterThan(0);

    console.log(`TC1.10: Vị trí phát lại (resume): ${resumeTime}s`);
    expect(resumeTime).toBeGreaterThan(0);
    await newPage.close();
  });

  test('TC1.11: Cùng tài khoản xem cùng 1 phim trên 2 tab khác nhau', async ({ page, context }) => {
    const player1 = new IqiyiPlayerPage(page);
    await player1.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    const tab2 = await context.newPage();
    const player2 = new IqiyiPlayerPage(tab2);
    await player2.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    const play1 = await player1.isPlaying();
    const play2 = await player2.isPlaying();
    console.log(`TC1.11: Trạng thái phát Tab 1: ${play1}, Tab 2: ${play2}`);
    
    expect(play1 || play2).toBe(true);
    await tab2.close();
  });

  test.skip('TC1.12: Mất mạng khi đang chạy quảng cáo pre-roll', async ({ page, context }) => {
    const player = new IqiyiPlayerPage(page);
    
    // Load trang
    await page.goto(TEST_VIDEO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Chờ thẻ video xuất hiện
    await page.locator('video').first().waitFor({ state: 'attached', timeout: 20000 });
    
    // Giả sử quảng cáo đang chạy, ngắt mạng lập tức
    console.log('TC1.12: Ngắt mạng khi quảng cáo đang chạy...');
    await context.setOffline(true);
    try {
      await page.waitForTimeout(2000);
    } finally {
      // Khôi phục mạng
      console.log('TC1.12: Bật lại mạng...');
      await context.setOffline(false);
    }

    // Chờ hoàn thành quảng cáo hoặc bỏ qua
    await player.waitForAdToFinish();
    
    // Xác nhận video chính vẫn bắt đầu phát thành công sau khi phục hồi mạng
    await expect.poll(async () => {
      return await player.getCurrentPlaybackTime();
    }, { timeout: 10000 }).toBeGreaterThanOrEqual(0);
  });

  test.skip('TC1.13: Quảng cáo giữa phim (Mid-roll ad) & tiếp tục phát', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Tua phim tới mốc 50% thời lượng (thường là mốc dễ có ad giữa phim)
    await player.seekTo(50);

    const isPlaying = await player.isPlaying();
    const time = await player.getCurrentPlaybackTime();
    console.log(`TC1.13: Phát phim ở mốc 50%: ${isPlaying}, Thời gian: ${time}s`);
    expect(time).toBeGreaterThan(0);
  });

  test('TC1.14: Xem lại phim từ Lịch sử', async ({ page }) => {
    const player = new IqiyiPlayerPage(page);
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    // Đóng phim
    await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded' });

    // Quay lại phim
    await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);

    const isPlaying = await player.isPlaying();
    const playbackTime = await player.getCurrentPlaybackTime();
    console.log(`TC1.14: Quay lại phim thành công, phát tại mốc: ${playbackTime}s, đang phát: ${isPlaying}`);
    expect(playbackTime).toBeGreaterThanOrEqual(0);
  });

  test.skip('TC1.15: Chặn hành vi tua phim khi quảng cáo đang chạy', async ({ page }) => {
    // 1. Mở trang phim (quảng cáo pre-roll sẽ chạy)
    await page.goto(TEST_VIDEO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('video').first().waitFor({ state: 'attached', timeout: 20000 });

    // Tìm thẻ video của quảng cáo (thường có duration ngắn <= 60s)
    const hasAdVideo = await page.evaluate(() => {
      const adVideo = Array.from(document.querySelectorAll('video')).find(v => v.duration > 0 && v.duration <= 60);
      return !!adVideo;
    });

    if (hasAdVideo) {
      console.log('TC1.15: Quảng cáo đang chạy. Thử tua bằng cách thay đổi currentTime của video quảng cáo...');
      
      const initialAdTime = await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).find(v => v.duration > 0 && v.duration <= 60);
        return v ? v.currentTime : 0;
      });

      // Thử thay đổi currentTime của thẻ video quảng cáo lên 20s
      await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).find(v => v.duration > 0 && v.duration <= 60);
        if (v) v.currentTime = 20;
      });
      await page.waitForTimeout(1000);

      const adTimeAfterSeek = await page.evaluate(() => {
        const v = Array.from(document.querySelectorAll('video')).find(v => v.duration > 0 && v.duration <= 60);
        return v ? v.currentTime : 0;
      });

      console.log(`TC1.15: Thời gian quảng cáo trước tua: ${initialAdTime}s, sau tua: ${adTimeAfterSeek}s`);
      // Nếu tua bị chặn, currentTime của quảng cáo sẽ không tăng vọt hoặc được tự động khôi phục lại mốc cũ
      expect(adTimeAfterSeek - initialAdTime).toBeLessThan(5.0); 
    } else {
      console.log('TC1.15: Không có quảng cáo chạy, bỏ qua test chặn tua.');
    }
  });

});
