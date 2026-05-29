import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class IqiyiSearchPage extends BasePage {
  readonly filterItems: Locator;
  readonly videoResults: Locator;

  constructor(page: Page) {
    super(page);
    this.filterItems = page.locator('.second-label-current');
    this.videoResults = page.locator('a[href*="/album/"]');
  }

  async applyFilter(groupName: string, itemName: string) {
    const groupXpath = `//div[text()='${groupName}']/following-sibling::div//div[contains(@class, 'second-label-current') and text()='${itemName}']`;
    await this.page.locator(groupXpath).click();
    // Wait for content update (since URL doesn't change, we wait for a brief network idle or specific element change)
    await this.page.waitForLoadState('networkidle');
  }

  async getFirstResultTitle() {
    return await this.videoResults.first().locator('p').innerText();
  }
}
