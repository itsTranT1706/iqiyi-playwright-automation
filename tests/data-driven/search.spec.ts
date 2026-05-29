/**
 * @module Data-Driven Search Testing
 * @description
 * Kiểm thử chức năng tìm kiếm iQIYI với nhiều từ khóa khác nhau từ file CSV.
 *
 * Lý do dùng Data-Driven:
 * - Thay vì viết nhiều test case riêng lẻ, chỉ cần một vòng lặp và file CSV.
 * - Thay đổi dữ liệu test (thêm/bớt từ khóa) không cần đụng vào code chính.
 * - Bao phủ nhiều kiểu nhập liệu (Tiếng Anh, tiếng Việt có dấu, ký tự HTML nguy hại, chuỗi rỗng).
 *
 * Cách chạy:
 *   npx playwright test tests/data-driven/search.spec.ts --project="Data-Driven"
 */
import { test, expect } from '@playwright/test';
import { readSearchKeywords } from '../../utils/csvReader';

const keywords = readSearchKeywords('data/keywords.csv');

test.describe('Data-Driven: Tìm kiếm iQIYI', () => {

  for (const { keyword, expectResults, description } of keywords) {
    test(`Tìm kiếm: "${keyword}" — ${description}`, async ({ page }) => {

      // Bước 1: Điều hướng thẳng đến trang kết quả tìm kiếm với query
      await page.goto(
        `https://www.iq.com/search?query=${encodeURIComponent(keyword)}&lang=vi_vn`,
        { waitUntil: 'domcontentloaded', timeout: 60000 }
      );
      await page.waitForTimeout(3000);

      // Bước 2: Đếm số lượng kết quả phim thực tế bằng bounding box (chiều rộng/cao > 0)
      const visibleCount = await page.evaluate(() => {
        const links = Array.from(
          document.querySelectorAll('a[href*="/album/"], a[href*="/play/"]')
        );
        return links.filter(a => {
          const rect = a.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < window.innerHeight;
        }).length;
      });

      console.log(`🔍 Từ khóa: "${keyword}" → Tìm thấy ${visibleCount} kết quả thực tế`);

      // Bước 3: Xác minh số kết quả phù hợp với kỳ vọng
      if (expectResults) {
        expect(visibleCount).toBeGreaterThan(0);
      } else {
        if (keyword.trim() === '') {
          expect(visibleCount).toBe(0);
        } else {
          // Mong đợi không có kết quả: kiểm tra các thông báo không tìm thấy kết quả hoặc kết quả tự sửa đổi bằng JS innerText
          const hasNoResultText = await page.evaluate(() => {
            const text = document.body.innerText;
            return text.includes('Rất tiếc') ||
                   text.includes('Không tìm thấy') ||
                   text.includes('không tìm thấy') ||
                   text.includes('Không có kết quả') ||
                   text.includes('No results') ||
                   text.includes('No relevant videos') ||
                   text.includes('No relevant') ||
                   text.includes('The following results are found based on your search') ||
                   text.includes('dự trên tìm kiếm của bạn');
          });
          expect(hasNoResultText).toBe(true);
        }
      }
    });
  }
});
