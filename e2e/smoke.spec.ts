import { expect, test } from '@playwright/test';

test('home page renders the title and the 3D canvas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Console errors include Content-Security-Policy violations when running against nginx.
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle('Inside the Quad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inside the Quad');
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('page stays usable when the 3D viewer chunk fails to load', async ({ page }) => {
  await page.route(/\/(assets|src\/features\/drone-viewer)\/.*DroneViewer/, (route) =>
    route.abort(),
  );

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inside the Quad');
  await expect(page.getByRole('alert')).toContainText('3D model couldn’t be loaded');
});
