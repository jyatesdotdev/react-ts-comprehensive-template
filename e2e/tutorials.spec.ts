import { test, expect } from '@playwright/test';

test('take tutorials screenshot', async ({ page }) => {
  await page.goto('/tutorials');
  await expect(page.locator('h1')).toContainText('Research Lab Tutorials');
  await page.screenshot({ path: 'e2e/screenshots/tutorials-overview.png', fullPage: true });
  
  await page.click('text=Adding POCs');
  await expect(page.locator('h1')).toContainText('Adding a New POC');
  await page.screenshot({ path: 'e2e/screenshots/tutorials-adding.png', fullPage: true });

  await page.click('text=WebGL / 3D');
  await expect(page.locator('h1')).toContainText('WebGL (Three.js)');
  await page.screenshot({ path: 'e2e/screenshots/tutorials-webgl.png', fullPage: true });
});
