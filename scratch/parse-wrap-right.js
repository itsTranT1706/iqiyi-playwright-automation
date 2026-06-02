const fs = require('fs');
const html = fs.readFileSync('scratch/popup_page_dom.html', 'utf8');

const startIdx = html.indexOf('class="wrap-right"');
if (startIdx !== -1) {
  const sub = html.substring(startIdx - 50, startIdx + 1000);
  console.log('--- Substring of wrap-right ---');
  console.log(sub);
} else {
  console.log('class="wrap-right" not found!');
}
