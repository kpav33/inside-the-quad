import { expect, type Page, test } from '@playwright/test';

test.describe('base styles', () => {
  test('the page sits on the carbon ground', async ({ page }) => {
    await page.goto('/');
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe('rgb(18, 20, 22)');
  });

  test('buttons use the page fonts, not the browser default', async ({ page }) => {
    await page.goto('/');
    const family = await page
      .getByRole('button', { name: 'Motors', exact: true })
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).not.toMatch(/^Arial/);
    expect(family).toMatch(/Barlow Condensed|Atkinson Hyperlegible/);
  });

  test('keyboard focus is clearly visible', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Frame', exact: true });
    await button.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const outline = await button.evaluate((el) => {
      const style = getComputedStyle(el);
      return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  test('the self-hosted fonts load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    // fonts.check() is true when no face matches at all, so look for loaded faces instead.
    const loaded = await page.evaluate(() =>
      ['Barlow Condensed', 'Atkinson Hyperlegible'].map((family) =>
        [...document.fonts].some(
          (f) => f.family.replace(/"/g, '') === family && f.status === 'loaded',
        ),
      ),
    );
    expect(loaded).toEqual([true, true]);
  });
});

test.describe('layout robustness', () => {
  async function stretchText(page: Page) {
    // Simulate a translation about 40% longer: lengthen every word in the sheet column.
    await page.evaluate(() => {
      const root = document.querySelector('.part-explorer');
      if (!root) throw new Error('no explorer');
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        node.textContent = (node.textContent ?? '').replace(
          /[A-Za-z]{3,}/g,
          (w) => w + w.slice(0, Math.ceil(w.length * 0.4)),
        );
      }
    });
  }

  test('a 40% longer translation fits a 320 px screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const part of ['Frame', 'Motors', 'Propellers']) {
      // Stretching renames the buttons too, so start each part from a fresh page.
      await page.goto('/');
      await page.getByRole('button', { name: part, exact: true }).click();
      await stretchText(page);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${part} lesson`).toBeLessThanOrEqual(0);
    }
  });

  test('200% text size fits a 1280 px screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await page.getByRole('button', { name: 'Motors', exact: true }).click();
    const overflow = await page.evaluate(() => {
      const sheet = document.querySelector('.part-explorer-sheet');
      return {
        page: document.documentElement.scrollWidth - window.innerWidth,
        sheet: sheet ? sheet.scrollWidth - sheet.clientWidth : 0,
      };
    });
    expect(overflow.page).toBeLessThanOrEqual(0);
    expect(overflow.sheet).toBeLessThanOrEqual(0);
  });

  test('the lesson title shows focus after following a connection', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Motors', exact: true }).click();
    await page.getByRole('button', { name: /propeller slides onto/ }).press('Enter');
    const title = page.getByRole('heading', { level: 2, name: 'Propellers' });
    await expect(title).toBeFocused();
    const outline = await title.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
  });
});

test('a desktop lesson never makes the whole page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Motors', exact: true }).click();
  const extra = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(extra).toBeLessThanOrEqual(0);
});
