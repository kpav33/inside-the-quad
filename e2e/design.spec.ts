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

  test('long translated words stay inside the title block and parts list', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const part of [null, 'Frame', 'Motors', 'Propellers']) {
      await page.goto('/');
      if (part) await page.getByRole('button', { name: part, exact: true }).click();
      await stretchText(page);
      const overflowing = await page.evaluate(() =>
        [...document.querySelectorAll('.title-block-cell, .part-list-row')]
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.textContent),
      );
      expect(overflowing, part ?? 'overview').toEqual([]);
    }
  });

  test('200% text fits a 390 px phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await page.getByRole('button', { name: 'Motors', exact: true }).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
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

test.describe('drawing field at large text sizes', () => {
  async function fieldGeometry(page: Page) {
    return page.evaluate(() => {
      const box = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`missing ${selector}`);
        return el.getBoundingClientRect();
      };
      const viewer = box('.part-explorer-viewer');
      const list = box('.part-list');
      const overlap =
        viewer.left < list.right &&
        list.left < viewer.right &&
        viewer.top < list.bottom &&
        list.top < viewer.bottom;
      return { viewerWidth: viewer.width, viewerHeight: viewer.height, overlap };
    });
  }

  test('200% text keeps the 3D view usable and clear of the parts list', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await page.getByRole('button', { name: 'Motors', exact: true }).click();
    const geometry = await fieldGeometry(page);
    expect(geometry.viewerWidth).toBeGreaterThanOrEqual(200);
    expect(geometry.viewerHeight).toBeGreaterThanOrEqual(150);
    expect(geometry.overlap).toBe(false);
  });

  test('a 24 px browser default keeps the parts list inside the drawing', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Page.enable');
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: 24 } });
    await page.goto('/');
    const geometry = await fieldGeometry(page);
    expect(geometry.overlap).toBe(false);
    const listFits = await page.evaluate(() => {
      const list = document.querySelector('.part-list');
      return list ? list.scrollWidth <= list.clientWidth : false;
    });
    expect(listFits).toBe(true);
  });
});

test('the 3D view keeps its height just above the two-column breakpoint', async ({ page }) => {
  for (const width of [897, 900, 960]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const height = await page.evaluate(
      () => document.querySelector('.part-explorer-viewer')?.getBoundingClientRect().height ?? 0,
    );
    expect(height, `${width} px`).toBeGreaterThanOrEqual(250);
  }
});

test('in forced colours, focus on the selected part row is distinguishable', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  const motors = page.getByRole('button', { name: 'Motors', exact: true });
  await motors.click();
  const outline = () =>
    motors.evaluate((el) => {
      const s = getComputedStyle(el);
      return `${s.outlineStyle} ${s.outlineWidth}`;
    });
  await page.getByRole('button', { name: 'Frame', exact: true }).focus();
  const unfocused = await outline();
  await motors.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const focused = await outline();
  expect(focused).not.toBe(unfocused);
});
