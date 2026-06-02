const fs = require('fs');
const html = fs.readFileSync('scratch/watch_later_dom.html', 'utf8');

// Search for any buttons or spans containing text related to delete, remove, edit, or clear
const regexBtns = /<(span|div|button|a)[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
console.log('--- elements with interesting texts on Watch Later page ---');
let btnCount = 0;
while ((match = regexBtns.exec(html)) !== null && btnCount < 50) {
  const tag = match[1];
  const cls = match[2];
  const content = match[3].replace(/<[^>]*>/g, '').trim();
  if (cls.includes('btn') || cls.includes('delete') || cls.includes('edit') || cls.includes('clear') || cls.includes('favorite') ||
      content.includes('Xóa') || content.includes('Clear') || content.includes('Delete') || content.includes('Edit') || content.includes('Sửa') || content.includes('Quản lý')) {
    console.log(`Tag: ${tag} | Class: ${cls} | Text: ${content}`);
    btnCount++;
  }
}

// Search for structures
console.log('\n--- structures containing favorite / collect / list ---');
const regexDivs = /<div[^>]*class="([^"]*(?:favorite|collect|list|item|area)[^"]*)"[^>]*>/gi;
let divCount = 0;
while ((match = regexDivs.exec(html)) !== null && divCount < 20) {
  console.log(`Div class: ${match[1]}`);
  divCount++;
}
