import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import { INTRO_PATH, OVERVIEW_PATH, pagePath, parseRoute, partPath, pathSheetPath } from './routes';

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

describe('intro route', () => {
  it('reads /intro, with or without a trailing slash', () => {
    expect(parseRoute('/intro')).toEqual({ kind: 'intro' });
    expect(parseRoute('/intro/')).toEqual({ kind: 'intro' });
  });

  it('treats anything under /intro/ as unknown', () => {
    expect(parseRoute('/intro/x')).toEqual({ kind: 'unknown', slug: '/intro/x' });
  });

  it('gives every page its address', () => {
    expect(pagePath('intro')).toBe(INTRO_PATH);
    expect(INTRO_PATH).toBe('/intro');
    expect(pagePath(null)).toBe('/');
    expect(pagePath('vtx')).toBe('/parts/vtx');
  });
});

describe('path routes', () => {
  it('reads a path under /paths/, with or without a trailing slash', () => {
    expect(parseRoute('/paths/power')).toEqual({ kind: 'path', path: 'power', step: 1 });
    expect(parseRoute('/paths/power/')).toEqual({ kind: 'path', path: 'power', step: 1 });
  });

  it('treats an unknown path id as unknown', () => {
    expect(parseRoute('/paths/wires')).toEqual({ kind: 'unknown', slug: 'wires' });
  });

  it('reads the step after the path, from 1', () => {
    expect(parseRoute('/paths/power/3')).toEqual({ kind: 'path', path: 'power', step: 3 });
    expect(parseRoute('/paths/power/3/')).toEqual({ kind: 'path', path: 'power', step: 3 });
  });

  it('treats a step that is not a whole number as unknown', () => {
    for (const slug of ['power/x', 'power/2.5', 'power/2/x']) {
      expect(parseRoute(`/paths/${slug}`)).toEqual({ kind: 'unknown', slug });
    }
  });

  it('reads a step below 1 as step 1, and a huge one as a large finite step', () => {
    expect(parseRoute('/paths/power/0')).toEqual({ kind: 'path', path: 'power', step: 1 });
    expect(parseRoute('/paths/power/-1')).toEqual({ kind: 'path', path: 'power', step: 1 });
    const huge = parseRoute(`/paths/power/${'9'.repeat(400)}`);
    expect(huge.kind === 'path' && Number.isFinite(huge.step) && huge.step > 100).toBe(true);
  });

  it('writes the step into the address, leaving out step 1', () => {
    expect(pathSheetPath('video', 4)).toBe('/paths/video/4');
    expect(pathSheetPath('video', 1)).toBe('/paths/video');
    expect(pagePath('video', 2)).toBe('/paths/video/2');
  });

  it('gives every path its address', () => {
    expect(pagePath('video')).toBe('/paths/video');
    expect(pathSheetPath('control')).toBe('/paths/control');
  });
});
