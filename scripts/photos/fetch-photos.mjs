// Fetches the real part photos from Wikimedia Commons, checks their licences, crops and resizes
// them, and writes WebP files plus their credits. Run by hand when the manifest changes
// (`pnpm photos:fetch`); never in CI. Outputs are committed.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { cachedOriginalIsUsable, displayTitle } from './download.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const cacheDir = join(here, '.cache');
const assetsDir = join(root, 'src', 'assets', 'photos');
const creditsFile = join(root, 'src', 'content', 'photos', 'credits.json');

const ALLOWED = ['CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC0', 'Public domain'];
const WIDTHS = [640, 1280];
const QUALITY = 70;
const USER_AGENT = 'inside-the-quad-photo-fetch/1.0 (educational project)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** GET with a backoff on rate limits and server errors. */
async function get(url) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (response.ok) return response;
    if (response.status !== 429 && response.status < 500) {
      throw new Error(`${response.status} for ${url}`);
    }
    await sleep(15_000 * (attempt + 1));
  }
  throw new Error(`gave up on ${url}`);
}

const plain = (html = '') =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const manifest = JSON.parse(await readFile(join(here, 'manifest.json'), 'utf8'));
const titles = [...new Set(manifest.map((entry) => entry.title))];

const query = new URLSearchParams({
  action: 'query',
  prop: 'imageinfo',
  iiprop: 'extmetadata|url|size',
  format: 'json',
  formatversion: '2',
  titles: titles.join('|'),
});
const api = await (await get(`https://commons.wikimedia.org/w/api.php?${query}`)).json();
const byTitle = new Map(api.query.pages.map((page) => [page.title, page]));
// The API normalises titles; map the manifest's spelling to the page it means.
for (const { from, to } of api.query.normalized ?? []) byTitle.set(from, byTitle.get(to));

await mkdir(cacheDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });
await mkdir(dirname(creditsFile), { recursive: true });

const credits = {};
for (const entry of manifest) {
  const page = byTitle.get(entry.title);
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error(`No such file on Commons: ${entry.title}`);
  const meta = info.extmetadata ?? {};
  const licence = plain(meta.LicenseShortName?.value);
  if (!ALLOWED.includes(licence)) {
    throw new Error(`${entry.part}: licence "${licence}" is not allowed (${entry.title})`);
  }
  if (licence !== entry.licence) {
    throw new Error(`${entry.part}: licence "${licence}", manifest expects "${entry.licence}"`);
  }
  const author = plain(meta.Artist?.value) || plain(meta.Credit?.value);
  if (!author) throw new Error(`${entry.part}: no author on ${entry.title}`);

  // Always the full-size original, so crops (in the original's pixels) come out the same on every
  // run. A cached file of any other size is downloaded again.
  const original = join(cacheDir, encodeURIComponent(page.title));
  const cachedWidth = existsSync(original) ? (await sharp(original).metadata()).width : undefined;
  if (!cachedOriginalIsUsable(cachedWidth, info.width)) {
    await writeFile(original, Buffer.from(await (await get(info.url)).arrayBuffer()));
    await sleep(10_000);
  }
  const crop = entry.crop;
  const sourceWidth = crop?.width ?? info.width;

  let image = sharp(original);
  if (crop) image = image.extract(crop);
  let largest = null;
  for (const width of WIDTHS) {
    const { data, info: out } = await image
      .clone()
      .resize({ width: Math.min(width, sourceWidth), withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });
    await writeFile(join(assetsDir, `${entry.part}-${width}.webp`), data);
    largest = out;
  }

  credits[entry.part] = {
    title: displayTitle(page.title),
    author,
    licence,
    ...(meta.LicenseUrl?.value ? { licenceUrl: plain(meta.LicenseUrl.value) } : {}),
    sourceUrl: info.descriptionurl,
    cropped: Boolean(entry.crop),
    width: largest.width,
    height: largest.height,
  };
  console.log(`${entry.part}: ${licence}, ${author}, ${largest.width}×${largest.height}`);
}

const sorted = Object.fromEntries(
  Object.keys(credits)
    .sort()
    .map((key) => [key, credits[key]]),
);
await writeFile(creditsFile, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${Object.keys(sorted).length} photos.`);
