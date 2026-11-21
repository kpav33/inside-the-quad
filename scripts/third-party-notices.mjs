// Writes `third-party-licenses.txt` into the build: every npm package bundled into the app (code
// and fonts), with its copyright and licence text, as their licences ask when copies are shared.
// Release review I2. Used by vite.config.ts; collectNotices and formatNotices are tested alone.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** A licence file's name, in any case: LICENSE, licence.md, LICENSE-MIT, COPYING.txt and so on. */
const LICENCE_FILE = /^(licen[cs]e|copying)([.-][\w.-]+)?$/i;

/**
 * Upstream licence texts for bundled packages that publish none in their npm package, copied
 * verbatim from the package's repository at the same version: `scripts/licenses/<name>.txt`,
 * with `/` written as `__`. Never generated: a notice must carry the real copyright holder.
 */
const VENDORED = join(dirname(fileURLToPath(import.meta.url)), 'licenses');

function vendoredLicence(name) {
  const file = join(VENDORED, `${name.replace('/', '__')}.txt`);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
}

/** The folder of the npm package a bundled file belongs to, or null for the app's own files. */
export function packageRoot(id) {
  const path = id.replaceAll('\\', '/').split('?')[0];
  // The last node_modules segment is the package itself (pnpm nests through .pnpm).
  const last = path.lastIndexOf('/node_modules/');
  if (last === -1) return null;
  const rest = path.slice(last + '/node_modules/'.length);
  const name = rest.startsWith('@') ? rest.split('/').slice(0, 2).join('/') : rest.split('/')[0];
  return path.slice(0, last) + '/node_modules/' + name;
}

/**
 * One notice per bundled package, sorted by name: its own licence file, else the vendored upstream
 * text. A package with neither fails the build, naming every such package.
 */
export function collectNotices(ids, { read, list, override }) {
  const roots = new Set(ids.map(packageRoot).filter((root) => root !== null));
  const notices = new Map();
  const missing = [];
  for (const root of roots) {
    const pkg = JSON.parse(read(join(root, 'package.json')));
    const key = `${pkg.name}@${pkg.version}`;
    if (notices.has(key)) continue;
    const file = list(root).find((name) => LICENCE_FILE.test(name));
    const text = file ? read(join(root, file)) : override(pkg.name);
    if (text === undefined) {
      missing.push(key);
      continue;
    }
    notices.set(key, {
      name: pkg.name,
      version: pkg.version,
      license: pkg.license ?? 'see text',
      text: text.trim(),
    });
  }
  if (missing.length > 0) {
    throw new Error(
      `No licence text for ${missing.sort().join(', ')}: add the upstream text to scripts/licenses/`,
    );
  }
  return [...notices.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** The notices as one plain-text file. */
export function formatNotices(notices) {
  const rule = '-'.repeat(72);
  const header = [
    'Inside the Quad includes the following third-party software and fonts.',
    'Their copyright and licence notices follow, as each licence requires.',
    'Photo credits are shown beside each photo in the app.',
  ].join('\n');
  const body = notices.map(
    ({ name, version, license, text }) => `${name} ${version} (${license})\n\n${text}`,
  );
  return [header, ...body].join(`\n\n${rule}\n\n`) + '\n';
}

/** Vite plugin: emits the notices file next to the built app. */
export function thirdPartyNotices() {
  return {
    name: 'third-party-notices',
    apply: 'build',
    generateBundle(_options, bundle) {
      const ids = Object.values(bundle).flatMap((item) =>
        item.type === 'chunk' ? Object.keys(item.modules) : [],
      );
      const notices = collectNotices(ids, {
        read: (path) => readFileSync(path, 'utf8'),
        list: (dir) => readdirSync(dir),
        override: vendoredLicence,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'third-party-licenses.txt',
        source: formatNotices(notices),
      });
    },
  };
}
