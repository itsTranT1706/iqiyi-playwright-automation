const fs = require('fs');
const html = fs.readFileSync('scratch/player_page_dom.html', 'utf8');

// Filter out header
const mainContentIndex = html.indexOf('class="main-content"');
let content = html;
if (mainContentIndex !== -1) {
  content = html.substring(mainContentIndex);
}

// Exclude header-container if present
const headerIndex = content.indexOf('class="header-container"');
if (headerIndex !== -1) {
  // Try to find end of header-container
  const endHeader = content.indexOf('</header>');
  if (endHeader !== -1) {
    content = content.substring(endHeader);
  }
}

// Exclude top-logo, search-box, history-and-collect
content = content.replace(/class="history-and-collect"[\s\S]*?<\/div>/gi, '');

// Find all elements with interesting text
const regex = /<(span|div|button|a)[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
console.log('--- Potential Watch Later buttons below header ---');
while ((match = regex.exec(content)) !== null) {
  const tag = match[1];
  const cls = match[2];
  const inner = match[3];
  const text = inner.replace(/<[^>]*>/g, '').trim();
  if (text.includes('Watch Later') || text.includes('Xem sau') || text.includes('Collect') || text.includes('Yêu thích') || text.includes('Favorite')) {
    console.log(`Tag: ${tag} | Class: ${cls} | Text: ${text} | HTML: ${match[0].substring(0, 150)}`);
  }
}

console.log('\n--- Searching for buttons with class containing collect/favorite/later ---');
const regexCls = /<(span|div|button|a)[^>]*class="([^"]*(?:collect|favorite|later)[^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
while ((match = regexCls.exec(content)) !== null) {
  const tag = match[1];
  const cls = match[2];
  const text = match[3].replace(/<[^>]*>/g, '').trim();
  console.log(`Tag: ${tag} | Class: ${cls} | Text: ${text}`);
}
