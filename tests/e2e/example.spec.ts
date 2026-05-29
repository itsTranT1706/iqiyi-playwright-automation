import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import * as testData from '../../data/testData.json';

test.describe('Playwright Homepage Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateTo(testData.baseUrl);
  });

  test('has title', async () => {
    // Expect a title "to contain" a substring.
    await expect(homePage['page']).toHaveTitle(new RegExp(testData.expectedTitle));
  });

  test('get started link', async () => {
    // Click the get started link using POM method.
    await homePage.clickGetStarted();

    // Expects page to have a heading with the name of Installation.
    await expect(homePage.headingInstallation).toBeVisible();
  });
});
