import { test, expect } from '@playwright/test';

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Research Lab');

  // Open Experiments dropdown
  await page.click('button:has-text("Experiments")');

  // Go to WebGL
  await page.click('a:has-text("WebGL"):not(:has-text("Template"))');
  await expect(page).toHaveURL(/.*webgl/);
  await expect(page.locator('h1')).toContainText('WebGL Graphics');

  // Go back Home
  await page.click('text=Back to Home');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toContainText('Research Lab');
});
