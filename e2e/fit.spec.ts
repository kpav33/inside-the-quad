import { expect, type Page, test } from '@playwright/test';

/** Waits until the canvas holds still (camera fit, turns and lifts all ease into place). */
async function settledCanvas(page: Page): Promise<Buffer> {
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  // Overlays drawn over the canvas are not the drone.
  await page.addStyleTag({ content: '.drawing-hint, .drawing-zones { visibility: hidden; }' });
  let previous = await canvas.screenshot();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const current = await canvas.screenshot();
    if (current.equals(previous)) return current;
    previous = current;
  }
  return previous;
}

/** The box around every pixel that is not the plain ground, in canvas pixels. */
async function drawnBox(page: Page, png: Buffer) {
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('no 2d context');
    context.drawImage(image, 0, 0);
    const { data: pixels, width, height } = context.getImageData(0, 0, image.width, image.height);
    // Carbon ground #121416; anything clearly brighter is drawing.
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const diff =
          Math.abs((pixels[i] ?? 0) - 0x12) +
          Math.abs((pixels[i + 1] ?? 0) - 0x14) +
          Math.abs((pixels[i + 2] ?? 0) - 0x16);
        if (diff > 30) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    return { minX, maxX, minY, maxY, width, height };
  }, png.toString('base64'));
}

function expectInside(box: Awaited<ReturnType<typeof drawnBox>>) {
  expect(box.maxX, 'something is drawn').toBeGreaterThan(0);
  expect(box.minX).toBeGreaterThan(2);
  expect(box.minY).toBeGreaterThan(2);
  expect(box.maxX).toBeLessThan(box.width - 3);
  expect(box.maxY).toBeLessThan(box.height - 3);
}

test('the drone fills most of the drawing field on a desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const box = await drawnBox(page, await settledCanvas(page));
  expectInside(box);
  expect((box.maxX - box.minX) / box.width).toBeGreaterThanOrEqual(0.75);
});

for (const path of ['/parts/fc', '/parts/camera']) {
  test(`a tall phone shows the whole drone on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expectInside(await drawnBox(page, await settledCanvas(page)));
  });
}

test('resizing keeps the angle the visitor turned to, and the whole drone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await settledCanvas(page);
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.1);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.15, { steps: 8 });
  await page.mouse.up();

  await page.setViewportSize({ width: 900, height: 800 });
  const turned = await settledCanvas(page);
  expectInside(await drawnBox(page, turned));

  await page.goto('/');
  const fresh = await settledCanvas(page);
  expect(turned.equals(fresh)).toBe(false);
});
