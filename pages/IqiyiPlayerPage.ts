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
      // Thử click nút skip nếu có
      const skipVisible = await this.skipAdButton.isVisible().catch(() => false);
      if (skipVisible) {
        await this.skipAdButton.click();
        console.log('⏩ Đã skip quảng cáo!');
        await this.page.waitForTimeout(1000);
        return;
      }

      // Kiểm tra xem video chính đã bắt đầu chưa bằng JS
      const isMainVideoPlaying = await this.page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        for (const v of videos) {
          // Video chính thường có duration > 300s (5 phút), quảng cáo ngắn hơn
          if (v.duration > 60 && v.currentTime > 0) return true;
        }
        return false;
      });

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
    // Chờ thẻ video xuất hiện
    await this.page.locator('video').first().waitFor({ state: 'attached', timeout: 20000 });
    // Chờ quảng cáo kết thúc
    await this.waitForAdToFinish();
  }

  /**
   * Lấy thời gian phát hiện tại từ thẻ <video> qua JS
   */
  async getCurrentPlaybackTime(): Promise<number> {
    return await this.page.evaluate(() => {
      // Ưu tiên video có duration dài nhất (video chính, không phải quảng cáo)
      const videos = Array.from(document.querySelectorAll('video'));
      const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
      return mainVideo ? mainVideo.currentTime : 0;
    });
  }

  /**
   * Tua đến vị trí phần trăm nhất định (dùng JS trực tiếp)
   */
  /**
   * Tua TIẾN một khoảng giây nhất định từ vị trí hiện tại
   */
  async seekForwardBy(seconds: number) {
    await this.page.evaluate((secs) => {
      const videos = Array.from(document.querySelectorAll('video'));
      const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
      if (mainVideo) {
        mainVideo.currentTime = Math.min(mainVideo.currentTime + secs, mainVideo.duration - 5);
      }
    }, seconds);
    await this.page.waitForTimeout(2000);
  }

  async seekTo(percent: number) {
    await this.page.evaluate((pct) => {
      const videos = Array.from(document.querySelectorAll('video'));
      const mainVideo = videos.sort((a, b) => b.duration - a.duration)[0];
      if (mainVideo && mainVideo.duration) {
        mainVideo.currentTime = mainVideo.duration * (pct / 100);
      }
    }, percent);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Kiểm tra video chính có đang phát không
   */
  async isPlaying(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return videos.some(v => !v.paused && v.currentTime > 0 && v.duration > 60);
    });
  }

  /**
   * Thêm vào Watch Later - click nút trong action bar bên dưới player
   */
  async addToWatchLater() {
    // Tìm TẤT CẢ các span có text "Watch Later"
    // rồi chọn cái nào nằm trong action bar dưới player (không phải sidebar)
    const clicked = await this.page.evaluate(() => {
      const allSpans = Array.from(document.querySelectorAll('span'));
      const watchLaterSpans = allSpans.filter(s =>
        s.textContent?.trim() === 'Watch Later' || s.textContent?.trim() === 'Xem sau'
      );

      for (const span of watchLaterSpans) {
        // Tìm container button/li/div trực tiếp chứa span này
        // Dùng parentElement thay closest để không leo quá xa
        let el: HTMLElement | null = span.parentElement;
        // Leo tối đa 3 cấp
        for (let i = 0; i < 3 && el; i++) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className || '';
          // Nếu tìm thấy element có class liên quan đến watch-later hoặc collect
          if (cls.includes('watch') || cls.includes('collect') || cls.includes('later') ||
              tag === 'button' || tag === 'li') {
            el.click();
            return `clicked: ${tag}.${cls.substring(0, 30)}`;
          }
          el = el.parentElement;
        }
        // Fallback: click trực tiếp vào span's parentElement
        if (span.parentElement) {
          span.parentElement.click();
          return 'clicked parent fallback';
        }
      }
      return 'not found';
    });

    console.log(`🖖 JS click Watch Later: ${clicked}`);
    await this.page.waitForTimeout(2000);
  }

  /**
   * Kiểm tra toast "Added to Watch Later" xuất hiện
   */
  async isWatchLaterAdded(): Promise<boolean> {
    try {
      await this.watchLaterToast.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
