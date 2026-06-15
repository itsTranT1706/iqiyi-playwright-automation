import { test, expect } from '@playwright/test';

test.describe('iQIYI E2E: Tính năng Bình luận (Comments)', () => {

  test('TC4.1: Lỗi tương tác nút Bình luận (Comments) đa ngôn ngữ', async ({ page }) => {
    let jsErrors: Error[] = [];
    page.on('pageerror', error => {
      jsErrors.push(error);
    });

    // --- PHẦN 1: Giao diện Tiếng Anh (Nút tồn tại nhưng bấm không chạy) ---
    const enUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=en_us';
    await page.goto(enUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('video', { timeout: 15000 }).catch(() => {});

    // Tìm bằng text vì class có thể bị minify/thay đổi
    const commentBtnEn = page.locator('text="Comments"').first();
    const isBtnVisibleEn = await commentBtnEn.isVisible({ timeout: 15000 }).catch(() => false);
    
    expect(isBtnVisibleEn, 'Khẳng định cơ bản: Nút Comments phải tồn tại trên Tiếng Anh').toBe(true);
    
    // Click và chờ panel bình luận mở ra
    await commentBtnEn.click({ force: true });
    await page.waitForTimeout(2000);
    const commentPanel = page.locator('div[class*="comment-panel"], div[class*="comment-wrap"], div[class*="comment-dialog"], section[class*="comment"]').first();
    const isPanelVisible = await commentPanel.isVisible().catch(() => false);
    
    expect(isPanelVisible, '❌ BUG-005 (Tiếng Anh): Nút Comments bị liệt, bấm vào không có tác dụng!').toBe(true);

    // --- PHẦN 2: Giao diện Tiếng Việt (Nút bốc hơi / Văng lỗi JS) ---
    const vnUrl = 'https://www.iq.com/play/descendants-of-the-sun-tap-1-19rrhyq7ph?lang=vi_vn';
    await page.goto(vnUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('video', { timeout: 15000 }).catch(() => {});

    const commentBtnVn = page.locator('div[class*="comment"], button[class*="comment"], [aria-label*="Comment"], [aria-label*="Bình luận"]').first();
    const isCommentBtnVisibleVn = await commentBtnVn.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isCommentBtnVisibleVn) {
      await commentBtnVn.click({ force: true });
      await page.waitForTimeout(2000);
      const hasQuerySelectorError = jsErrors.some(err => err.message.includes('querySelector') || err.message.includes('Cannot read properties of null'));
      expect(hasQuerySelectorError, '❌ BUG-005 (Tiếng Việt): Bấm Comments gây lỗi Crash JS Cannot read properties of null').toBe(false);
    } else {
      expect(false, '❌ BUG-005 (Tiếng Việt): Nút Bình luận KHÔNG TỒN TẠI hoặc bị ẩn mất').toBe(true);
    }
  });

});
