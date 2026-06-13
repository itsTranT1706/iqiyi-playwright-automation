const fs = require('fs');
const html = fs.readFileSync('scratch/player_page_dom.html', 'utf8');

const start = html.indexOf('class="collection-wrap"');
if (start !== -1) {
  // Extract 1500 characters
  console.log(html.substring(start - 50, start + 1500));
} else {
  console.log('Not found');
}
