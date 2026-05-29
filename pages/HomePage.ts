import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly getStartedButton: Locator;
  readonly headingInstallation: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedButton = page.getByRole('link', { name: 'Get started' });
    this.headingInstallation = page.getByRole('heading', { name: 'Installation' });
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  async isInstallationHeadingVisible() {
    return await this.headingInstallation.isVisible();
  }
}
