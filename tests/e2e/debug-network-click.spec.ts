import { test } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug network click', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const player = new IqiyiPlayerPage(page);

  // Monitor network requests and responses
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('collect') || url.includes('favorite') || url.includes('watchlist')) {
      console.log(`>> Request: ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('collect') || url.includes('favorite') || url.includes('watchlist')) {
      console.log(`<< Response: ${response.status()} ${url}`);
      try {
        const text = await response.text();
        console.log(`   Body: ${text.substring(0, 300)}`);
      } catch (e) {
        // text could be binary or locked
      }
    }
  });

  const videoUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  console.log('Navigating to player page...');
  await player.navigateAndWaitForPlayer(videoUrl);
  await page.waitForTimeout(5000);

  console.log('--- Triggering click ---');
  await player.addToWatchLater();
  await page.waitForTimeout(5000);
  console.log('--- Done waiting ---');
});
