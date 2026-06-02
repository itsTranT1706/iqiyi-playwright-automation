const fs = require('fs');
const html = fs.readFileSync('scratch/history_page_dom_real.html', 'utf8');

// Strip tags and print all text blocks (separated by whitespace/newlines)
const textBlocks = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]*>/g, '\n')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

console.log('--- Rendered Text Blocks ---');
textBlocks.forEach((block, idx) => {
  // Let's print blocks that might be headers, list items, or messages
  if (block.length > 2 && idx < 300) {
    console.log(`${idx}: ${block}`);
  }
});
