import { test, expect } from '@playwright/test';

// NOTE: This list is maintained by hand — it is NOT derived from POC_CONFIG
// (src/config/pocs.ts imports React/lazy components and cannot be imported here).
// When you add or remove a POC, update this array so it keeps full coverage.
const POC_PATHS = [
  '/',
  '/pocs/ralph-experiment',
  '/pocs/webgl',
  '/pocs/webgl-template',
  '/pocs/todo',
  '/pocs/api',
  '/pocs/webrtc',
  '/pocs/websocket',
  '/pocs/template',
  '/pocs/dashboard-test'
];

test.beforeAll(async () => {
  // Wait for the backend API to be ready to avoid 502 errors during the test
  const maxRetries = 20;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:3001/');
      if (response.ok) break;
    } catch {
      // Ignore and retry
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
});

test.describe('POC UI Verification', () => {
  for (const path of POC_PATHS) {
    test(`verify ${path} UI and take screenshot`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      page.on('pageerror', exception => {
        consoleErrors.push(exception.message);
      });

      await page.goto(path);
      
      // Wait for content to load
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      // Special wait for WebGL
      if (path.includes('webgl')) {
        await page.waitForTimeout(2000); // Give Three.js time to render
      }

      // Capture screenshot
      const safeName = path.replace(/^\//, '').replace(/\//g, '-') || 'home';
      await page.screenshot({ path: `e2e/screenshots/${safeName}.png`, fullPage: true });

      // Verify no console errors
      expect(consoleErrors, `Found console errors on ${path}: ${consoleErrors.join(', ')}`).toHaveLength(0);
    });
  }
});
