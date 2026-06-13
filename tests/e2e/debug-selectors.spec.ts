import { test } from '@playwright/test';

test('Debug personal page selectors', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://www.iq.com/personal?type=history', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Find all buttons on the page
  const buttonsInfo = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], span[class*="btn"], button[class*="btn"]'));
    return buttons.map((btn, index) => {
      const rect = btn.getBoundingClientRect();
      return {
        index,
        tagName: btn.tagName,
        className: btn.className,
        text: (btn as HTMLElement).innerText?.trim(),
        visible: rect.width > 0 && rect.height > 0,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      };
    });
  });

  console.log('--- Buttons on page ---');
  console.log(JSON.stringify(buttonsInfo.filter(b => b.visible), null, 2));

  // Find all elements with classes containing wrap-right
  const wrapsInfo = await page.evaluate(() => {
    const wraps = Array.from(document.querySelectorAll('[class*="wrap"]'));
    return wraps.map((w, index) => {
      const rect = w.getBoundingClientRect();
      return {
        index,
        tagName: w.tagName,
        className: w.className,
        visible: rect.width > 0 && rect.height > 0,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      };
    });
  });
  console.log('--- Wrap elements on page ---');
  console.log(JSON.stringify(wrapsInfo.filter(w => w.visible && w.className.includes('wrap')), null, 2));
});
