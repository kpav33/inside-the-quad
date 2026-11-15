import { expect, type Page, test } from '@playwright/test';

const pathHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name: `${name} path` });

const currentStop = (page: Page) =>
  page.getByRole('list', { name: 'Stops' }).locator('[aria-current="step"]');

/** Each path's stops, and its off-drone ends (each drawn with a label as well as a balloon). */
const PATHS = {
  control: { stops: 6, ends: 1 },
  power: { stops: 6, ends: 0 },
  video: { stops: 5, ends: 1 },
} as const;

test('the masthead opens the control path, its heading focused', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'How it works together' }).click();
  await expect(page).toHaveURL(/\/paths\/control$/);
  await expect(pathHeading(page, 'Control')).toBeFocused();
  await expect(page.locator('.path-pin[data-state="current"]')).toHaveCount(1);
});

test('stepping moves the current stop on the sheet and on the drawing', async ({ page }) => {
  await page.goto('/paths/control');
  await expect(currentStop(page)).toContainText('Your radio');
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(currentStop(page)).toContainText('Flight controller');
  await expect(page.locator('.path-pin[data-state="current"] .path-marker')).toHaveText('3');
  await expect(page.locator('.path-pin[data-state="passed"]')).toHaveCount(2);
});

test('the next sheet after Extras is the control path', async ({ page }) => {
  await page.goto('/parts/extras');
  await page
    .getByRole('link', {
      name: /^End of the parts\s*: How it works together, sheet 1: Control path/,
    })
    .click();
  await expect(pathHeading(page, 'Control')).toBeFocused();
});

test('Back from one path to another lands on its heading, at the step it was on', async ({
  page,
}) => {
  await page.goto('/paths/control');
  await page.getByRole('button', { name: 'Next step' }).click();
  await page
    .getByRole('navigation', { name: 'Paths' })
    .getByRole('link', { name: 'Power' })
    .click();
  await expect(pathHeading(page, 'Power')).toBeFocused();
  await page.goBack();
  await expect(pathHeading(page, 'Control')).toBeFocused();
  await expect(currentStop(page)).toContainText('Receiver');
});

test('Back from a lesson opened at a stop returns to that stop', async ({ page }) => {
  await page.goto('/paths/control');
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page).toHaveURL(/\/paths\/control\/3$/);
  await page
    .getByRole('list', { name: 'Stops' })
    .getByRole('link', { name: 'Flight controller' })
    .click();
  await expect(page.getByRole('link', { name: 'Back to Control path, step 3' })).toBeVisible();
  await page.goBack();
  await expect(pathHeading(page, 'Control')).toBeFocused();
  await expect(currentStop(page)).toContainText('Flight controller');
});

test('reduced motion still plays the path, a stop at a time', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/paths/video');
  await page.getByRole('button', { name: 'Play the path' }).click();
  await expect(currentStop(page)).toContainText('Flight controller', { timeout: 6000 });
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByRole('button', { name: 'Play the path' })).toBeVisible();
});

for (const [width, height] of [
  [1280, 720],
  [390, 844],
] as const) {
  for (const [path, { stops: count, ends }] of Object.entries(PATHS)) {
    test(`every ${path} pin stays inside the drawing at ${String(width)} px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/paths/${path}`);
      for (let i = 1; i < count; i++) {
        await page.getByRole('button', { name: 'Next step' }).click();
      }
      // Let the view finish turning to the last stop.
      await page.waitForTimeout(1200);
      const field = await page.locator('.drawing-canvas').boundingBox();
      if (!field) throw new Error('no drawing');
      const pins = page.locator('.path-marker, .path-end');
      await expect(pins).toHaveCount(count + ends);
      for (const box of await pins.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect),
      )) {
        expect(box.left, path).toBeGreaterThanOrEqual(field.x);
        expect(box.top, path).toBeGreaterThanOrEqual(field.y);
        expect(box.right, path).toBeLessThanOrEqual(field.x + field.width);
        expect(box.bottom, path).toBeLessThanOrEqual(field.y + field.height);
      }
    });
  }
}

for (const [width, height] of [
  [1280, 720],
  [390, 844],
] as const) {
  for (const [path, { stops: count }] of Object.entries(PATHS)) {
    test(`no ${path} balloon or label covers another at ${String(width)} px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/paths/${path}`);
      for (let step = 0; step < count; step++) {
        if (step > 0) await page.getByRole('button', { name: 'Next step' }).click();
        // Let the view finish turning to this stop.
        await page.waitForTimeout(900);
        const boxes = await page
          .locator('.path-pin:not([data-state="hidden"]) .path-marker, .path-end')
          .evaluateAll((els) =>
            els.map((el) => {
              const r = el.getBoundingClientRect();
              return {
                text: el.textContent,
                left: r.left,
                right: r.right,
                top: r.top,
                bottom: r.bottom,
              };
            }),
          );
        boxes.forEach((a, i) => {
          for (const b of boxes.slice(i + 1)) {
            const covers =
              a.left < b.right - 1 &&
              b.left < a.right - 1 &&
              a.top < b.bottom - 1 &&
              b.top < a.bottom - 1;
            expect(covers, `${path} stop ${String(step + 1)}: ${a.text} over ${b.text}`).toBe(
              false,
            );
          }
        });
      }
    });
  }
}
