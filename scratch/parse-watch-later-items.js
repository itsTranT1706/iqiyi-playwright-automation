const fs = require('fs');
const html = fs.readFileSync('scratch/watch_later_with_item.html', 'utf8');

// Filter out header
const index = html.indexOf('class="wrap-right"');
let content = html;
if (index !== -1) {
  content = html.substring(index);
}

// Exclude TV / Computer App section at the bottom
const bottomIndex = content.indexOf('Get the Best Experience on the APP');
if (bottomIndex !== -1) {
  content = content.substring(0, bottomIndex);
}

// Find all elements with classes containing edit, select, check, delete, or item
const regex = /<(div|button|span|a|input)[^>]*class="([^"]*)"[^>]*>/gi;
let match;
console.log('--- List structure on Watch Later page ---');
while ((match = regex.exec(content)) !== null) {
  const tag = match[1];
  const cls = match[2];
  const outer = match[0];
  if (cls.includes('select') || cls.includes('check') || cls.includes('delete') || cls.includes('edit') || cls.includes('item') || cls.includes('card') || cls.includes('title') || cls.includes('bXyydC') || outer.includes('rseat') || outer.includes('data-pb')) {
    console.log(`Tag: ${tag} | Class: ${cls} | Outer: ${outer.substring(0, 200)}`);
  }
}
