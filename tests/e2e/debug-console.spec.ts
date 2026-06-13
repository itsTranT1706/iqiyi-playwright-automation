import { test, expect } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug console logs and failed requests', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Listen to all console messages
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  // Listen to failed network requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]: ${request.method()} ${request.url()} - Error: ${request.failure()?.errorText}`);
  });

  page.on('response', async response => {
    const url = response.url();
    // Catch any non-200 responses from iq.com
    if (url.includes('iq.com') && response.status() >= 400) {
      console.log(`[BAD RESPONSE]: ${response.status()} ${url}`);
      try {
        console.log(`   Body: ${await response.text()}`);
      } catch (e) {}
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
  
  console.log('Completed debug run.');
});
