import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class IqiyiPlayerPage extends BasePage {
  readonly playerContainer: Locator;
  readonly collectButton: Locator;
  readonly watchLaterToast: Locator;
  readonly skipAdButton: Locator;

  constructor(page: Page) {
    super(page);
    this.playerContainer = page.locator('video').first();
    // Nút "Watch Later" nằm ngay bên dưới player (từ screenshot)
    this.collectButton = page.locator('text=Watch Later').first();
    // Toast khi thêm thành công
    this.watchLaterToast = page.locator('text=Added to Watch Later');
    // Nút skip quảng cáo
    this.skipAdButton = page.locator(
      '.skip-ad-btn, .iqp-skip-ad, [class*="skip"], text=Skip Ad, text=Bỏ qua'
    ).first();
  }

  /**
   * Chờ quảng cáo kết thúc hoặc skip nếu có thể.
   * iQIYI hiển thị quảng cáo overlay ở đầu video.
   */
  async waitForAdToFinish(maxWaitMs = 35000) {
    const startTime = Date.now();
    console.log('⏳ Đang chờ quảng cáo kết thúc...');

    while (Date.now() - startTime < maxWaitMs) {
      // Đóng popup nếu xuất hiện chặn màn hình
      const closeBtn = this.page.locator('.close-btn, div.close-btn[rseat="close"], .pop-up-container .close-btn').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click().catch(() => {});
        console.log('❌ Đã đóng popup chặn màn hình.');
        await this.page.waitForTimeout(1000);
      }

      // Thử click nút skip nếu có
      const skipVisible = await this.skipAdButton.isVisible().catch(() => false);
      if (skipVisible) {
        await this.skipAdButton.click();
        console.log('⏩ Đã skip quảng cáo!');
        await this.page.waitForTimeout(1000);
        return;
      }

      // Kiểm tra xem video chính đã bắt đầu chưa bằng JS (bọc try-catch đề phòng chuyển hướng làm hủy context)
      let isMainVideoPlaying = false;
      try {
        isMainVideoPlaying = await this.page.evaluate(() => {
          const videos = document.querySelectorAll('video');
          for (const v of videos) {
            // Video chính thường có duration > 300s (5 phút), quảng cáo ngắn hơn
            if (v.duration > 60 && v.currentTime > 0) return true;
          }
          return false;
        });
      } catch (e) {
        console.log('⏳ Hệ thống đang chuyển hướng trang, tiếp tục chờ...');
      }

      if (isMainVideoPlaying) {
        console.log('✅ Video chính đã bắt đầu phát!');
        return;
      }

      await this.page.waitForTimeout(2000);
    }
    console.log('⚠️ Hết thời gian chờ quảng cáo, tiếp tục test...');
  }

  /**
   * Mở trang phim và chờ quảng cáo xong
   */
  async navigateAndWaitForPlayer(url: string) {
    // Dùng waitUntil:'domcontentloaded' để không bị timeout do stream
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Đóng popup nếu xuất hiện chặn màn hình
    const closeBtn = this.page.locator('.close-btn, div.close-btn[rseat="close"], .pop-up-container .close-btn').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await this.page.waitForTimeout(1000);
    }

    // Chờ thẻ video xuất hiện
    await this.page.locator('video').first().waitFor({ state: 'attached', timeout: 20000 });
    // Chờ quảng cáo kết thúc
    await this.waitForAdToFinish();
  }

  /**
   * Lấy thời gian phát hiện tại từ thẻ <video> qua JS
   */
  async getCurrentPlaybackTime(): Promise<number> {
    let retries = 3;
    while (retries > 0) {
      try {
        return await this.page.evaluate(() => {
          const videos = Array.from(document.querySelectorAll('video'));
          const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
          return mainVideo ? mainVideo.currentTime : 0;
        });
      } catch (e) {
        console.log('⏳ Thử lại getCurrentPlaybackTime...');
        await this.page.waitForTimeout(2000);
        retries--;
      }
    }
    return 0;
  }

  async seekForwardBy(seconds: number) {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.page.evaluate((secs) => {
          const videos = Array.from(document.querySelectorAll('video'));
          const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
          if (mainVideo) {
            mainVideo.currentTime = Math.min(mainVideo.currentTime + secs, mainVideo.duration - 5);
          }
        }, seconds);
        await this.page.waitForTimeout(2000);
        return;
      } catch (e) {
        console.log('⏳ Thử lại seekForwardBy...');
        await this.page.waitForTimeout(2000);
        retries--;
      }
    }
  }

  async seekTo(percent: number) {
    let retries = 3;
    while (retries > 0) {
      try {
        await this.page.evaluate((pct) => {
          const videos = Array.from(document.querySelectorAll('video'));
          const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
          if (mainVideo && mainVideo.duration) {
            mainVideo.currentTime = mainVideo.duration * (pct / 100);
          }
        }, percent);
        await this.page.waitForTimeout(2000);
        return;
      } catch (e) {
        console.log('⏳ Thử lại seekTo...');
        await this.page.waitForTimeout(2000);
        retries--;
      }
    }
  }

  async isPlaying(): Promise<boolean> {
    let retries = 3;
    while (retries > 0) {
      try {
        return await this.page.evaluate(() => {
          const videos = Array.from(document.querySelectorAll('video'));
          return videos.some(v => !v.paused && v.currentTime > 0 && v.duration > 60);
        });
      } catch (e) {
        console.log('⏳ Thử lại isPlaying...');
        await this.page.waitForTimeout(2000);
        retries--;
      }
    }
    return false;
  }

  /**
   * Thêm vào Watch Later - click nút trong action bar bên dưới player
   */
  async addToWatchLater() {
    const collectBtn = this.page.locator('.collection-wrap').first();
    await collectBtn.waitFor({ state: 'visible', timeout: 15000 });
    await collectBtn.click({ force: true }).catch(() => collectBtn.evaluate(el => (el as HTMLElement).click()));
    await this.page.waitForTimeout(2000);
  }

  /**
   * Kiểm tra xem video đã được thêm vào Watch Later hay chưa
   */
  async isWatchLaterAdded(): Promise<boolean> {
    const isAdded = await this.page.evaluate(() => {
      const wrap = document.querySelector('.collection-wrap');
      if (!wrap) return false;
      const img = wrap.querySelector('img');
      if (!img) return false;
      const src = img.getAttribute('src') || '';
      return src.includes('green');
    });
    return isAdded;
  }
}
