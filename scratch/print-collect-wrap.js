const fs = require('fs');
const html = fs.readFileSync('scratch/player_page_dom.html', 'utf8');

// Use a regex that allows newlines inside attributes
const regex = /<div[^>]*class="[^"]*collection-wrap[^"]*"[\s\S]*?<\/div>/gi;
const match = html.match(regex);
if (match) {
  console.log('=== Found collection-wrap ===');
  match.forEach((m, i) => {
    console.log(`Match ${i + 1}:\n${m.substring(0, 500)}\n`);
  });
} else {
  console.log('collection-wrap not found via simple class regex');
  // Look for any div containing "collection" in class
  const regexCls = /<div[^>]*class="[^"]*collection[^"]*"[\s\S]*?<\/div>/gi;
  const matchCls = html.match(regexCls);
  if (matchCls) {
    console.log('=== Found collection in class ===');
    matchCls.slice(0, 5).forEach((m, i) => {
      console.log(`Match ${i + 1}:\n${m.substring(0, 500)}\n`);
    });
  }
}

const regexBtn = /<div[^>]*class="[^"]*collection-btn[^"]*"[\s\S]*?<\/div>/gi;
const matchBtn = html.match(regexBtn);
if (matchBtn) {
  console.log('=== Found collection-btn ===');
  matchBtn.forEach((m, i) => {
    console.log(`Match ${i + 1}:\n${m.substring(0, 500)}\n`);
  });
}
