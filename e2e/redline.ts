import type { Page } from '@playwright/test';

/**
 * Counts the canvas pixels drawn in redline (the selected part's fill), by decoding a screenshot
 * of the canvas in the page. Shading changes the exact colour, so it counts reddish pixels.
 */
export async function redlinePixels(page: Page): Promise<number> {
  const png = await page.locator('canvas').screenshot();
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      if (r > 120 && r > g * 1.8 && r > b * 1.8) count++;
    }
    return count;
  }, png.toString('base64'));
}
