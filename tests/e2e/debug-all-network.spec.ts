import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug all network requests to iq.com', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('request', request => {
    const url = request.url();
    if (url.includes('iq.com')) {
      console.log(`>> Request: ${request.method()} ${url}`);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('iq.com')) {
      console.log(`<< Response: ${response.status()} ${url}`);
      // If it is a POST or PUT, let's try to print the body
      if (response.request().method() === 'POST') {
        try {
          const text = await response.text();
          console.log(`   POST Response Body: ${text.slice(0, 300)}`);
        } catch (e) {}
      }
    }
  });

  const player = new IqiyiPlayerPage(page);
  const TEST_VIDEO_URL = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  
  console.log('Navigating to player...');
  await player.navigateAndWaitForPlayer(TEST_VIDEO_URL);
  await page.waitForTimeout(3000);

  console.log('Clicking Watch Later...');
  await player.addToWatchLater();
  await page.waitForTimeout(5000);

  console.log('Done.');
});
