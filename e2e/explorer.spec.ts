import { expect, type Page, test } from '@playwright/test';

const lessonHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true });

async function canvasBox(page: Page) {
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  // Give three.js a frame to render before clicking into the scene.
  await page.waitForTimeout(500);
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  return box;
}

test('keyboard: open and close a lesson from the part list', async ({ page }) => {
  await page.goto('/');
  const frame = page.getByRole('button', { name: 'Frame', exact: true });
  // Tab from the top of the page until the Frame button has focus.
  for (let i = 0; i < 10 && !(await frame.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(frame).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(lessonHeading(page, 'Frame')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(lessonHeading(page, 'Frame')).toBeHidden();
  await expect(frame).toBeFocused();
});

test('mouse: click a part in 3D, then the background', async ({ page }) => {
  await page.goto('/');
  const box = await canvasBox(page);

  // The camera looks at the centre of the frame.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(lessonHeading(page, 'Frame')).toBeVisible();

  await page.mouse.click(box.x + 10, box.y + 10);
  await expect(lessonHeading(page, 'Frame')).toBeHidden();
});

test('mouse: rotating the camera never changes the selection', async ({ page }) => {
  await page.goto('/');
  const box = await canvasBox(page);
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.getByRole('button', { name: 'Motors', exact: true }).click();
  await expect(lessonHeading(page, 'Motors')).toBeVisible();

  // Drag from the background so the drag ends over the frame.
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(centre.x, centre.y, { steps: 10 });
  await page.mouse.up();
  await expect(lessonHeading(page, 'Motors')).toBeVisible();

  // Drag from the frame so the drag ends over the background.
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.down();
  await page.mouse.move(box.x + 10, box.y + 10, { steps: 10 });
  await page.mouse.up();
  await expect(lessonHeading(page, 'Motors')).toBeVisible();
});

test('mouse: a drag that starts and ends on the drone keeps the selection', async ({ page }) => {
  await page.goto('/');
  const box = await canvasBox(page);
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.getByRole('button', { name: 'Motors', exact: true }).click();
  await expect(lessonHeading(page, 'Motors')).toBeVisible();

  // Rotate the camera, then release 8 px from the start, still over the frame. three.js reports
  // this as a click on the frame; the explorer must treat it as a drag.
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.down();
  await page.mouse.move(centre.x + 80, centre.y, { steps: 10 });
  await page.mouse.move(centre.x + 8, centre.y, { steps: 10 });
  await page.mouse.up();

  await expect(lessonHeading(page, 'Motors')).toBeVisible();
  await expect(lessonHeading(page, 'Frame')).toBeHidden();
});

for (const width of [390, 320]) {
  test.describe(`phone width ${width} px`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const part of ['Frame', 'Motors', 'Propellers']) {
      test(`${part} lesson fits without horizontal scrolling`, async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: part, exact: true }).click();

        const heading = lessonHeading(page, part);
        await heading.scrollIntoViewIfNeeded();
        await expect(heading).toBeInViewport();

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollWidth).toBeLessThanOrEqual(width);
      });
    }

    test('canvas keeps a usable height', async ({ page }) => {
      await page.goto('/');
      // A new canvas starts at the default 300 × 150 until three.js sizes it to its container.
      const canvas = page.locator('canvas');
      await expect
        .poll(async () => (await canvas.boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(250);
    });
  });
}
