import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Inspect History page elements', async ({ page }) => {
  // Navigate to history page
  await page.goto('https://www.iq.com/user/history?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Take a screenshot
  await page.screenshot({ path: 'scratch/history_page.png' });

  // Dump the inner HTML of the main content area (e.g. body or content container)
  const bodyHTML = await page.content();
  fs.writeFileSync('scratch/history_page_dom.html', bodyHTML);

  // Let's print some element classes that match "history", "item", "delete", "clear"
  const stats = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div, button, a, span'));
    const classes = new Set<string>();
    divs.forEach(d => {
      if (d.className && typeof d.className === 'string') {
        d.className.split(/\s+/).forEach(c => {
          if (c.toLowerCase().includes('history') || c.toLowerCase().includes('record') || c.toLowerCase().includes('delete') || c.toLowerCase().includes('clear') || c.toLowerCase().includes('remove') || c.toLowerCase().includes('edit')) {
            classes.add(c);
          }
        });
      }
    });
    return Array.from(classes);
  });

  console.log('Matching CSS classes found:', stats);
});
