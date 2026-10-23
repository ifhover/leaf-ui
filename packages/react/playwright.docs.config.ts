import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { browserOptions } from './scripts/browser-options.mjs';

const { baseURL, directory, port, run } = browserOptions({
  ...process.env,
  LEAF_TEST_PORT: process.env.LEAF_TEST_PORT ?? '4190',
});
process.env.LEAF_TEST_RUN = run;

export default defineConfig({
  testDir: './tests/docs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Clipboard contents are shared by pages in the browser process.
  workers: 1,
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
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm --dir ../../apps/docs exec rspress preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
});
