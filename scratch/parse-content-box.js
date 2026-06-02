const fs = require('fs');
const html = fs.readFileSync('scratch/history_page_dom_real.html', 'utf8');

// Find the content-box div and extract its inner html
const startIdx = html.indexOf('class="content-box"');
if (startIdx !== -1) {
  // Let's grab 50,000 characters from here to capture the list items
  const sub = html.substring(startIdx - 50, startIdx + 30000);
  console.log('--- Substring of content-box ---');
  
  // Print tags matching list items and links
  const regex = /<li[^>]*>([\s\S]*?)<\/li>|<a[^>]*class="[^"]*(?:history|collect|record|play)[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="[^"]*(?:history-item|collect-item|list-item)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(sub)) !== null && count < 20) {
    console.log(`Match ${count}: ${match[0].substring(0, 300)}...`);
    count++;
  }
  
  // Also write the content box html to a separate scratch file for easy inspection
  fs.writeFileSync('scratch/content_box_dump.html', sub);
  console.log('\nWrote scratch/content_box_dump.html');
} else {
  console.log('class="content-box" not found in the HTML!');
}
