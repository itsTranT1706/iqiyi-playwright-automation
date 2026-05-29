import * as fs from 'fs';
import * as path from 'path';

export interface SearchKeyword {
  keyword: string;       // Từ khóa tìm kiếm
  expectResults: boolean; // true = mong đợi có kết quả, false = mong đợi không có
  description: string;   // Mô tả mục đích test case
}

/**
 * Đọc file CSV và parse thành mảng SearchKeyword
 * @param filePath - Đường dẫn tương đối từ thư mục gốc dự án
 */
export function readSearchKeywords(filePath: string): SearchKeyword[] {
  const fullPath = path.resolve(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // Bỏ dòng header
  return lines.map(line => {
    const parts = line.split(',');
    const keyword = parts[0];
    const expectResults = parts[1];
    const description = parts[2];
    return {
      keyword: keyword ? keyword.trim() : '',
      expectResults: expectResults ? expectResults.trim() === 'true' : false,
      description: description ? description.trim() : ''
    };
  });
}
