import { test } from '@playwright/test';

test('Parse personal page structure', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // Navigate to Collections page
  console.log('Navigating to Collections...');
  await page.goto('https://www.iq.com/personal?type=favorite', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  const report = await page.evaluate(() => {
    const lines: string[] = [];
    
    // Check wrap-right
    const wraps = document.querySelectorAll('.wrap-right');
    lines.push(`Number of .wrap-right: ${wraps.length}`);
    
    wraps.forEach((wrap, i) => {
      lines.push(`\n--- wrap-right #${i} ---`);
      lines.push(`HTML tag: ${wrap.tagName}, class: ${wrap.className}`);
      
      // Look for any edit button inside this wrap
      const editBtns = Array.from(wrap.querySelectorAll('button, div, a'))
        .filter(el => {
          const txt = el.textContent?.trim() || '';
          return /edit|sửa|quản lý/i.test(txt) && txt.length < 15;
        });
      lines.push(`Edit-like buttons count: ${editBtns.length}`);
      editBtns.forEach((btn, btnIdx) => {
        lines.push(`  Btn #${btnIdx}: tag=${btn.tagName}, class="${btn.className}", text="${btn.textContent?.trim()}", HTML="${btn.outerHTML.substring(0, 200)}"`);
      });

      // Find item cards
      const items = wrap.querySelectorAll('.collect-item, .history-item, .play-record-item, a[href*="/play/"], a[href*="/album/"]');
      lines.push(`Movie items count: ${items.length}`);
      items.forEach((item, itemIdx) => {
        const title = item.querySelector('.title, .name')?.textContent?.trim() || item.textContent?.trim() || '';
        lines.push(`  Item #${itemIdx}: tag=${item.tagName}, class="${item.className}", title="${title}", href="${(item as HTMLAnchorElement).href || ''}"`);
      });
    });

    // Also look for edit buttons globally on the page
    const globalEditBtns = Array.from(document.querySelectorAll('button, div[role="button"]'))
      .filter(el => {
        const txt = el.textContent?.trim() || '';
        return /edit|sửa|quản lý/i.test(txt) && txt.length < 15;
      });
    lines.push(`\nGlobal Edit-like buttons: ${globalEditBtns.length}`);
    globalEditBtns.forEach((btn, btnIdx) => {
      lines.push(`  Global Btn #${btnIdx}: tag=${btn.tagName}, class="${btn.className}", text="${btn.textContent?.trim()}", parentClass="${btn.parentElement?.className || ''}"`);
    });

    return lines.join('\n');
  });

  console.log('=== STRUCTURE REPORT ===');
  console.log(report);
  console.log('========================');
});
