import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Cấu trúc test:
 *  tests/e2e/           - E2E tests (luồng người dùng đầu cuối)
 *  tests/data-driven/   - Data-Driven tests (tìm kiếm/đăng ký hàng loạt)
 *  tests/visual/        - Visual Regression tests (so sánh ảnh chụp màn hình)
 *  tests/security/      - Security tests (XSS, SQL Injection)
 *  tests/broken-links/  - Broken Link Checker (quét link lỗi)
 *  load-tests/k6/       - Load tests (dùng K6, chạy riêng)
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Timeout mặc định 120s (chờ quảng cáo + load chậm) */
  timeout: 120_000,

  /* Chạy tuần tự để không bị conflict phiên đăng nhập */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,

  /* Báo cáo: HTML đẹp + danh sách trên terminal */
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    /* Timeout 30s cho video/mạng chậm */
    actionTimeout: 30_000,
    navigationTimeout: 60_000,

    /* Tự động đăng nhập bằng session đã lưu */
    storageState: 'auth.json',

    /* Chụp ảnh màn hình khi test thất bại */
    screenshot: 'only-on-failure',

    /* Quay video khi test thất bại */
    video: 'retain-on-failure',

    /* Ghi trace khi retry */
    trace: 'on-first-retry',

    /* Hiển thị trình duyệt lên màn hình */
    headless: false,
  },

  projects: [
    // -------------------------------------------------------
    // E2E Tests — Luồng người dùng đầu cuối (Chrome thật)
    // Chạy mặc định: npx playwright test
    // -------------------------------------------------------
    {
      name: 'E2E - Chrome',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    /* 
    ===========================================================================
    CÁC BỘ TEST NÂNG CAO KHÁC (BỎ COMMENT ĐỂ KÍCH HOẠT LẠI KHI CẦN)
    ===========================================================================

    // -------------------------------------------------------
    // Data-Driven Tests — Tìm kiếm/đăng ký hàng loạt
    // -------------------------------------------------------
    {
      name: 'Data-Driven',
      testDir: './tests/data-driven',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    // -------------------------------------------------------
    // Visual Regression Tests — So sánh ảnh pixel-by-pixel
    // -------------------------------------------------------
    {
      name: 'Visual',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: true, // headless để ảnh chụp nhất quán
      },
    },

    // -------------------------------------------------------
    // Security Tests — XSS, SQL Injection
    // -------------------------------------------------------
    {
      name: 'Security',
      testDir: './tests/security',
      timeout: 60_000,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    // -------------------------------------------------------
    // Broken Link Checker — Quét link lỗi toàn trang
    // -------------------------------------------------------
    {
      name: 'Broken Links',
      testDir: './tests/broken-links',
      timeout: 300_000, // 5 phút vì phải crawl nhiều link
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: true, // headless để chạy nhanh hơn
      },
    },
    */
  ],
});
