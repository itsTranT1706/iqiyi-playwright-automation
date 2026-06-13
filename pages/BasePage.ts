import { Page } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string) {
    await this.page.goto(url);
  }

  async waitForElement(selector: string) {
    await this.page.locator(selector).waitFor();
  }

  async getTitle() {
    return await this.page.title();
  }

  async dismissCookies() {
    const acceptBtn = this.page.locator('text=Chấp nhận tất cả Cookies, text=Accept All Cookies, .cookie-accept-btn').first();
    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    }
  }
}
