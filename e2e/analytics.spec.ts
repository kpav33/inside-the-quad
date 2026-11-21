import { expect, type Page, test } from '@playwright/test';

/**
 * Visit counts (src/app/analytics.ts). The app never counts on a local address, so these tests
 * reach the same server under a made-up name (`itq.test`, mapped to this machine). GoatCounter's
 * script is replaced by a stub that records what would be counted; nothing leaves the machine.
 */

const HOST = 'itq.test';
const base = new URL(process.env.E2E_BASE_URL ?? 'http://localhost:4173');

const STUB = `window.goatcounter = { count: (vars) => { (window.__counted ||= []).push(vars.path); } };`;

async function stubCounter(page: Page): Promise<string[]> {
  const requested: string[] = [];
  await page.route('https://gc.zgo.at/count.js', (route) => {
    requested.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: STUB });
  });
  // Nothing may reach the real counter from a test.
  await page.route('https://*.goatcounter.com/**', (route) => route.abort());
  return requested;
}

const counted = (page: Page) =>
  page.evaluate(() => (window as unknown as { __counted?: string[] }).__counted ?? []);

test.use({
  baseURL: `${base.protocol}//${HOST}:${base.port}`,
  launchOptions: { args: [`--host-resolver-rules=MAP ${HOST} 127.0.0.1`] },
});

test('counts each sheet once, at its own address, and the CSP lets the counter run', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Console errors include Content-Security-Policy violations when running against nginx.
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const requested = await stubCounter(page);

  await page.goto('/paths/control');
  await expect(page.getByRole('heading', { level: 2, name: 'Control path' })).toBeVisible();
  await expect.poll(() => counted(page)).toEqual(['/paths/control']);

  // Stepping through a path is still one view of it.
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page).toHaveURL(/\/paths\/control\/3$/);

  await page.getByRole('button', { name: 'Close sheet' }).click();
  await expect.poll(() => counted(page)).toEqual(['/paths/control', '/']);

  expect(requested).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('counts nothing on this machine and never asks for the counter', async ({ page }) => {
  const requested = await stubCounter(page);
  // The same server under its own, local name.
  await page.goto(new URL('/parts/motors', base).href);
  await expect(page.getByRole('heading', { level: 2, name: 'Motors' })).toBeVisible();
  await page.waitForTimeout(500);
  expect(requested).toEqual([]);
  expect(await counted(page)).toEqual([]);
});
