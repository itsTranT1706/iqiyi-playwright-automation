import { test } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug click watch later', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const player = new IqiyiPlayerPage(page);

  const videoUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  console.log('Navigating to player page...');
  await player.navigateAndWaitForPlayer(videoUrl);
  await page.waitForTimeout(5000);

  const collectBtn = page.locator('.collection-wrap').first();
  await collectBtn.waitFor({ state: 'attached', timeout: 15000 });

  const initialAdded = await player.isWatchLaterAdded();
  const initialHtml = await collectBtn.evaluate(el => el.outerHTML);
  console.log(`Initial isWatchLaterAdded: ${initialAdded}`);
  console.log('Initial HTML:\n', initialHtml);

  console.log('Clicking the button...');
  await player.addToWatchLater();
  await page.waitForTimeout(5000);

  const postClickAdded = await player.isWatchLaterAdded();
  const postClickHtml = await collectBtn.evaluate(el => el.outerHTML);
  console.log(`Post-click isWatchLaterAdded: ${postClickAdded}`);
  console.log('Post-click HTML:\n', postClickHtml);
});
