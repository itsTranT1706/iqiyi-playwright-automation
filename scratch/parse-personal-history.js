const fs = require('fs');
const html = fs.readFileSync('scratch/popup_page_dom.html', 'utf8');

// 1. Find all links containing play/album inside a list container or general content area
const regexLinks = /<a[^>]*href="([^"]*(?:\/play\/|\/album\/)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
console.log('--- Links in Personal History page ---');
let linkCount = 0;
while ((match = regexLinks.exec(html)) !== null && linkCount < 20) {
  const url = match[1];
  const inner = match[2].replace(/<[^>]*>/g, '').trim().substring(0, 100);
  console.log(`URL: ${url} | Text: ${inner}`);
  linkCount++;
}

// 2. Search for any buttons or spans containing text related to delete, remove, edit, or clear
const regexBtns = /<(span|div|button|a)[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/gi;
console.log('\n--- elements with interesting texts ---');
let btnCount = 0;
while ((match = regexBtns.exec(html)) !== null && btnCount < 50) {
  const tag = match[1];
  const cls = match[2];
  const content = match[3].replace(/<[^>]*>/g, '').trim();
  if (cls.includes('btn') || cls.includes('delete') || cls.includes('edit') || cls.includes('clear') || 
      content.includes('Xóa') || content.includes('Clear') || content.includes('Delete') || content.includes('Edit') || content.includes('Sửa') || content.includes('Quản lý')) {
    console.log(`Tag: ${tag} | Class: ${cls} | Text: ${content}`);
    btnCount++;
  }
}

// 3. Search for some outer structures
console.log('\n--- structures containing history / list / record ---');
const regexDivs = /<div[^>]*class="([^"]*(?:history|list|record|item|personal|settings|main)[^"]*)"[^>]*>/gi;
let divCount = 0;
while ((match = regexDivs.exec(html)) !== null && divCount < 20) {
  console.log(`Div class: ${match[1]}`);
  divCount++;
}
