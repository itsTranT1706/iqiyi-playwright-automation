import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class IqiyiHomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly userProfile: Locator;
  readonly historyButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('input[rseat="search_box"], input.search-input, input[placeholder*="tìm kiếm" i], input[placeholder*="search" i]').first();
    this.searchButton = page.locator('div.search-btn, .search-btn, .search-icon, button:has(img[src*="search"])').first();
    this.userProfile = page.locator('div.user-wrap');
    this.historyButton = page.locator('div.history-and-collect');
  }

  async searchFor(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToHistory() {
    await this.historyButton.click();
  }

  async isLoggedIn() {
    // Check for presence of avatar or specific logged-in class
    return await this.page.locator('div.userImg-wrap').isVisible();
  }
}
