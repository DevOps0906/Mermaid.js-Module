import { defineConfig } from '@playwright/test';

const preview = process.env.STUDIO_TEST_PREVIEW === '1';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  use: { baseURL: 'http://127.0.0.1:4173', headless: true, channel: 'chrome', viewport: { width: 1440, height: 1100 } },
  webServer: { command: `npm run ${preview ? 'preview' : 'dev'} -- --port 4173 --strictPort`, url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI && !preview, timeout: 30000 },
});
