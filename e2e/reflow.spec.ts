import { expect, type Page, test } from '@playwright/test';

import { stretchText } from './stretch';

const PAGES = [
  '/',
  '/intro',
  ...['frame', 'motors', 'props', 'esc', 'fc', 'battery', 'strap']
    .concat(['receiver', 'camera', 'vtx', 'extras'])
    .map((id) => `/parts/${id}`),
];

const enlarge = async (page: Page) => {
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
};

/** Sideways page scroll, and any element in the sheet wider than its box (a table frame may scroll). */
async function overflow(page: Page) {
  await expect(page.locator('canvas')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(0)
    .catch(() => undefined);
  return page.evaluate(() => ({
    page: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    elements: [...document.querySelectorAll('.part-explorer-sheet *')]
      // Skip a table frame that may scroll, and anything hidden in a 1px box on purpose.
      .filter((el) => !el.closest('.size-table-frame') && el.clientWidth > 1)
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
      .slice(0, 5),
  }));
}

for (const width of [320, 390]) {
  for (const [mode, apply] of [
    ['200% text', enlarge],
    ['40% longer text', stretchText],
  ] as const) {
    test(`every sheet reflows at ${width} px with ${mode}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 800 });
      const problems: string[] = [];
      for (const path of PAGES) {
        await page.goto(path);
        await expect(page.locator('canvas')).toBeVisible();
        await apply(page);
        const found = await overflow(page);
        if (found.page > 0 || found.elements.length > 0) {
          problems.push(`${path}: page +${found.page}px ${found.elements.join(' ')}`);
        }
      }
      expect(problems).toEqual([]);
    });
  }
}
