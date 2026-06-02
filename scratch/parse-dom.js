const fs = require('fs');
const html = fs.readFileSync('scratch/history_page_dom.html', 'utf8');

// Let's find tags that have classes matching our interests
const regex = /<([a-z0-9]+)([^>]*class="[^"]*(?:clear-all-btn|history|collect|record|delete|remove|edit)[^"]*"[^>]*)>/gi;
let match;
console.log('Matching elements in HTML file:');
while ((match = regex.exec(html)) !== null) {
  console.log(`Tag: ${match[1]}, Attributes: ${match[2].substring(0, 150)}...`);
}

// Let's find "clear-all-btn" specifically in the text
const pos = html.indexOf('clear-all-btn');
if (pos !== -1) {
  console.log(`Found clear-all-btn at position ${pos}: ${html.substring(pos - 50, pos + 100)}`);
} else {
  console.log('clear-all-btn NOT found as raw substring!');
}
