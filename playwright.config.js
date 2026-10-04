import { defineConfig } from '@playwright/test';
// Tests run against a build with the same base path as GitHub Pages, so broken paths are caught.
export default defineConfig({
  testDir: 'tests',
  webServer: { command: 'BASE=/portfolio-v3/ npm run build && npm run preview', url: 'http://localhost:4173/portfolio-v3/', reuseExistingServer: false },
  use: { baseURL: 'http://localhost:4173/portfolio-v3/' },
});
