import { expect, type Page, test } from '@playwright/test';

import { PART_NAMES } from './parts';
import { stretchText } from './stretch';

const lessonHeading = (page: Page, name: string) =>
  page.getByRole('heading', { level: 2, name, exact: true });

test.describe('part addresses', () => {
  for (const path of ['/parts/vtx', '/parts/vtx/']) {
    test(`${path} opens the VTX lesson, also after a reload`, async ({ page }) => {
      await page.goto(path);
      await expect(lessonHeading(page, 'VTX')).toBeVisible();
      await expect(page).toHaveTitle('VTX · Inside the Quad');
      await page.reload();
      await expect(lessonHeading(page, 'VTX')).toBeVisible();
    });
  }

  test('an unknown part shows the overview with a notice', async ({ page }) => {
    await page.goto('/parts/foo');
    await expect(page.getByRole('status').filter({ hasText: 'no part called' })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('Back and Forward retrace the lessons and keep focus', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Frame', exact: true }).click();
    await expect(page).toHaveURL(/\/parts\/frame$/);

    await page.goBack();
    await expect(lessonHeading(page, 'Frame')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Start with sheet 1: Frame' })).toBeFocused();

    await page.goForward();
    await expect(lessonHeading(page, 'Frame')).toBeFocused();
  });

  test('a Ctrl click on a connection opens it in a new tab', async ({ page, context }) => {
    await page.goto('/parts/esc');
    const opened = context.waitForEvent('page');
    await page
      .getByRole('link', { name: 'Battery · sheet 6', exact: true })
      .click({ modifiers: ['ControlOrMeta'] });
    const tab = await opened;
    await tab.waitForLoadState();
    await expect(lessonHeading(tab, 'Battery')).toBeVisible();
    await expect(lessonHeading(page, 'ESC')).toBeVisible();
  });
});

test.describe('sheets and progress', () => {
  test('Next walks every sheet in order and ends on the overview', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start with sheet 1: Frame' }).click();
    for (const name of PART_NAMES) {
      await expect(lessonHeading(page, name)).toBeFocused();
      await page.getByRole('link', { name: /^Next/ }).click();
    }
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Start with sheet 1: Frame' })).toBeFocused();
  });

  test('a lesson marked as read stays read after a reload', async ({ page }) => {
    await page.goto('/parts/frame');
    await page.getByRole('button', { name: 'Mark as read' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Frame, read' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark as read' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('the start link continues where the learner stopped', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start with sheet 1: Frame' }).click();
    await page.getByRole('button', { name: 'Mark as read' }).click();
    await page.getByRole('button', { name: 'Close lesson' }).click();
    await expect(page.getByRole('link', { name: 'Continue with sheet 2: Motors' })).toBeVisible();
    await expect(page.getByText('1 of 11 read')).toBeVisible();
  });
});

test.describe('fit at 320 px with 40% longer text', () => {
  const overflowing = (page: Page) =>
    page.evaluate(() => ({
      page: document.documentElement.scrollWidth - window.innerWidth,
      elements: [
        ...document.querySelectorAll(
          '.lesson-read, .lesson-sheet-link, .lesson-connection-link, .overview-start-link, .overview-progress',
        ),
      ]
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent),
    }));

  test('the lesson footer and connection links fit', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ['/parts/frame', '/parts/fc', '/parts/extras']) {
      await page.goto(path);
      await page.getByRole('button', { name: 'Mark as read' }).click();
      await stretchText(page);
      expect(await overflowing(page), path).toEqual({ page: 0, elements: [] });
    }
  });

  test('the overview start block fits', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('inside-the-quad.read-parts.v1', '["frame","motors"]');
    });
    await page.reload();
    await stretchText(page);
    expect(await overflowing(page)).toEqual({ page: 0, elements: [] });
  });
});

test('a lesson link opened on a phone shows the lesson, without moving focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/parts/vtx');
  await expect(lessonHeading(page, 'VTX')).toBeInViewport();
  await expect(lessonHeading(page, 'VTX')).not.toBeFocused();
});
