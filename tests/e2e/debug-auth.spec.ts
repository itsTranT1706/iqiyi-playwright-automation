import { test } from '@playwright/test';

test('Debug auth status and screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating to personal center history...');
  await page.goto('https://www.iq.com/personal?type=history', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Take a screenshot
  const screenshotPath = 'scratch/auth-check.png';
  console.log(`Taking screenshot to ${screenshotPath}...`);
  await page.screenshot({ path: screenshotPath });

  // Check username element in DOM
  const userName = await page.evaluate(() => {
    const el = document.querySelector('.user-name, .userName, [class*="name"]');
    return el ? el.textContent : 'Not Found';
  });

  // Check login prompt visible text
  const visibleText = await page.evaluate(() => {
    return document.body.innerText;
  });

  console.log(`User Name Element: ${userName}`);
  console.log(`Is Login present in body: ${/Log In|Đăng nhập|Login|Sign In/i.test(visibleText)}`);
  console.log(`First 500 chars of body text: \n${visibleText.slice(0, 500)}`);
});
