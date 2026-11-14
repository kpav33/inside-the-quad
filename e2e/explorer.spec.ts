import { expect, type Page, test } from '@playwright/test';

import { PART_NAMES } from './parts';
import { redlinePixels } from './redline';

const lessonHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true });

async function canvasBox(page: Page) {
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  // Wait until the picture holds still: the camera fit and the stack both ease into place.
  let previous = await canvas.screenshot();
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(100);
    const current = await canvas.screenshot();
    if (current.equals(previous)) break;
    previous = current;
  }
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

/**
 * Points on the canvas (as fractions of its size) that land on a part with the default camera in
 * the 1280 × 720 test viewport, with the camera fitted to the drone's outline. Found by clicking a
 * grid over the canvas, one fresh page per point.
 */
const POINTS = {
  battery: { x: 0.5, y: 0.45 },
  frameArm: { x: 0.4, y: 0.6 },
  camera: { x: 0.55, y: 0.625 },
  // With the frame open:
  liftedFc: { x: 0.495, y: 0.45 },
  liftedBattery: { x: 0.5, y: 0.3 },
};

async function clickAt(page: Page, point: { x: number; y: number }) {
  const box = await canvasBox(page);
  await page.mouse.click(box.x + box.width * point.x, box.y + box.height * point.y);
}

test('mouse: click a part in 3D, then the background', async ({ page }) => {
  await page.goto('/');

  // The battery sits on top, in the middle of the view.
  await clickAt(page, POINTS.battery);
  await expect(lessonHeading(page, 'Battery')).toBeVisible();

  await clickAt(page, POINTS.frameArm);
  await expect(lessonHeading(page, 'Frame')).toBeVisible();

  await clickAt(page, { x: 0.01, y: 0.01 });
  await expect(lessonHeading(page, 'Frame')).toBeHidden();
});

test('mouse: a faded part still opens its sheet', async ({ page }) => {
  // On the Propellers sheet the battery is unrelated, so it is drawn faded.
  await page.goto('/parts/props');
  await expect(lessonHeading(page, 'Propellers')).toBeVisible();

  await clickAt(page, POINTS.battery);
  await expect(lessonHeading(page, 'Battery')).toBeVisible();
  await expect(page).toHaveURL(/\/parts\/battery$/);
});

test('mouse: hovering a part in 3D lights up its parts-list row', async ({ page }) => {
  await page.goto('/');
  const box = await canvasBox(page);
  const row = page.getByRole('button', { name: 'Battery', exact: true });

  await page.mouse.move(
    box.x + box.width * POINTS.battery.x,
    box.y + box.height * POINTS.battery.y,
  );
  await expect(row).toHaveAttribute('data-hovered', 'true');

  await page.mouse.move(box.x + 4, box.y + 4);
  await expect(page.locator('[data-hovered="true"]')).toHaveCount(0);
});

test('mouse: a hover never carries over to the next sheet', async ({ page }) => {
  await page.goto('/');
  const box = await canvasBox(page);
  // Hover the battery and click it without moving: its sheet opens under a resting mouse.
  await page.mouse.move(
    box.x + box.width * POINTS.battery.x,
    box.y + box.height * POINTS.battery.y,
  );
  await page.mouse.down();
  await page.mouse.up();
  await expect(lessonHeading(page, 'Battery')).toBeVisible();

  // Open another sheet from the keyboard while the mouse still rests on the battery.
  await page.getByRole('button', { name: 'Motors', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(lessonHeading(page, 'Motors')).toBeVisible();
  await expect(page.locator('[data-hovered="true"]')).toHaveCount(0);
});

test('mouse: the open stack keeps every layer clickable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ESC', exact: true }).click();
  await expect(lessonHeading(page, 'ESC')).toBeVisible();

  // canvasBox waits for the stack to finish opening.
  await clickAt(page, POINTS.liftedFc);
  await expect(lessonHeading(page, 'Flight controller')).toBeVisible();

  await clickAt(page, POINTS.liftedBattery);
  await expect(lessonHeading(page, 'Battery')).toBeVisible();

  // Selecting the battery closes the stack; the background clears the selection.
  await clickAt(page, { x: 0.01, y: 0.01 });
  await expect(lessonHeading(page, 'Battery')).toBeHidden();
});

test('mouse: the camera is clickable at the front', async ({ page }) => {
  await page.goto('/');
  await clickAt(page, POINTS.camera);
  await expect(lessonHeading(page, 'Camera')).toBeVisible();
});

test('list: every part opens its own lesson', async ({ page }) => {
  await page.goto('/');
  for (const part of PART_NAMES) {
    await page.getByRole('button', { name: part, exact: true }).click();
    await expect(lessonHeading(page, part)).toBeVisible();
  }
});

test('keyboard: a stack board opens and closes from the part list', async ({ page }) => {
  await page.goto('/');
  const esc = page.getByRole('button', { name: 'ESC', exact: true });
  await esc.focus();
  await page.keyboard.press('Enter');
  await expect(lessonHeading(page, 'ESC')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(lessonHeading(page, 'ESC')).toBeHidden();
  await expect(esc).toBeFocused();
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

    for (const part of PART_NAMES) {
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

test('resizing the window while the stack is open keeps the closed drone framed', async ({
  page,
}) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await canvasBox(page);
  const before = await canvas.screenshot();

  await page.getByRole('button', { name: 'ESC', exact: true }).click();
  await canvasBox(page);
  const size = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.setViewportSize({ width: size.width - 200, height: size.height });
  await canvasBox(page);
  await page.setViewportSize(size);
  await canvasBox(page);
  await page.keyboard.press('Escape');

  await canvasBox(page);
  expect((await canvas.screenshot()).equals(before)).toBe(true);
});

test('every selected part shows clearly, turning the drone when it has to', async ({ page }) => {
  test.setTimeout(120_000);
  for (const part of PART_NAMES) {
    await page.goto('/');
    await page.getByRole('button', { name: part, exact: true }).click();
    await canvasBox(page);
    expect(await redlinePixels(page), part).toBeGreaterThanOrEqual(150);
  }
});

test('turning on reduced motion mid-visit makes the next change instant', async ({ page }) => {
  // Count the animation frames in which three.js draws, by wrapping WebGL's draw calls.
  await page.addInitScript(() => {
    const frames = new Set<number>();
    let frame = 0;
    const tick = () => {
      frame++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      // Wrapped and called with the original receiver, so the unbound reference is intended.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const draw = proto.drawElements;
      proto.drawElements = function (this: WebGLRenderingContext, ...args) {
        frames.add(frame);
        draw.apply(this, args);
      };
    }
    Object.assign(window, { drawnFrames: () => frames.size });
  });
  await page.goto('/');
  await canvasBox(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const drawn = () =>
    page.evaluate(() => (window as unknown as { drawnFrames: () => number }).drawnFrames());
  const before = await drawn();
  await page.getByRole('button', { name: 'ESC', exact: true }).click();
  await page.waitForTimeout(600);
  // Easing the stack apart draws a dozen or more frames; an instant change draws one or two.
  expect((await drawn()) - before).toBeLessThanOrEqual(4);
});
