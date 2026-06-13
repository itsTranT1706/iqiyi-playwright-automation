import { test } from '@playwright/test';
import { IqiyiPlayerPage } from '../../pages/IqiyiPlayerPage';

test('Debug click watch later with screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const player = new IqiyiPlayerPage(page);

  const videoUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  console.log('Navigating to player page...');
  await player.navigateAndWaitForPlayer(videoUrl);
  await page.waitForTimeout(5000);

  // Take screenshot before click
  await page.screenshot({ path: 'scratch/before_click.png' });
  console.log('Saved before_click.png');

  console.log('Clicking the button...');
  await player.addToWatchLater();
  await page.waitForTimeout(5000);

  // Take screenshot after click
  await page.screenshot({ path: 'scratch/after_click.png' });
  console.log('Saved after_click.png');
});
