import { Page } from '@playwright/test';

export interface LinkCheckResult {
  url: string;         // URL của link
  status: number;      // HTTP status code (200, 404, 500...)
  isBroken: boolean;   // true nếu status >= 400
  sourceText: string;  // Nội dung text của thẻ <a> (để dễ debug)
}

/**
 * Thu thập tất cả href từ thẻ <a> có thể nhìn thấy trên trang hiện tại.
 * Chỉ lấy link tuyệt đối (bắt đầu http/https) để tránh mailto:, javascript:
 */
export async function collectLinks(page: Page): Promise<{ url: string; text: string }[]> {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({
        url: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim().substring(0, 50) || ''
      }))
      .filter(link =>
        link.url.startsWith('http') &&          // Chỉ lấy link tuyệt đối
        !link.url.includes('javascript:') &&    // Loại bỏ javascript: links
        !link.url.includes('mailto:')           // Loại bỏ mailto: links
      );
  });
}

/**
 * Kiểm tra HTTP status của một URL bằng HEAD request (nhanh, không tải body)
 * @returns HTTP status code
 */
export async function checkLinkStatus(page: Page, url: string): Promise<number> {
  try {
    const response = await page.request.head(url, { timeout: 10000 });
    return response.status();
  } catch {
    return 0; // 0 = network error / timeout
  }
}
