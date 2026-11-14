import { expect, test } from '@playwright/test';

// These check nginx behaviour, so they only run against the production Docker image.
test.skip(!process.env.E2E_BASE_URL, 'Requires E2E_BASE_URL pointing at the Docker image');

const SECURITY_HEADERS = [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'x-frame-options',
  'permissions-policy',
];

test('health check responds', async ({ request }) => {
  const response = await request.get('/healthz');
  expect(response.status()).toBe(200);
  expect(await response.text()).toBe('ok');
});

test('deep links fall back to the app and are not cached', async ({ request }) => {
  const response = await request.get('/lessons/motors');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('<div id="root">');
  expect(response.headers()['cache-control']).toBe('no-cache');
  for (const header of SECURITY_HEADERS) {
    expect(response.headers(), header).toHaveProperty(header);
  }
});

test('hashed assets are cached long term and keep security headers', async ({ page, request }) => {
  await page.goto('/');
  const src = await page.locator('script[type="module"]').first().getAttribute('src');
  expect(src).toMatch(/^\/assets\//);

  const response = await request.get(src ?? '');
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toContain('immutable');
  for (const header of SECURITY_HEADERS) {
    expect(response.headers(), header).toHaveProperty(header);
  }
});

test('real part photos are served from our own assets, cached long term', async ({
  page,
  request,
}) => {
  await page.goto('/parts/esc');
  const src = await page.locator('figure.part-photo img').getAttribute('src');
  expect(src).toMatch(/^\/assets\/.+\.webp$/);

  const response = await request.get(src ?? '');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/webp');
  expect(response.headers()['cache-control']).toContain('immutable');
  for (const header of SECURITY_HEADERS) {
    expect(response.headers(), header).toHaveProperty(header);
  }
});

test('missing assets return 404 instead of the app', async ({ request }) => {
  const response = await request.get('/assets/does-not-exist.js');
  expect(response.status()).toBe(404);
});
