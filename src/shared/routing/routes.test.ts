import { describe, expect, it } from 'vitest';

import { PART_IDS } from '@/shared/domain/parts';

import {
  gearPath,
  INTRO_PATH,
  OVERVIEW_PATH,
  pagePath,
  parseRoute,
  partPath,
  pathSheetPath,
  steppedPath,
} from './routes';

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

describe('the what-if sheet', () => {
  it('reads /what-if as step 1 and /what-if/n as step n', () => {
    expect(parseRoute('/what-if')).toEqual({ kind: 'what-if', step: 1 });
    expect(parseRoute('/what-if/3')).toEqual({ kind: 'what-if', step: 3 });
    expect(parseRoute('/what-if/0')).toEqual({ kind: 'what-if', step: 1 });
    expect(parseRoute('/what-if/x').kind).toBe('unknown');
    expect(parseRoute('/what-if/2/3').kind).toBe('unknown');
  });

  it('writes the step into the address', () => {
    expect(steppedPath('what-if', 2)).toBe('/what-if/2');
    expect(pagePath('what-if')).toBe('/what-if');
  });
});

describe('the moves sheet', () => {
  it('reads /moves as step 1 and /moves/n as step n', () => {
    expect(parseRoute('/moves')).toEqual({ kind: 'moves', step: 1 });
    expect(parseRoute('/moves/')).toEqual({ kind: 'moves', step: 1 });
    expect(parseRoute('/moves/3')).toEqual({ kind: 'moves', step: 3 });
    expect(parseRoute('/moves/0')).toEqual({ kind: 'moves', step: 1 });
  });

  it('treats a step that is not a whole number as unknown', () => {
    expect(parseRoute('/moves/x').kind).toBe('unknown');
    expect(parseRoute('/moves/2/3').kind).toBe('unknown');
    expect(parseRoute('/movesx').kind).toBe('unknown');
  });

  it('writes the step into the address, leaving out step 1', () => {
    expect(steppedPath('moves', 1)).toBe('/moves');
    expect(steppedPath('moves', 4)).toBe('/moves/4');
    expect(steppedPath('power', 2)).toBe('/paths/power/2');
    expect(pagePath('moves')).toBe('/moves');
    expect(pagePath('moves', 3)).toBe('/moves/3');
  });
});

describe('gear routes', () => {
  it('reads a gear sheet under /gear/, with or without a trailing slash', () => {
    expect(parseRoute('/gear/radio')).toEqual({ kind: 'gear', gear: 'radio' });
    expect(parseRoute('/gear/radio/')).toEqual({ kind: 'gear', gear: 'radio' });
  });

  it('treats /gear alone, an unknown id or extra segments as unknown', () => {
    for (const path of ['/gear', '/gear/', '/gear/drone', '/gear/radio/2']) {
      expect(parseRoute(path).kind).toBe('unknown');
    }
  });

  it('gives each gear sheet its address', () => {
    expect(pagePath('charger')).toBe('/gear/charger');
    expect(gearPath('goggles')).toBe('/gear/goggles');
  });
});
