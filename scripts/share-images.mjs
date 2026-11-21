// Draws the link preview image (public/og-image.png, 1200 × 630) and the home screen icon
// (public/apple-touch-icon.png, 180 × 180). Run by hand after the drone or the look changes:
//
//   pnpm build && pnpm preview --port 4173 &   then   pnpm share:images
//
// The drone is rendered by the app itself (its overview at a large size), then set on a drawing
// sheet with the title, in the app's own colours and fonts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const APP = process.env.APP_URL ?? 'http://localhost:4173/';
const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(root(`node_modules/@fontsource/${pkg}/files/${file}`)).toString('base64')}`;

// The palette from the app's own tokens, so the card follows a change to them.
const tokens = readFileSync(root('src/styles/tokens.css'), 'utf8');
const token = (name) => {
  const value = new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(tokens)?.[1];
  if (!value) throw new Error(`tokens.css has no --color-${name}`);
  return value;
};
const COLORS = {
  ground: token('ground'),
  sheet: token('sheet'),
  ruleStrong: token('rule-strong'),
  ink: token('ink'),
  muted: token('muted'),
  accent: token('accent'),
};

function cardHtml(drone) {
  const ticks = [1, 2, 3, 4]
    .map((n, i) => `<span style="left:${12.5 + i * 25}%">${n}</span>`)
    .join('');
  return `<!doctype html><html><head><style>
  @font-face { font-family: Barlow; font-weight: 700; src: url(${font('barlow-condensed', 'barlow-condensed-latin-700-normal.woff2')}); }
  @font-face { font-family: Barlow; font-weight: 600; src: url(${font('barlow-condensed', 'barlow-condensed-latin-600-normal.woff2')}); }
  @font-face { font-family: Atkinson; font-weight: 400; src: url(${font('atkinson-hyperlegible', 'atkinson-hyperlegible-latin-400-normal.woff2')}); }
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; background: ${COLORS.ground}; color: ${COLORS.ink}; padding: 36px; }
  .sheet { position: relative; height: 100%; border: 2px solid ${COLORS.ruleStrong}; background: ${COLORS.sheet}; display: grid; grid-template-columns: 1fr 400px; }
  .field { position: relative; border-right: 2px solid ${COLORS.ruleStrong}; overflow: hidden; background: ${COLORS.ground}; }
  .field img { position: absolute; left: 0; top: 30px; width: 100%; height: calc(100% - 30px); object-fit: cover; }
  .ticks span { position: absolute; top: 10px; font: 600 20px Barlow; color: ${COLORS.muted}; }
  .side { display: flex; flex-direction: column; }
  .title { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 36px; gap: 22px; }
  h1 { font: 700 76px/0.95 Barlow; letter-spacing: 0.04em; text-transform: uppercase; }
  h1 em { font-style: normal; color: ${COLORS.accent}; }
  p { font: 400 28px/1.35 Atkinson; color: ${COLORS.muted}; }
  .block { display: grid; grid-template-columns: 1fr 1fr; border-top: 2px solid ${COLORS.ruleStrong}; }
  .block div { padding: 16px 20px; }
  .block div + div { border-left: 2px solid ${COLORS.ruleStrong}; }
  .block b { display: block; font: 600 18px Barlow; letter-spacing: 0.12em; color: ${COLORS.muted}; text-transform: uppercase; }
  .block span { font: 600 28px Barlow; }
  </style></head><body><div class="sheet">
  <div class="field"><div class="ticks">${ticks}</div><img src="${drone}" alt=""></div>
  <div class="side">
    <div class="title"><h1>Inside the <em>Quad</em></h1><p>How an FPV drone works, part by part.</p></div>
    <div class="block"><div><b>Part</b><span>5-inch quad</span></div><div><b>Sheet</b><span>Overview</span></div></div>
  </div>
  </div></body></html>`;
}

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  // The drone, from the app's overview at a large size.
  const app = await browser.newPage({
    viewport: { width: 1280, height: 860 },
    deviceScaleFactor: 1,
  });
  await app.goto(APP);
  const canvas = app.locator('canvas').first();
  await canvas.waitFor();
  await app.waitForTimeout(3000);
  const drone = `data:image/png;base64,${(await canvas.screenshot()).toString('base64')}`;

  const card = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await card.setContent(cardHtml(drone));
  await card.evaluate(() => document.fonts.ready);
  await card.screenshot({ path: root('public/og-image.png') });

  // The home screen icon: the favicon's drawing, full bleed (iOS rounds the corners itself).
  const svg = readFileSync(root('public/favicon.svg'), 'utf8').replace(' rx="3"', '');
  const icon = await browser.newPage({
    viewport: { width: 180, height: 180 },
    deviceScaleFactor: 1,
  });
  await icon.setContent(
    `<style>*{margin:0}svg{display:block;width:180px;height:180px}</style>${svg}`,
  );
  await icon.screenshot({ path: root('public/apple-touch-icon.png') });
} finally {
  await browser.close();
}
