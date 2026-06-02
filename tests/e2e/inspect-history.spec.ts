import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Inspect Watch Later page elements', async ({ page }) => {
  // Go to homepage first
  await page.goto('https://www.iq.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Navigate to favorite page
  await page.goto('https://www.iq.com/personal?type=favorite', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  console.log(`Page Title: ${title}`);
  console.log(`Page URL: ${page.url()}`);

  // Take initial screenshot
  await page.screenshot({ path: 'scratch/watch_later_initial.png' });

  // Let's print all buttons on the page first to see what's there
  const buttonsOnPage = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      class: b.className,
      text: b.innerText
    }));
  });
  console.log('Buttons on page:', buttonsOnPage);

  // Let's print classes and titles inside the main content area
  const items = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('.favorite-area a, .favorite-item a, a[href*="/play/"], a[href*="/album/"]'));
    return list.map(a => ({
      href: (a as any).href,
      text: a.textContent ? a.textContent.trim().substring(0, 100) : ''
    }));
  });
  console.log('Links on watch later page:', items);

  // Dump the DOM of the Watch Later page
  const wlHtml = await page.content();
  fs.writeFileSync('scratch/watch_later_dom.html', wlHtml);
});
