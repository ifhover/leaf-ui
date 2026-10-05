import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: '.quality/browser.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4178',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1100, height: 900 },
    hasTouch: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], hasTouch: true } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], hasTouch: false } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], hasTouch: true } },
  ],
  webServer: {
    command:
      'pnpm exec vite build --config tests/browser/vite.config.ts && pnpm exec vite preview --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4178',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
