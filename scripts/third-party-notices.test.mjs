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
const list = (dir) =>
  Object.keys(files)
    .filter((path) => path.startsWith(`${dir}/`) && !path.slice(dir.length + 1).includes('/'))
    .map((path) => path.slice(dir.length + 1));
const noOverride = () => undefined;

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
      { read, list, override: noOverride },
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

  it('finds a licence file whatever its case or extension', () => {
    const lower = {
      '/app/node_modules/.pnpm/a@1.0.0/node_modules/a/package.json': JSON.stringify({
        name: 'a',
        version: '1.0.0',
        license: 'Apache-2.0',
      }),
      '/app/node_modules/.pnpm/a@1.0.0/node_modules/a/license.md': 'Apache License 2.0',
    };
    const [notice] = collectNotices(['/app/node_modules/.pnpm/a@1.0.0/node_modules/a/index.js'], {
      read: (p) => lower[p],
      list: (dir) =>
        Object.keys(lower)
          .filter((p) => p.startsWith(`${dir}/`))
          .map((p) => p.slice(dir.length + 1)),
      override: noOverride,
    });
    expect(notice.text).toBe('Apache License 2.0');
  });

  it('uses the vendored upstream licence for a package that ships none, never an invented one', () => {
    const bare = {
      '/app/node_modules/.pnpm/x@1.0.0/node_modules/x/package.json': JSON.stringify({
        name: '@scope/x',
        version: '1.0.0',
        license: 'MIT',
        author: 'Someone Else',
      }),
    };
    const fs = {
      read: (p) => bare[p],
      list: () => ['package.json'],
    };
    const ids = ['/app/node_modules/.pnpm/x@1.0.0/node_modules/x/index.js'];
    const [notice] = collectNotices(ids, {
      ...fs,
      override: (name) =>
        name === '@scope/x' ? 'MIT License\n\nCopyright (c) Upstream' : undefined,
    });
    expect(notice.text).toBe('MIT License\n\nCopyright (c) Upstream');
    expect(() => collectNotices(ids, { ...fs, override: noOverride })).toThrow(/@scope\/x@1\.0\.0/);
  });

  it('fails the build for every bundled package without a licence, naming them all', () => {
    const missing = {
      '/app/node_modules/.pnpm/x@1.0.0/node_modules/x/package.json': JSON.stringify({
        name: 'x',
        version: '1.0.0',
        license: 'MIT',
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
        { read: (p) => missing[p], list: () => ['package.json'], override: noOverride },
      ),
    ).toThrow(/x@1\.0\.0, y@2\.0\.0/);
  });

  it('vendors the real upstream licence of @react-three/fiber', async () => {
    const { readFileSync } = await import('node:fs');
    const text = readFileSync('scripts/licenses/@react-three__fiber.txt', 'utf8');
    expect(text).toMatch(/^MIT License\n\nCopyright \(c\) 2019-2025 Poimandres/);
  });

  it('writes a plain-text notices file', () => {
    const text = formatNotices([
      { name: 'react', version: '19.0.0', license: 'MIT', text: 'MIT License' },
    ]);
    expect(text).toContain('Inside the Quad includes the following third-party software');
    expect(text).toContain('react 19.0.0 (MIT)\n\nMIT License');
  });
});
