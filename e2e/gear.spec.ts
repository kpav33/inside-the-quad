import { expect, type Page, test } from '@playwright/test';

const heading = (page: Page, name: string) => page.getByRole('heading', { level: 2, name });
const says = (page: Page) => page.getByTestId('gear-says');
const drawn = (page: Page, part: string) => page.locator(`.gear-drawing [data-part="${part}"]`);
const pick = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click();

test('Next from What if and the masthead both open the radio', async ({ page }) => {
  await page.goto('/what-if');
  await page.getByRole('link', { name: /^End of How it works together/ }).click();
  await expect(page).toHaveURL(/\/gear\/radio$/);
  await expect(heading(page, 'Radio')).toBeFocused();
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Sections' })
    .getByRole('link', { name: 'The gear' })
    .click();
  await expect(heading(page, 'Radio')).toBeFocused();
});

test('arming the radio moves its lever and says so, and opening it again starts afresh', async ({
  page,
}) => {
  await page.goto('/gear/radio');
  const lever = drawn(page, 'arm-switch').locator('[data-position]');
  await expect(lever).toHaveAttribute('data-position', 'disarmed');
  await pick(page, 'Armed');
  await expect(lever).toHaveAttribute('data-position', 'armed');
  await expect(says(page)).toContainText('Armed, acro');
  const gear = page.getByRole('navigation', { name: 'The gear you hold and wear' });
  await gear.getByRole('link', { name: 'Goggles' }).click();
  await gear.getByRole('link', { name: 'Radio' }).click();
  await expect(lever).toHaveAttribute('data-position', 'disarmed');
});

test('digital goggles show no signal from this drone', async ({ page }) => {
  await page.goto('/gear/goggles');
  await expect(drawn(page, 'screens').locator('[data-picture]')).toHaveCount(2);
  await pick(page, 'Digital');
  await expect(drawn(page, 'screens')).toContainText(/no signal/i);
  await expect(says(page)).toContainText('no signal');
});

test('storage settles the six cells at 3.8 V, 22.8 V for the pack', async ({ page }) => {
  await page.goto('/gear/charger');
  await pick(page, 'Storage');
  const cells = page.locator('.gear-drawing [data-volts]');
  await expect(cells).toHaveCount(6);
  for (const cell of await cells.all()) await expect(cell).toHaveAttribute('data-volts', '3.8');
  await expect(says(page)).toContainText('22.8');
});

test('pointing at a part’s name lights it on the drawing', async ({ page }) => {
  await page.goto('/gear/radio');
  await page.getByRole('button', { name: 'Mode switch', exact: true }).hover();
  await expect(drawn(page, 'mode-switch')).toHaveAttribute('data-highlight', 'true');
  await expect(drawn(page, 'screen')).toHaveAttribute('data-highlight', 'false');
});

test('the control path’s first stop leads to the radio', async ({ page }) => {
  await page.goto('/paths/control');
  await page
    .getByRole('list', { name: 'Stops' })
    .getByRole('link', { name: 'Radio', exact: true })
    .click();
  await expect(page).toHaveURL(/\/gear\/radio$/);
  await expect(heading(page, 'Radio')).toBeFocused();
});

test('an unknown piece of gear shows the unknown-address notice', async ({ page }) => {
  await page.goto('/gear/drone');
  await expect(page.locator('.part-explorer-notice')).toContainText('drone');
  await expect(page).toHaveURL(/\/$/);
});

for (const id of ['radio', 'goggles', 'charger']) {
  test(`at 320 × 667 with 200 % text the ${id} sheet reads below its pinned drawing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 667 });
    await page.goto(`/gear/${id}`);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await expect(page.locator('.gear-drawing')).toBeVisible();
    const pinned = await page.evaluate(
      () => document.querySelector('.part-explorer-field')?.getBoundingClientRect().height ?? 0,
    );
    const texts = page.locator('.lesson-panel p');
    const count = await texts.count();
    for (let i = 0; i < count; i++) {
      const text = texts.nth(i);
      if (!(await text.isVisible())) continue;
      await text.evaluate((el, under) => {
        window.scrollBy({ top: el.getBoundingClientRect().top - under - 4, behavior: 'instant' });
      }, pinned);
      const box = await text.boundingBox();
      if (!box) throw new Error('no text');
      expect(
        await text.evaluate(
          (el, y) => el.contains(document.elementFromPoint(el.getBoundingClientRect().left + 8, y)),
          box.y + 10,
        ),
      ).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    // The drawing's labels never cover one another.
    const labels = await page.evaluate(() =>
      [...document.querySelectorAll('.gear-drawing text:not(.gear-screen-text)')].map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      }),
    );
    labels.forEach((a, i) => {
      for (const b of labels.slice(i + 1)) {
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        expect(x > 1 && y > 1).toBe(false);
      }
    });
  });
}
