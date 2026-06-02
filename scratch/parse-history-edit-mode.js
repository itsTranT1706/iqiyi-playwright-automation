const fs = require('fs');
const html = fs.readFileSync('scratch/history_edit_mode_dom_nolang.html', 'utf8');

// Find all buttons on the page in edit mode
const regexButtons = /<button[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/gi;
let match;
console.log('--- Buttons in Edit Mode ---');
while ((match = regexButtons.exec(html)) !== null) {
  const cls = match[1];
  const text = match[2].replace(/<[^>]*>/g, '').trim();
  console.log(`Class: ${cls} | Text: ${text}`);
}

// Find elements related to select all or delete
const regexDivs = /<div[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/div>/gi;
console.log('\n--- Divs with clear / delete / select text in Edit Mode ---');
let divCount = 0;
while ((match = regexDivs.exec(html)) !== null && divCount < 30) {
  const cls = match[1];
  const text = match[2].replace(/<[^>]*>/g, '').trim();
  if (cls.includes('select') || cls.includes('delete') || cls.includes('clear') || 
      text.includes('Select') || text.includes('Delete') || text.includes('Clear') || text.includes('Cancel')) {
    console.log(`Class: ${cls} | Text: ${text.substring(0, 100)}`);
    divCount++;
  }
}

// Write the main content block snippet
const startIdx = html.indexOf('class="history-area"');
if (startIdx !== -1) {
  console.log('\n--- Substring inside history-area during Edit Mode ---');
  console.log(html.substring(startIdx - 50, startIdx + 3000));
}
