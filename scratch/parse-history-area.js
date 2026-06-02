const fs = require('fs');
const html = fs.readFileSync('scratch/popup_page_dom.html', 'utf8');

// Find div class="history-area" and print its content
const startIdx = html.indexOf('class="history-area"');
if (startIdx !== -1) {
  const sub = html.substring(startIdx - 50, startIdx + 15000);
  console.log('--- Substring of history-area ---');
  console.log(sub);
} else {
  console.log('class="history-area" not found!');
}
