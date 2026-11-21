// Writes `third-party-licenses.txt` into the build: every npm package bundled into the app (code
// and fonts), with its copyright and licence text, as their licences ask when copies are shared.
// Release review I2. Used by vite.config.ts; collectNotices and formatNotices are tested alone.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LICENCE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'license'];

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

/** The standard MIT licence text, for an MIT package that ships no licence file. */
function mitText(author) {
  const holder = typeof author === 'object' && author !== null ? author.name : author;
  return [
    'MIT License',
    `Copyright (c) ${holder ?? 'the package authors'}`,
    'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
    'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
  ].join('\n\n');
}

/**
 * One notice per bundled package, sorted by name. A package without a licence file gets the MIT
 * text if it says it is MIT; any other is an error, so nothing ships without its notice.
 */
export function collectNotices(ids, { read, exists }) {
  const roots = new Set(ids.map(packageRoot).filter((root) => root !== null));
  const notices = new Map();
  const missing = [];
  for (const root of roots) {
    const pkg = JSON.parse(read(join(root, 'package.json')));
    const key = `${pkg.name}@${pkg.version}`;
    if (notices.has(key)) continue;
    const file = LICENCE_FILES.map((name) => join(root, name)).find(exists);
    if (!file && pkg.license !== 'MIT') {
      missing.push(key);
      continue;
    }
    notices.set(key, {
      name: pkg.name,
      version: pkg.version,
      license: pkg.license ?? 'see text',
      text: file ? read(file).trim() : mitText(pkg.author),
    });
  }
  if (missing.length > 0) {
    throw new Error(`No licence file in ${missing.sort().join(', ')}: add their notices by hand`);
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
        exists: (path) => existsSync(path),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'third-party-licenses.txt',
        source: formatNotices(notices),
      });
    },
  };
}
