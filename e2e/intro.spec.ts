import { expect, type Page, test } from '@playwright/test';

import { redlinePixels } from './redline';
import { stretchText } from './stretch';

const introHeading = (page: Page) =>
  page.getByRole('heading', { level: 2, name: 'What is an FPV drone?' });
const lessonHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true });

test.describe('the intro sheet', () => {
  for (const path of ['/intro', '/intro/']) {
    test(`${path} opens the intro, also after a reload`, async ({ page }) => {
      await page.goto(path);
      await expect(introHeading(page)).toBeVisible();
      await expect(page).toHaveTitle('What is an FPV drone? · Inside the Quad');
      await expect(page).toHaveURL(/\/intro$/);
      await page.reload();
      await expect(introHeading(page)).toBeVisible();
    });
  }

  test('a newcomer goes from the overview to the intro, on to sheet 1 and back', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('New to FPV? Start here.')).toBeVisible();
    await page.locator('#overview-start').click();
    await expect(introHeading(page)).toBeFocused();
    await page.getByRole('link', { name: /^Next.*Frame · sheet 1/ }).click();
    await expect(lessonHeading(page, 'Frame')).toBeFocused();
    await page.getByRole('link', { name: /^Previous.*What is an FPV drone/ }).click();
    await expect(introHeading(page)).toBeFocused();
  });

  test('Back retraces overview, intro and sheet 1 with focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('#overview-start').click();
    await page.getByRole('link', { name: /^Next.*Frame · sheet 1/ }).click();
    await expect(lessonHeading(page, 'Frame')).toBeVisible();

    await page.goBack();
    await expect(introHeading(page)).toBeFocused();
    await page.goBack();
    await expect(page.locator('#overview-start')).toBeFocused();
  });

  test('leaving an open stack for the intro clears the selection', async ({ page }) => {
    await page.goto('/parts/esc');
    await expect(lessonHeading(page, 'ESC')).toBeVisible();
    await page.getByRole('link', { name: /^Previous/ }).click();
    await page.getByRole('link', { name: /^Previous/ }).click();
    await page.getByRole('link', { name: /^Previous/ }).click();
    await page.getByRole('link', { name: /^Previous/ }).click();
    await expect(introHeading(page)).toBeVisible();
    await expect(page.locator('.part-list [aria-pressed="true"]')).toHaveCount(0);
    await expect.poll(() => redlinePixels(page), { timeout: 10_000 }).toBe(0);
  });

  test('marking the intro read moves the start on to sheet 1', async ({ page }) => {
    await page.goto('/intro');
    await page.getByRole('button', { name: 'Mark as read' }).click();
    await page.getByRole('button', { name: 'Close intro' }).click();
    await expect(page.getByRole('link', { name: 'Start with sheet 1: Frame' })).toBeFocused();
    await expect(page.getByText('New to FPV? Start here.')).toBeHidden();
  });

  test('a device button highlights its links in the drawing', async ({ page }) => {
    await page.goto('/intro');
    await page.getByRole('button', { name: 'Drone' }).click();
    for (const link of ['control', 'video']) {
      await expect(page.locator(`[data-link="${link}"]`)).toHaveAttribute('data-highlight', 'true');
    }
  });
});

test.describe('the intro fits', () => {
  test('a 320 px screen with 40% longer text', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ['/intro', '/']) {
      await page.goto(path);
      // The canvas starts at its default 300 px until three.js sizes it to the drawing field.
      await expect(page.locator('canvas')).toBeVisible();
      await stretchText(page);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), {
          message: path,
        })
        .toBeLessThanOrEqual(0);
      const figures = await page.evaluate(() =>
        [...document.querySelectorAll('.intro-figure')]
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.className),
      );
      expect(figures, path).toEqual([]);
    }
  });

  for (const width of [900, 1000, 1100]) {
    test(`a ${width} × 700 window without page scrolling`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('/intro');
      await expect(introHeading(page)).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('the intro drawings', () => {
  test('tapping inside a device in the drawing chooses it', async ({ page }) => {
    await page.goto('/intro');
    const radio = page.locator('[data-device="radio"] rect').first();
    await radio.scrollIntoViewIfNeeded();
    const box = await radio.boundingBox();
    if (!box) throw new Error('no radio body');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.getByRole('button', { name: 'Radio' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  for (const [width, height] of [
    [320, 640],
    [768, 900],
    [1280, 800],
  ] as const) {
    test(`drawing labels stay readable and below heading size at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/intro');
      await expect(page.locator('.size-comparison svg')).toBeVisible();
      const sizes = await page.evaluate(() =>
        [...document.querySelectorAll<SVGTextElement>('.intro-drawing text')]
          .filter((text) => text.getBoundingClientRect().width > 0)
          .map((text) => {
            const scale = text.ownerSVGElement?.getScreenCTM()?.a ?? 1;
            const size = parseFloat(getComputedStyle(text).fontSize) * scale;
            return { text: text.textContent, size: Math.round(size * 10) / 10 };
          }),
      );
      expect(sizes.length).toBeGreaterThan(0);
      for (const { text, size } of sizes) {
        expect(size, `${text} at ${width} px`).toBeGreaterThanOrEqual(9.5);
        expect(size, `${text} at ${width} px`).toBeLessThanOrEqual(20);
      }
    });
  }
});

test('the masthead link is on a phone’s first screen and opens the intro', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  const link = page
    .getByRole('navigation', { name: 'Sections' })
    .getByRole('link', { name: 'What is an FPV drone?' });
  await expect(link).toBeInViewport();
  await link.press('Enter');
  await expect(introHeading(page)).toBeFocused();
  await expect(link).toHaveAttribute('aria-current', 'page');
});
