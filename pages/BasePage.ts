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
    await this.page.waitForSelector(selector);
  }

  async getTitle() {
    return await this.page.title();
  }
}
