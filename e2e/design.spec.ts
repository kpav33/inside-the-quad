import { expect, test } from '@playwright/test';

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
