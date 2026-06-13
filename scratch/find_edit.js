const fs = require('fs');
const html = fs.readFileSync('scratch/history_page_dom.html', 'utf8');

// We want to find tags that have text "Edit" or "Chỉnh sửa" or similar
// Let's strip script and style tags first to make it easier
const cleanHtml = html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

// Now let's search for "Edit" or "Chỉnh sửa"
const regex = /<[^>]+>[^<]*(Edit|Chỉnh sửa|Sửa|Quản lý)[^<]*<\/[^>]+>/gi;
let match;
const results = [];
while ((match = regex.exec(cleanHtml)) !== null) {
  results.push(match[0]);
}

console.log('Results found:', results.length);
results.slice(0, 30).forEach((res, i) => {
  console.log(`${i}: ${res}`);
});
