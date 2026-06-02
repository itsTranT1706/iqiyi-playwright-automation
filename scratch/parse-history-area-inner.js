const fs = require('fs');
const html = fs.readFileSync('scratch/popup_page_dom.html', 'utf8');

const startIdx = html.indexOf('class="history-area"');
if (startIdx !== -1) {
  // Let's print just 2,000 characters from the class definition
  const sub = html.substring(startIdx - 50, startIdx + 2000);
  console.log('--- Substring inside history-area ---');
  console.log(sub);
} else {
  console.log('class="history-area" not found!');
}
