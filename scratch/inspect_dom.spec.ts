import { test } from '@playwright/test';

test('inspect header and footer', async ({ page }) => {
  await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const elements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    // Find header-like elements
    const headers = all
      .filter(el => {
        const cls = el.className;
        const tag = el.tagName.toLowerCase();
        if (typeof cls !== 'string') return false;
        return tag === 'header' || tag === 'nav' || cls.includes('header') || cls.includes('nav');
      })
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id
      }));

    // Find footer-like elements
    const footers = all
      .filter(el => {
        const cls = el.className;
        const tag = el.tagName.toLowerCase();
        if (typeof cls !== 'string') return false;
        return tag === 'footer' || cls.includes('footer');
      })
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id
      }));

    return { headers: headers.slice(0, 10), footers: footers.slice(0, 10) };
  });

  console.log('🔍 [HEADERS FOUND]:', JSON.stringify(elements.headers, null, 2));
  console.log('🔍 [FOOTERS FOUND]:', JSON.stringify(elements.footers, null, 2));
});
