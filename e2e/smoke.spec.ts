import { expect, test } from '@playwright/test';

test('home page renders the title and the 3D canvas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('Inside the Quad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inside the Quad');
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
