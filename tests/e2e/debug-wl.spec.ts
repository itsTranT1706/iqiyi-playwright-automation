import { test } from '@playwright/test';

test('Debug watch later button structure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Go to the player page
  const videoUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
  console.log('Navigating to player page...');
  await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Close any popups
  const closeBtn = page.locator('.close-btn, div.close-btn[rseat="close"], .pop-up-container .close-btn').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => {});
    console.log('Closed popup');
  }
  
  const collectBtn = page.locator('.collection-wrap').first();
  await collectBtn.waitFor({ state: 'attached', timeout: 15000 });
  
  // Print initial outer HTML
  const initialHtml = await collectBtn.evaluate(el => el.outerHTML);
  console.log('Initial collection-wrap HTML:\n', initialHtml);
  
  // Click to toggle
  console.log('Clicking collection-wrap button...');
  await collectBtn.click({ force: true });
  await page.waitForTimeout(3000);
  
  // Print outer HTML after first click
  const afterClickHtml = await collectBtn.evaluate(el => el.outerHTML);
  console.log('After first click HTML:\n', afterClickHtml);
  
  // Click again to toggle back
  console.log('Clicking collection-wrap button again...');
  await collectBtn.click({ force: true });
  await page.waitForTimeout(3000);
  
  // Print outer HTML after second click
  const afterSecondClickHtml = await collectBtn.evaluate(el => el.outerHTML);
  console.log('After second click HTML:\n', afterSecondClickHtml);
});
