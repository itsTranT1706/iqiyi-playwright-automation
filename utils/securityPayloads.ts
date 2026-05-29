import * as fs from 'fs';
import * as path from 'path';

/**
 * Đọc danh sách payload từ file .txt (mỗi dòng 1 payload)
 * Lọc bỏ dòng trống và dòng comment (bắt đầu bằng //)
 */
export function loadPayloads(filePath: string): string[] {
  const fullPath = path.resolve(process.cwd(), filePath);
  return fs.readFileSync(fullPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('//'));
}
