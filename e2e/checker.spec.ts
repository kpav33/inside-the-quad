import { expect, type Page, test } from '@playwright/test';

const heading = (page: Page) => page.getByRole('heading', { level: 2, name: 'Check a build' });
const result = (page: Page, name: string) =>
  page
    .locator('.check-result')
    .filter({ has: page.locator('.check-result-name', { hasText: name }) });
const group = (page: Page, name: string) => page.getByRole('group', { name, exact: true });
const allFit = (page: Page) => expect(page.getByText('7 fit', { exact: true })).toBeVisible();

test('the masthead link and Next from the charger open Check a build, all fitting', async ({
  page,
}) => {
  await page.goto('/gear/charger');
  await page.getByRole('link', { name: /^End of the gear/ }).click();
  await expect(page).toHaveURL(/\/check$/);
  await expect(heading(page)).toBeFocused();
  await allFit(page);
  await expect(page.locator('.check-result[data-status="fits"]')).toHaveCount(7);
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Sections' })
    .getByRole('link', { name: 'Check a build' })
    .click();
  await expect(heading(page)).toBeFocused();
});

test('a wider camera does not fit, says why, keeps it in the address and over a reload', async ({
  page,
}) => {
  await page.goto('/check');
  await group(page, 'Camera').getByLabel('Width').selectOption({ label: '21 mm' });
  await expect(page).toHaveURL(/\/check\?camera=21$/);
  const camera = result(page, 'Camera width');
  await expect(camera).toContainText('Doesn’t fit');
  await expect(camera.getByRole('link', { name: /Frame/ })).toHaveAttribute('href', '/parts/frame');
  await page.reload();
  await expect(result(page, 'Camera width')).toContainText('Doesn’t fit');
  await expect(group(page, 'Camera').getByLabel('Width')).toHaveValue('1');
});

test('4S motors on 6S do not fit; on a 4S battery they do', async ({ page }) => {
  await page.goto('/check');
  const kv = page.getByRole('textbox', { name: 'KV' });
  await kv.fill('2400');
  await expect(result(page, 'Motor KV')).toContainText('Doesn’t fit');
  await group(page, 'Battery').getByLabel('Cells').selectOption({ label: '4S' });
  await expect(result(page, 'Motor KV')).toContainText('Fits');
  await expect(page).toHaveURL(/\/check\?kv=2400&cells=4$/);
});

test('an unreadable KV asks to be entered and stays out of the address', async ({ page }) => {
  await page.goto('/check?cells=4');
  await page.getByRole('textbox', { name: 'KV' }).fill('abc');
  await expect(result(page, 'Motor KV')).toContainText('Enter the motors’ KV');
  await expect(page).toHaveURL(/\/check\?cells=4$/);
});

test('a tampered address shows the reference values', async ({ page }) => {
  await page.goto('/check?stack=31&cells=9&kv=abc&video=x');
  await allFit(page);
  await expect(page.getByRole('textbox', { name: 'KV' })).toHaveValue('1950');
});

test('Back after several picks leaves the sheet in one step', async ({ page }) => {
  await page.goto('/gear/charger');
  await page.getByRole('link', { name: /^End of the gear/ }).click();
  await expect(heading(page)).toBeFocused();
  await group(page, 'Camera').getByLabel('Width').selectOption({ label: '14 mm' });
  await group(page, 'Battery').getByLabel('Cells').selectOption({ label: '4S' });
  await group(page, 'Props').getByLabel('Size').selectOption({ label: '4″' });
  await expect(page).toHaveURL(/props=4/);
  await page.goBack();
  await expect(page).toHaveURL(/\/gear\/charger$/);
});

test('Reset brings back the app’s drone and clears the address', async ({ page }) => {
  await page.goto('/check?camera=21&cells=4&goggles=digital');
  await expect(page.locator('.check-result[data-status="fails"]')).not.toHaveCount(0);
  await page.getByRole('button', { name: /Reset/ }).click();
  await allFit(page);
  await expect(page).toHaveURL(/\/check$/);
});

test('at 320 × 667 with 200 % text the sheet has no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto('/check?goggles=digital-analog&esc=3-8');
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await expect(
    group(page, 'Goggles').getByRole('radio', { name: 'Digital with an analog receiver' }),
  ).toBeChecked();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(0);
});
