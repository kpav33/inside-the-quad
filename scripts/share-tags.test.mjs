import { describe, expect, it } from 'vitest';

import { readSiteUrl, shareTags } from './share-tags.mjs';

const byKey = (tags) =>
  Object.fromEntries(tags.map((tag) => [tag.attrs.property ?? tag.attrs.name, tag.attrs.content]));

describe('shareTags', () => {
  it('gives Vite head tags', () => {
    for (const tag of shareTags(null)) {
      expect(tag).toMatchObject({ tag: 'meta', injectTo: 'head' });
    }
  });

  it('always gives the title, description and type', () => {
    const tags = byKey(shareTags(null));
    expect(tags['og:type']).toBe('website');
    expect(tags['og:site_name']).toBe('Inside the Quad');
    expect(tags['og:title']).toBe('Inside the Quad');
    expect(tags['og:description']).toMatch(/FPV drone works, part by part/);
    expect(tags['twitter:card']).toBe('summary');
  });

  it('leaves out the image while the site has no address', () => {
    const tags = byKey(shareTags(null));
    expect(tags).not.toHaveProperty('og:image');
    expect(tags).not.toHaveProperty('twitter:image');
  });

  it('gives the image as an absolute address once the site has one', () => {
    const tags = byKey(shareTags('https://insidethequad.example'));
    expect(tags['og:image']).toBe('https://insidethequad.example/og-image.png');
    expect(tags['og:image:width']).toBe('1200');
    expect(tags['og:image:height']).toBe('630');
    expect(tags['og:image:alt']).toBeTruthy();
    expect(tags['twitter:card']).toBe('summary_large_image');
  });
});

describe('readSiteUrl', () => {
  it('is null when unset or empty', () => {
    expect(readSiteUrl(undefined)).toBeNull();
    expect(readSiteUrl('')).toBeNull();
    expect(readSiteUrl('  ')).toBeNull();
  });

  it('keeps the origin and drops a trailing slash', () => {
    expect(readSiteUrl('https://insidethequad.example/')).toBe('https://insidethequad.example');
    expect(readSiteUrl('https://x.b-cdn.net')).toBe('https://x.b-cdn.net');
  });

  it('refuses an address that is not absolute http(s), so a typo fails the build', () => {
    expect(() => readSiteUrl('insidethequad.com')).toThrow(/VITE_SITE_URL/);
    expect(() => readSiteUrl('ftp://insidethequad.com')).toThrow(/VITE_SITE_URL/);
    expect(() => readSiteUrl('https://insidethequad.com/app')).toThrow(/VITE_SITE_URL/);
  });
});
