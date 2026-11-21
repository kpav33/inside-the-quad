import { describe, expect, it } from 'vitest';

import { collectNotices, formatNotices, packageRoot } from './third-party-notices.mjs';

const files = {
  '/app/node_modules/.pnpm/react@19.0.0/node_modules/react/package.json': JSON.stringify({
    name: 'react',
    version: '19.0.0',
    license: 'MIT',
  }),
  '/app/node_modules/.pnpm/react@19.0.0/node_modules/react/LICENSE':
    'MIT License\nCopyright (c) Meta',
  '/app/node_modules/.pnpm/@fontsource+barlow@5.0.0/node_modules/@fontsource/barlow/package.json':
    JSON.stringify({ name: '@fontsource/barlow', version: '5.0.0', license: 'OFL-1.1' }),
  '/app/node_modules/.pnpm/@fontsource+barlow@5.0.0/node_modules/@fontsource/barlow/LICENSE':
    'SIL OPEN FONT LICENSE Version 1.1',
};
const read = (path) => {
  if (!(path in files)) throw new Error(`ENOENT ${path}`);
  return files[path];
};
const exists = (path) => path in files;

describe('third-party notices', () => {
  it('finds the package a bundled file belongs to, scoped or not', () => {
    expect(
      packageRoot(
        '/app/node_modules/.pnpm/react@19.0.0/node_modules/react/cjs/react.production.js',
      ),
    ).toBe('/app/node_modules/.pnpm/react@19.0.0/node_modules/react');
    expect(
      packageRoot(
        '/app/node_modules/.pnpm/@fontsource+barlow@5.0.0/node_modules/@fontsource/barlow/latin-500.css',
      ),
    ).toBe('/app/node_modules/.pnpm/@fontsource+barlow@5.0.0/node_modules/@fontsource/barlow');
    expect(packageRoot('/app/src/main.tsx')).toBeNull();
    expect(packageRoot('\0vite/preload-helper')).toBeNull();
  });

  it('lists each bundled package once, sorted, with its licence text', () => {
    const notices = collectNotices(
      [
        '/app/node_modules/.pnpm/react@19.0.0/node_modules/react/index.js',
        '/app/node_modules/.pnpm/react@19.0.0/node_modules/react/cjs/react.production.js',
        '/app/node_modules/.pnpm/@fontsource+barlow@5.0.0/node_modules/@fontsource/barlow/latin-500.css',
        '/app/src/main.tsx',
      ],
      { read, exists },
    );
    expect(notices).toEqual([
      {
        name: '@fontsource/barlow',
        version: '5.0.0',
        license: 'OFL-1.1',
        text: 'SIL OPEN FONT LICENSE Version 1.1',
      },
      { name: 'react', version: '19.0.0', license: 'MIT', text: 'MIT License\nCopyright (c) Meta' },
    ]);
  });

  it('writes the MIT text for an MIT package that ships no licence file', () => {
    const mitOnly = {
      '/app/node_modules/.pnpm/x@1.0.0/node_modules/x/package.json': JSON.stringify({
        name: 'x',
        version: '1.0.0',
        license: 'MIT',
        author: 'Ada Lovelace (https://example.org)',
      }),
    };
    const [notice] = collectNotices(['/app/node_modules/.pnpm/x@1.0.0/node_modules/x/index.js'], {
      read: (p) => mitOnly[p],
      exists: (p) => p in mitOnly,
    });
    expect(notice.text).toMatch(
      /^MIT License\n\nCopyright \(c\) Ada Lovelace \(https:\/\/example.org\)/,
    );
    expect(notice.text).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
  });

  it('fails the build for any other bundled package without a licence file, naming them all', () => {
    const missing = {
      '/app/node_modules/.pnpm/x@1.0.0/node_modules/x/package.json': JSON.stringify({
        name: 'x',
        version: '1.0.0',
        license: 'Apache-2.0',
      }),
      '/app/node_modules/.pnpm/y@2.0.0/node_modules/y/package.json': JSON.stringify({
        name: 'y',
        version: '2.0.0',
      }),
    };
    expect(() =>
      collectNotices(
        [
          '/app/node_modules/.pnpm/x@1.0.0/node_modules/x/index.js',
          '/app/node_modules/.pnpm/y@2.0.0/node_modules/y/index.js',
        ],
        { read: (p) => missing[p], exists: (p) => p in missing },
      ),
    ).toThrow(/x@1\.0\.0, y@2\.0\.0/);
  });

  it('writes a plain-text notices file', () => {
    const text = formatNotices([
      { name: 'react', version: '19.0.0', license: 'MIT', text: 'MIT License' },
    ]);
    expect(text).toContain('Inside the Quad includes the following third-party software');
    expect(text).toContain('react 19.0.0 (MIT)\n\nMIT License');
  });
});
