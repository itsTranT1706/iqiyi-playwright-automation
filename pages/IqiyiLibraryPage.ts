import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class IqiyiLibraryPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goToHistory() {
    await this.page.goto('https://www.iq.com/user/history?lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await this.page.waitForTimeout(2000);
  }

  async goToCollections() {
    await this.page.goto('https://www.iq.com/user/collect?lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await this.page.waitForTimeout(2000);
  }

  /**
   * Lấy tiêu đề phim đầu tiên trong lịch sử xem
   */
  async getFirstHistoryTitle(): Promise<string> {
    // Thử nhiều selector khác nhau để bắt được title trong history
    const selectors = [
      '.history-item-wrap .title',
      '.history-item .title',
      '.album-item .title',
      '.item-info .title',
      '.video-title',
      'a[href*="/play/"] .title',
      '.play-record-item .title',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        return await el.innerText();
      }
    }

    // Fallback: lấy bất kỳ link nào trỏ đến trang play
    const link = this.page.locator('a[href*="/play/"]').first();
    const title = await link.getAttribute('title') || await link.innerText();
    return title.trim();
  }

  /**
   * Kiểm tra trang history có item không
   */
  async hasHistoryItems(): Promise<boolean> {
    const count = await this.page.locator('a[href*="/play/"]').count();
    return count > 0;
  }

  /**
   * Lấy tiêu đề phim đầu tiên trong danh sách xem sau
   */
  async getFirstCollectTitle(): Promise<string> {
    const selectors = [
      '.collect-item-wrap .title',
      '.collect-item .title',
      '.album-item .title',
      '.video-title',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        return await el.innerText();
      }
    }

    const link = this.page.locator('a[href*="/album/"]').first();
    const title = await link.getAttribute('title') || await link.innerText();
    return title.trim();
  }

  /**
   * Kiểm tra trang collect có item không
   */
  async hasCollectItems(): Promise<boolean> {
    const count = await this.page.locator('a[href*="/album/"], a[href*="/play/"]').count();
    return count > 0;
  }
}
