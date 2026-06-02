const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Navigating to iQIYI...');
  await page.goto('https://www.iq.com/?lang=vi_vn', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  // Wait for 5 seconds to let dynamic content load
  await page.waitForTimeout(5000);
  
  console.log('Finding all input elements:');
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({
      tagName: el.tagName,
      type: el.type,
      class: el.className,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder,
      outerHTML: el.outerHTML
    }));
  });
  
  console.log(JSON.stringify(inputs, null, 2));
  
  await browser.close();
})();
