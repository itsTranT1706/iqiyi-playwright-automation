const fs = require('fs');
const html = fs.readFileSync('scratch/watch_later_with_item.html', 'utf8');

const start = html.indexOf('class="collect-item"');
if (start !== -1) {
  console.log(html.substring(start - 50, start + 3000));
} else {
  console.log('Not found');
}
