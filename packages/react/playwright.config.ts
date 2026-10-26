import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { browserOptions } from './scripts/browser-options.mjs';

const { baseURL, directory, port, run } = browserOptions();
process.env.LEAF_TEST_RUN = run;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  outputDir: path.join(directory, 'results'),
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(directory, 'html') }],
    ['json', { outputFile: path.join(directory, 'report.json') }],
  ],
  use: {
    baseURL,
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
    command: `pnpm exec vite build --config tests/browser/vite.config.ts && pnpm exec vite preview --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port} --strictPort`,
    env: { LEAF_TEST_RUN: run, LEAF_TEST_PORT: String(port) },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
