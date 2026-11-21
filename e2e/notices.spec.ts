import { expect, test } from '@playwright/test';

test('the build ships the third-party licence notices', async ({ request }) => {
  // Release review I2: the bundled packages' and fonts' licences must accompany the app.
  const response = await request.get('/third-party-licenses.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  for (const name of [
    'react 19',
    'react-dom',
    'three 0.',
    '@react-three/fiber',
    '@fontsource/atkinson-hyperlegible',
    '@fontsource/barlow-condensed',
  ]) {
    expect(text, name).toContain(name);
  }
  expect(text).toContain('SIL OPEN FONT LICENSE');
  expect(text).toContain('Permission is hereby granted');
});
