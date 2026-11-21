import { expect, type Page, test } from '@playwright/test';

/**
 * Visit counts (src/app/analytics.ts). The app never counts on a local address, so these tests
 * reach the same server under a made-up name (`itq.test`, mapped to this machine). The count
 * requests are caught here; nothing reaches GoatCounter. Against the Docker image the server's
 * CSP applies, so a count that arrives here also proves the CSP lets it through.
 */

const HOST = 'itq.test';
const base = new URL(process.env.E2E_BASE_URL ?? 'http://localhost:4173');
const COUNTER = 'https://insidethequad.goatcounter.com/count';

/** Catches count requests; returns each one's parameters. */
async function catchCounts(page: Page): Promise<URLSearchParams[]> {
  const counts: URLSearchParams[] = [];
  await page.route(`${COUNTER}?*`, (route) => {
    counts.push(new URL(route.request().url()).searchParams);
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  return counts;
}

const paths = (counts: URLSearchParams[]) => counts.map((c) => c.get('p'));

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Console errors include Content-Security-Policy violations when running against nginx.
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.use({
  baseURL: `${base.protocol}//${HOST}:${base.port}`,
  launchOptions: { args: [`--host-resolver-rules=MAP ${HOST} 127.0.0.1`] },
});

test('counts each sheet once, at its own address, through the CSP', async ({ page }) => {
  const errors = watchErrors(page);
  const counts = await catchCounts(page);

  await page.goto('/paths/control');
  await expect(page.getByRole('heading', { level: 2, name: 'Control path' })).toBeVisible();
  await expect.poll(() => paths(counts)).toEqual(['/paths/control']);

  // Stepping through a path is still one view of it.
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page).toHaveURL(/\/paths\/control\/3$/);

  await page.getByRole('button', { name: 'Close sheet' }).click();
  await expect.poll(() => paths(counts)).toEqual(['/paths/control', '/']);

  // Back and Forward count too.
  await page.goBack();
  await expect(page.getByRole('heading', { level: 2, name: 'Control path' })).toBeVisible();
  await page.goForward();
  await expect.poll(() => paths(counts)).toEqual(['/paths/control', '/', '/paths/control', '/']);

  expect(errors).toEqual([]);
});

test('sends only the path and screen size: no query, title or referrer from this site', async ({
  page,
}) => {
  const counts = await catchCounts(page);
  await page.goto('/intro?email=someone%40example.test');
  await expect.poll(() => paths(counts)).toEqual(['/intro']);
  await page.getByRole('button', { name: 'Close intro' }).click();
  await expect.poll(() => paths(counts)).toEqual(['/intro', '/']);

  for (const count of counts) {
    expect([...count.keys()].sort()).toEqual(['p', 'rnd', 's']);
    expect(count.toString()).not.toContain('example.test');
  }
  expect(await page.evaluate(() => localStorage.getItem('skipgc'))).toBeNull();
});

test('an address the app does not know is counted as the overview it shows', async ({ page }) => {
  const counts = await catchCounts(page);
  await page.goto('/parts/nope');
  await expect(page.getByText('There’s no part called “nope”')).toBeVisible();
  await expect.poll(() => paths(counts)).toEqual(['/']);
});

test('counts nothing on this machine', async ({ page }) => {
  const counts = await catchCounts(page);
  // The same server under its own, local name.
  await page.goto(new URL('/parts/motors', base).href);
  await expect(page.getByRole('heading', { level: 2, name: 'Motors' })).toBeVisible();
  await page.waitForTimeout(500);
  expect(counts).toEqual([]);
});
