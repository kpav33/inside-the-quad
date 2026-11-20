import { expect, test } from '@playwright/test';

import { CHECKER } from './features';

test.describe('in the release, Check a build is held back', () => {
  test.skip(CHECKER, 'this build has Check a build switched on');

  test('/check is an unknown address and nothing links to it', async ({ page }) => {
    await page.goto('/check?camera=21');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.part-explorer-notice')).toContainText('There’s no part called');
    await expect(page.getByRole('navigation', { name: 'Sections' }).getByRole('link')).toHaveCount(
      3,
    );
    await page.goto('/gear/charger');
    await expect(page.getByRole('link', { name: /^Next ?: Back to overview$/ })).toBeVisible();
  });
});
