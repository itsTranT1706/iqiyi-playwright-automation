import { test } from '@playwright/test';

test('Debug history page structure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://www.iq.com/personal?type=history', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Dump information about all elements inside .wrap-right
  const elements = await page.evaluate(() => {
    const wrap = document.querySelector('.wrap-right');
    if (!wrap) return 'No wrap-right found';
    
    // Find all links and headers inside wrap-right
    const tags = Array.from(wrap.querySelectorAll('*'));
    return tags.map((el, index) => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim() || '';
      // We only care about elements that are visible and contain some text
      if (rect.width > 0 && rect.height > 0 && text.length > 0 && text.length < 150) {
        return {
          index,
          tagName: el.tagName,
          className: el.className,
          text: text,
          id: el.id
        };
      }
      return null;
    }).filter(Boolean);
  });

  console.log('--- Elements in wrap-right ---');
  console.log(JSON.stringify(elements, null, 2));
});
