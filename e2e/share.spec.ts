import { expect, test } from '@playwright/test';

// Link previews, the home screen icon and robots.txt (review M3). The tests' build has no
// VITE_SITE_URL, so the preview image tag is left out (scripts/share-tags.test.mjs covers both).

test('the page carries link preview tags', async ({ request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('<meta property="og:title" content="Inside the Quad"');
  expect(html).toContain('<meta property="og:type" content="website"');
  expect(html).toMatch(/<meta property="og:description" content="Learn how an FPV drone works/);
  expect(html).toContain('<meta name="twitter:card"');
  expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"');
});

for (const [path, type] of [
  ['/og-image.png', 'image/png'],
  ['/apple-touch-icon.png', 'image/png'],
  ['/robots.txt', 'text/plain'],
] as const) {
  test(`serves ${path}`, async ({ request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(type);
  });
}

test('robots.txt lets search engines read the site', async ({ request }) => {
  const text = await (await request.get('/robots.txt')).text();
  expect(text).toMatch(/^User-agent: \*$/m);
  expect(text).toMatch(/^Allow: \/$/m);
});
