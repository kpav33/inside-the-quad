import { devices, expect, test } from '@playwright/test';

import { PART_NAMES } from './parts';

test.use({ ...devices['Pixel 7'] });

test.describe('phone touch', () => {
  test('a one-finger swipe over the 3D view scrolls the page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Motors', exact: true }).tap();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas has no box');
    const x = box.x + box.width / 2;
    const startY = box.y + box.height * 0.8;

    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      });
    await touch('touchStart', startY);
    for (let step = 1; step <= 10; step++) await touch('touchMove', startY - step * 25);
    await touch('touchEnd', startY - 250);

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });

  test('two fingers still turn the drone, and a tap still selects a part', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(800);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas has no box');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    // A tap on the middle of the drone selects the part there (the battery, on top).
    await page.touchscreen.tap(cx, cy);
    await expect(page.locator('#lesson-panel')).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    const before = await canvas.screenshot();
    const cdp = await page.context().newCDPSession(page);
    const points = (dx: number) => [
      { x: cx - 60 + dx, y: cy, id: 0 },
      { x: cx + 60 + dx, y: cy, id: 1 },
    ];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(0) });
    for (let step = 1; step <= 10; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: points(step * 15),
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(300);
    const after = await canvas.screenshot();

    expect(after.equals(before)).toBe(false);
  });

  test('choosing a part brings its lesson onto the screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Motors', exact: true }).tap();
    await expect(page.getByRole('heading', { level: 2, name: 'Motors' })).toBeInViewport();
  });

  test('the drawing field takes about 40% of the screen', async ({ page }) => {
    await page.goto('/');
    const ratio = await page.evaluate(() => {
      const frame = document.querySelector('.drawing-canvas');
      return frame ? frame.getBoundingClientRect().height / window.innerHeight : 0;
    });
    expect(ratio).toBeGreaterThan(0.35);
    expect(ratio).toBeLessThan(0.45);
  });

  test('part rows are comfortable touch targets', async ({ page }) => {
    await page.goto('/');
    for (const name of PART_NAMES) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(box?.height ?? 0, name).toBeGreaterThanOrEqual(44);
    }
  });
});
