const fs = require('fs');
const html = fs.readFileSync('scratch/watch_later_dom.html', 'utf8');

const textBlocks = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]*>/g, '\n')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

console.log('--- Rendered Text Blocks on Watch Later page ---');
textBlocks.forEach((block, idx) => {
  if (block.length > 2 && idx < 300) {
    console.log(`${idx}: ${block}`);
  }
});
