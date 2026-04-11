import { test, expect } from '@playwright/test';

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/React \+ TS Template/);

  // Go to WebGL
  await page.click('text=WebGL');
  await expect(page).toHaveURL(/.*webgl/);
  await expect(page.locator('h1')).toContainText('WebGL POC');

  // Go to API
  await page.click('text=API');
  await expect(page).toHaveURL(/.*api/);
  await expect(page.locator('h1')).toContainText('Backend API POC');

  // Go back Home
  await page.click('text=Home');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toContainText('React + TS Template');
});
