import { expect, type Page, test } from '@playwright/test';

const heading = (page: Page) => page.getByRole('heading', { level: 2, name: 'How a quad moves' });

const currentStep = (page: Page) =>
  page.getByRole('list', { name: 'Steps' }).locator('[aria-current="step"]');

/** A motor balloon's speed in %, read from the drawing. */
async function speed(page: Page, motor: number): Promise<number> {
  const text = await page
    .locator('.motor-pin')
    .nth(motor - 1)
    .locator('.motor-pin-speed')
    .innerText();
  return Number.parseInt(text, 10);
}

/** Drags the right stick fully right and holds it there. */
async function holdRollRight(page: Page) {
  const pad = page.locator('.stick-pad[data-side="right"]');
  const box = await pad.boundingBox();
  if (!box) throw new Error('no right stick');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width, box.y + box.height / 2, { steps: 4 });
}

test.beforeEach(async ({ page }) => {
  // Demos would move the sticks on their own; these tests drive them by hand.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('the next sheet after the video path is How a quad moves', async ({ page }) => {
  await page.goto('/paths/video');
  await page.getByRole('link', { name: /^Next\s*:\s*How a quad moves/ }).click();
  await expect(page).toHaveURL(/\/moves$/);
  await expect(heading(page)).toBeFocused();
  await expect(currentStep(page)).toContainText('Throttle');
});

test('rolling right speeds up the left motors, and centring holds them level', async ({ page }) => {
  await page.goto('/moves/2');
  await expect(page.locator('.motor-pin')).toHaveCount(4);
  await holdRollRight(page);
  await expect(page.locator('.motor-pin[data-state="up"]')).toHaveCount(2);
  expect(await speed(page, 3)).toBeGreaterThan(await speed(page, 1));
  expect(await speed(page, 4)).toBeGreaterThan(await speed(page, 2));
  await page.mouse.up();
  await expect(page.locator('.motor-pin[data-state="up"]')).toHaveCount(0);
  await expect(page.getByRole('slider', { name: 'Roll' })).toHaveAttribute(
    'aria-valuetext',
    'Roll centred',
  );
});

test('a stick works from the keyboard and springs back on release', async ({ page }) => {
  await page.goto('/moves/2');
  const roll = page.getByRole('slider', { name: 'Roll' });
  await roll.focus();
  await page.keyboard.down('ArrowRight');
  await expect(roll).toHaveAttribute('aria-valuetext', /^Roll \d+ % right$/);
  await page.keyboard.up('ArrowRight');
  await expect(roll).toHaveAttribute('aria-valuetext', 'Roll centred');
});

test('Next step moves the step and the address; Level and Gust work', async ({ page }) => {
  await page.goto('/moves');
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page).toHaveURL(/\/moves\/2$/);
  await expect(currentStep(page)).toContainText('Roll');
  await page.getByRole('button', { name: 'Gust' }).click();
  await page.getByRole('button', { name: 'Gyro loop: staying where you put it' }).click();
  await expect(
    page.getByRole('table', { name: 'What the flight controller compares' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Level' }).click();
  await expect(page.locator('.motor-pin[data-state="up"]')).toHaveCount(0);
});

test('with motion reduced, a step’s demo waits for Show me', async ({ page }) => {
  await page.goto('/moves/2');
  await page.waitForTimeout(400);
  const roll = page.getByRole('slider', { name: 'Roll' });
  await expect(roll).toHaveAttribute('aria-valuetext', 'Roll centred');
  await page.getByRole('button', { name: 'Show me' }).click();
  await expect(roll).toHaveAttribute('aria-valuetext', 'Roll 100 % right');
});

test('on a phone, the drone and both sticks stay in view down to the last step', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/moves/5');
  await page.getByRole('link', { name: /^Previous\s*:\s*Video path/ }).scrollIntoViewIfNeeded();
  const canvas = await page.locator('canvas').boundingBox();
  if (!canvas) throw new Error('no canvas');
  expect(canvas.y).toBeGreaterThanOrEqual(0);
  for (const side of ['left', 'right']) {
    const pad = await page.locator(`.stick-pad[data-side="${side}"]`).boundingBox();
    if (!pad) throw new Error(`no ${side} stick`);
    expect(pad.y).toBeGreaterThanOrEqual(0);
    expect(pad.y + pad.height).toBeLessThanOrEqual(667);
    // The sticks sit below the drone's own area, never over it.
    expect(pad.y).toBeGreaterThanOrEqual(canvas.y + canvas.height - 1);
  }
});

test('leaving mid-demo and coming back with Back raises no errors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/moves/4');
  await page.getByRole('link', { name: 'Propellers' }).first().click();
  await expect(page.getByRole('heading', { level: 2, name: 'Propellers' })).toBeVisible();
  await page.waitForTimeout(2500);
  await page.goBack();
  await expect(heading(page)).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Throttle' })).toHaveAttribute(
    'aria-valuetext',
    'Throttle 50 %',
  );
  expect(errors).toEqual([]);
});
