import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug watch later network requests', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const player = new IqiyiPlayerPage(page);

  // Listen to network requests/responses
  page.on('request', request => {
    const url = request.url();
    if (url.includes('collect') || url.includes('favorite') || url.includes('add') || url.includes('like')) {
      console.log(`>> Request: ${request.method()} ${url}`);
      const headers = request.headers();
      console.log(`   Headers cookie: ${headers['cookie'] ? 'exists' : 'missing'}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('collect') || url.includes('favorite') || url.includes('add') || url.includes('like')) {
      console.log(`<< Response: ${response.status()} ${url}`);
      try {
        const text = await response.text();
        console.log(`   Body: ${text.slice(0, 500)}`);
      } catch (e) {
        console.log(`   Could not read body: ${e.message}`);
      }
    }
  });

  const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  console.log('Navigating to player...');
  await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
  await page.waitForTimeout(2000);

  const isAdded = await player.isWatchLaterAdded();
  console.log(`Initial watch later added state: ${isAdded}`);

  // Force add (even if already added, we want to see the request)
  console.log('Clicking watch later button...');
  await player.addToWatchLater();
  await page.waitForTimeout(5000);

  console.log('Finished waiting for requests.');
});
