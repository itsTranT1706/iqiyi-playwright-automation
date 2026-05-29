import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DocsPage extends BasePage {
  readonly introductionLink: Locator;

  constructor(page: Page) {
    super(page);
    this.introductionLink = page.getByRole('link', { name: 'Introduction', exact: true });
  }

  async clickIntroduction() {
    await this.introductionLink.click();
  }
}
