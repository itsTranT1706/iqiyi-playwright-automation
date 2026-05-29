/**
 * @module Broken Link Checker
 * @description
 * Tự động thu thập và kiểm tra tất cả các link trên trang chủ iQIYI.
 *
 * Quy trình:
 * 1. Mở trang chủ iQIYI.
 * 2. Tìm tất cả các thẻ <a> có thuộc tính href chứa URL tuyệt đối (http/https).
 * 3. Gửi các HEAD request song song/tuần tự để kiểm tra HTTP response status code.
 * 4. Báo cáo các link lỗi (trả về mã 4xx hoặc 5xx).
 *
 * Tại sao dùng tự động?
 * - Số lượng liên kết trên một website phim vô cùng lớn (lên tới hàng trăm, hàng ngàn link).
 * - Con người không thể nào click tay kiểm tra từng link được.
 *
 * Cách chạy:
 *   npx playwright test tests/broken-links/crawler.spec.ts --project="Broken Links"
 */
import { test, expect } from '@playwright/test';
import { collectLinks, checkLinkStatus } from '../../utils/linkCrawler';

test.describe('Broken Link Checker — Trang chủ iQIYI', () => {

  test('Kiểm tra danh sách link trên trang chủ', async ({ page }) => {
    // Bước 1: Mở trang chủ
    await page.goto('https://www.iq.com/?lang=vi_vn', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    await page.waitForTimeout(3000); // Chờ các phần tử render xong hoàn toàn

    // Bước 2: Thu thập các link
    const links = await collectLinks(page);
    console.log(`🔗 Tổng cộng tìm thấy: ${links.length} links trên trang chủ.`);

    // Lấy 25 link đầu tiên để kiểm duyệt mẫu tránh bị hệ thống block (quá tải request)
    const linksToTest = links.slice(0, 25);
    const brokenLinks: { url: string; status: number; text: string }[] = [];

    // Bước 3: Gửi HEAD request để check status
    for (const link of linksToTest) {
      console.log(`📡 Đang kiểm tra: ${link.url}`);
      const status = await checkLinkStatus(page, link.url);
      
      if (status >= 400 || status === 0) {
        console.log(`  ❌ LỖI LINK: [Status ${status}] ${link.url}`);
        brokenLinks.push({ url: link.url, status, text: link.text });
      } else {
        console.log(`  ✅ OK: [Status ${status}]`);
      }
      
      // Chờ nhẹ 100ms tránh spam
      await page.waitForTimeout(100);
    }

    // In thống kê kết quả
    console.log(`\n📊 Kết quả kiểm tra: ${linksToTest.length} links. Số link hỏng: ${brokenLinks.length}`);
    if (brokenLinks.length > 0) {
      console.log('🚨 Danh sách chi tiết các link hỏng:');
      brokenLinks.forEach(b => {
        console.log(`  - Text: "${b.text}" | URL: ${b.url} | Status: ${b.status}`);
      });
    }

    // Quyết định pass/fail dựa trên lượng link hỏng
    expect(brokenLinks.length).toBe(0);
  });
});
