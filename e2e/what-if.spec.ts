import { expect, type Page, test } from '@playwright/test';

const heading = (page: Page) => page.getByRole('heading', { level: 2, name: 'What if' });
const status = (page: Page) => page.getByTestId('flight-status');
const speeds = (page: Page) => page.locator('.motor-pin .motor-pin-speed').allInnerTexts();

/** Drags the right stick fully right and holds it there. */
async function holdRollRight(page: Page) {
  const pad = page.locator('.stick-pad[data-side="right"]');
  const box = await pad.boundingBox();
  if (!box) throw new Error('no right stick');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 4 });
}

test('the switcher and Next from How a quad moves open What if', async ({ page }) => {
  await page.goto('/moves');
  await page.getByRole('link', { name: /^Next\s*:\s*What if/ }).click();
  await expect(page).toHaveURL(/\/what-if$/);
  await expect(heading(page)).toBeFocused();
  await page.goto('/paths/control');
  await page
    .getByRole('navigation', { name: 'How it works together' })
    .getByRole('link', { name: 'What if' })
    .click();
  await expect(heading(page)).toBeFocused();
});

test('a lost link ignores the sticks, stops the motors, and Reset brings it back', async ({
  page,
}) => {
  await page.goto('/what-if');
  await expect(status(page)).toHaveText('Link OK · 6S');
  await page.getByRole('button', { name: 'Try it' }).click();
  await expect(status(page)).toContainText('Link lost');
  await holdRollRight(page);
  // The stick moves, but no motor works harder for it.
  await expect(page.getByRole('slider', { name: 'Roll' })).toHaveAttribute(
    'aria-valuetext',
    'Roll 100 % right',
  );
  await expect(page.locator('.motor-pin[data-state="up"]')).toHaveCount(0);
  await page.mouse.up();
  await expect.poll(() => speeds(page), { timeout: 4000 }).toEqual(['0 %', '0 %', '0 %', '0 %']);
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(status(page)).toHaveText('Link OK · 6S');
  await expect.poll(() => speeds(page)).not.toContain('0 %');
});

test('a prop on backwards marks motor 2 and puts the drone on the ground', async ({ page }) => {
  await page.goto('/what-if/2');
  await page.getByRole('button', { name: 'Try it' }).click();
  await expect(page.locator('.motor-pin').nth(1)).toHaveAttribute('data-fault', 'true');
  await expect.poll(() => speeds(page), { timeout: 5000 }).toEqual(['0 %', '0 %', '0 %', '0 %']);
});

test('4S tops the motors out near two-thirds', async ({ page }) => {
  await page.goto('/what-if/3');
  await page.getByRole('button', { name: '4S' }).click();
  await expect(status(page)).toHaveText('Link OK · 4S');
  const throttle = page.getByRole('slider', { name: 'Throttle' });
  await throttle.focus();
  await page.keyboard.press('End');
  await expect(throttle).toHaveAttribute('aria-valuetext', 'Throttle 100 %');
  await expect
    .poll(async () => Math.max(...(await speeds(page)).map((s) => Number.parseInt(s, 10))))
    .toBeLessThanOrEqual(70);
});

test('a VTX without its antenna heats until it is damaged', async ({ page }) => {
  // The VTX is damaged after about 12 s of drawing: wait for it in real time.
  test.setTimeout(60_000);
  await page.goto('/what-if/4');
  await page.getByRole('button', { name: 'Try it' }).click();
  await expect(page.locator('.vtx-gauge')).toBeVisible();
  await expect(status(page)).toContainText('VTX: Hot', { timeout: 30_000 });
  await expect(status(page)).toContainText('VTX: Damaged', { timeout: 30_000 });
  await expect(page.locator('.vtx-gauge')).toHaveAttribute('data-level', '3');
});

for (const height of [667, 800]) {
  test(`at 320 × ${String(height)} with 200 % text the sticks stay apart and the mistakes can be read`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height });
    await page.goto('/what-if');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await expect(page.locator('canvas')).toBeVisible();
    const left = await page.locator('.stick-pad[data-side="left"]').boundingBox();
    const right = await page.locator('.stick-pad[data-side="right"]').boundingBox();
    if (!left || !right) throw new Error('no sticks');
    expect(left.x + left.width).toBeLessThanOrEqual(right.x);

    const pinned = await page.evaluate(
      () => document.querySelector('.part-explorer-field')?.getBoundingClientRect().height ?? 0,
    );
    const texts = page.locator('.what-if-parts dd');
    const count = await texts.count();
    for (let i = 0; i < count; i++) {
      const text = texts.nth(i);
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
  });
}

test('leaving mid-fall and coming back with Back raises no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/what-if');
  await page.getByRole('button', { name: 'Try it' }).click();
  await page.waitForTimeout(1100);
  await page.getByRole('link', { name: 'Receiver' }).first().click();
  await expect(page.getByRole('heading', { level: 2, name: 'Receiver' })).toBeVisible();
  await page.goBack();
  await expect(heading(page)).toBeVisible();
  await expect(status(page)).toHaveText('Link OK · 6S');
  expect(errors).toEqual([]);
});

test('at 320 × 667 with 200 % text the drawing’s labels don’t cover one another', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto('/what-if/4');
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await page.getByRole('button', { name: 'Try it' }).click();
  await expect(page.locator('.vtx-gauge')).toBeVisible();
  await page.waitForTimeout(500);
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll('.motor-pin, .flight-status, .vtx-gauge')].map((el) => {
      const r = el.getBoundingClientRect();
      return { name: el.className, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }),
  );
  const overlaps: string[] = [];
  boxes.forEach((a, i) => {
    for (const b of boxes.slice(i + 1)) {
      const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (x > 1 && y > 1) overlaps.push(`${a.name} × ${b.name}`);
    }
  });
  expect(overlaps).toEqual([]);
});

test('the VTX is marked as the current mistake from the moment it is tried', async ({ page }) => {
  await page.goto('/what-if/4');
  await page.getByRole('button', { name: 'Try it' }).click();
  const gauge = page.locator('.vtx-gauge');
  await expect(gauge).toHaveAttribute('data-level', '1');
  const [border, accent] = await gauge.evaluate((el) => [
    getComputedStyle(el).borderTopColor,
    getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim(),
  ]);
  const hex = (rgb: string) =>
    `#${(rgb.match(/\d+/g) ?? [])
      .slice(0, 3)
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')}`;
  expect(hex(border)).toBe(accent.toLowerCase());
});
