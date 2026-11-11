import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import { OVERVIEW_PATH, parseRoute, partPath } from './routes';

describe('part routes', () => {
  it.each(PART_IDS)('round-trips the path of %s', (part) => {
    expect(parseRoute(partPath(part))).toEqual({ kind: 'part', part });
  });

  it('puts a lesson under /parts/', () => {
    expect(partPath('vtx')).toBe('/parts/vtx');
  });

  it('reads the root and the empty path as the overview', () => {
    expect(parseRoute(OVERVIEW_PATH)).toEqual({ kind: 'overview' });
    expect(parseRoute('')).toEqual({ kind: 'overview' });
  });

  it('accepts a trailing slash', () => {
    expect(parseRoute('/parts/vtx/')).toEqual({ kind: 'part', part: 'vtx' });
  });

  it('matches ids exactly, so other casing is unknown', () => {
    expect(parseRoute('/parts/VTX')).toEqual({ kind: 'unknown', slug: 'VTX' });
  });

  it('decodes the slug of an unknown part', () => {
    expect(parseRoute('/parts/foo%20bar')).toEqual({ kind: 'unknown', slug: 'foo bar' });
  });

  it('keeps a malformed escape as written instead of throwing', () => {
    expect(parseRoute('/parts/%E0')).toEqual({ kind: 'unknown', slug: '%E0' });
  });

  it('reports any other path whole', () => {
    expect(parseRoute('/about')).toEqual({ kind: 'unknown', slug: '/about' });
  });
});
