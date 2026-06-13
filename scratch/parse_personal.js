const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('scratch/personal-page.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

console.log('=== parsing personal page ===');
const wrapRights = document.querySelectorAll('.wrap-right');
console.log(`Number of .wrap-right: ${wrapRights.length}`);

wrapRights.forEach((wrap, index) => {
  console.log(`\n--- wrap-right #${index} ---`);
  console.log(`Classes: ${wrap.className}`);
  
  // Find all children buttons/headers/lists
  const buttons = Array.from(wrap.querySelectorAll('button')).map(b => ({
    text: b.textContent.trim(),
    class: b.className
  }));
  console.log('Buttons:', buttons);
  
  const collectItems = wrap.querySelectorAll('.collect-item, .history-item, .play-record-item, a[href*="/play/"], a[href*="/album/"]');
  console.log(`Found ${collectItems.length} movie item elements.`);
  
  collectItems.forEach((item, itemIdx) => {
    const title = item.querySelector('.title, .name')?.textContent?.trim() || item.textContent.trim();
    console.log(`  Item #${itemIdx}: Title="${title}", TagName=${item.tagName}, Classes="${item.className}"`);
  });
});
