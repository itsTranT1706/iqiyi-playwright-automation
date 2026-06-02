import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class IqiyiLibraryPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async goToHistory() {
    // Navigate to homepage first if we are not on iq.com
    const url = this.page.url();
    if (!url.includes('iq.com')) {
      await this.page.goto('https://www.iq.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await this.page.waitForTimeout(2000);
    }
    await this.page.goto('https://www.iq.com/personal?type=history', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await this.page.waitForTimeout(3000);

    // Dismiss any modal/verification popups if they appear
    const closeBtn = this.page.locator('.close-btn, div.close-btn[rseat="close"], .pop-up-container .close-btn').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  async goToCollections() {
    const url = this.page.url();
    if (!url.includes('iq.com')) {
      await this.page.goto('https://www.iq.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await this.page.waitForTimeout(2000);
    }
    await this.page.goto('https://www.iq.com/personal?type=favorite', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await this.page.waitForTimeout(3000);

    // Dismiss any modal/verification popups if they appear
    const closeBtn = this.page.locator('.close-btn, div.close-btn[rseat="close"], .pop-up-container .close-btn').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click().catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Lấy tiêu đề phim đầu tiên trong lịch sử xem
   */
  async getFirstHistoryTitle(): Promise<string> {
    // Wait for at least one history card to be visible
    const cardLocator = this.page.locator('[rseat^="select_"], .mask-container:visible, .history-target:visible').first();
    await cardLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    const selectors = [
      '.history-target .title',
      '[data-pb="rpage=history&block=video"] .title',
      '.history-item-wrap .title',
      '.history-item .title',
      '.play-record-item .title',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        return await el.innerText();
      }
    }

    // Fallback: get visible card link text
    const link = this.page.locator('.history-target:visible').first();
    if (await link.isVisible().catch(() => false)) {
      const titleEl = link.locator('.title').first();
      if (await titleEl.isVisible().catch(() => false)) {
        return await titleEl.innerText();
      }
      return (await link.getAttribute('title') || await link.innerText()).trim();
    }
    return '';
  }

  /**
   * Kiểm tra trang history có item không
   */
  async hasHistoryItems(): Promise<boolean> {
    // Check for empty history text
    const noHistoryText = this.page.locator('text=/No Watch History|No Watch Later|Chưa có lịch sử|Trống/').first();
    if (await noHistoryText.isVisible().catch(() => false)) {
      return false;
    }
    const count = await this.page.locator('[rseat^="select_"], .mask-container:visible, .history-target:visible').count();
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
      '.title',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        return await el.innerText();
      }
    }

    const link = this.page.locator('.collect-item, .favorite-item, a[href*="/album/"]').first();
    const titleEl = link.locator('.title').first();
    if (await titleEl.isVisible().catch(() => false)) {
      return await titleEl.innerText();
    }
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

  async clickEditButton() {
    const editBtn = this.page.locator('button.edit, button:has-text("Edit"), button:has-text("Sửa"), button:has-text("Quản lý"), button.bXyydC').first();
    await editBtn.waitFor({ state: 'visible', timeout: 5000 });
    await editBtn.click({ force: true }).catch(() => editBtn.evaluate(el => (el as HTMLElement).click()));
    await this.page.waitForTimeout(1500);
  }

  async clickCancelButton() {
    const cancelBtn = this.page.locator('button.cancel, button:has-text("Cancel"), button:has-text("Hủy"), button.hhtJql').first();
    await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn.click({ force: true }).catch(() => cancelBtn.evaluate(el => (el as HTMLElement).click()));
    await this.page.waitForTimeout(1500);
  }

  async clickSelectAll() {
    const selectors = [
      '[rseat="selectall"] .check-box',
      '[rseat="selectall"]',
      'text="Select All"',
      'text="Chọn tất cả"',
      '.select-all-wrap .check-box',
      '.select-all-wrap',
    ];

    for (const sel of selectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click({ force: true }).catch(() => el.evaluate(e => (e as HTMLElement).click()));
        console.log(`✅ Đã click Select All bằng selector: ${sel}`);
        await this.page.waitForTimeout(1500);
        return;
      }
    }
    throw new Error('Không tìm thấy nút Select All / Chọn tất cả');
  }

  async selectHistoryItem(index: number) {
    const itemCheckbox = this.page.locator(`[rseat="select_${index}"]`).first();
    await itemCheckbox.waitFor({ state: 'visible', timeout: 5000 });
    await itemCheckbox.click({ force: true }).catch(() => itemCheckbox.evaluate(el => (el as HTMLElement).click()));
    await this.page.waitForTimeout(2000); // Đợi UI cập nhật trạng thái click
  }

  async clickDeleteButton() {
    const deleteBtn = this.page.locator('button:has-text("Delete"), button:has-text("Xóa"), button.bXyydC').first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
    await deleteBtn.click({ force: true }).catch(() => deleteBtn.evaluate(el => (el as HTMLElement).click()));
    await this.page.waitForTimeout(1500);

    // Click confirm Delete in the modal
    const confirmDeleteBtn = this.page.locator('button.grtSyS, .cancel-btn + button').first();
    if (await confirmDeleteBtn.isVisible().catch(() => false)) {
      await confirmDeleteBtn.click({ force: true }).catch(() => confirmDeleteBtn.evaluate(el => (el as HTMLElement).click()));
      await this.page.waitForTimeout(3000);
    }
  }
}
