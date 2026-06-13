const fs = require('fs');

const filePath = 'tests/e2e/watch-later.spec.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace page.locator('.wrap-right').nth(1) with (await library.getWrapRightLocator())
const searchStr = "page.locator('.wrap-right').nth(1)";
const replacementStr = "(await library.getWrapRightLocator())";

if (content.includes(searchStr)) {
  content = content.split(searchStr).join(replacementStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ watch-later.spec.ts successfully updated!');
} else {
  console.log('❌ search string not found in watch-later.spec.ts');
}
