import { describe, expect, it } from 'vitest';

import { REFERENCE_BUILD } from '@/shared/domain/build-check';

import { buildSearch, parseBuild } from './build-query';

describe('build query', () => {
  it('reads an empty query as the reference build, and writes the reference as nothing', () => {
    expect(parseBuild('')).toEqual(REFERENCE_BUILD);
    expect(parseBuild('?')).toEqual(REFERENCE_BUILD);
    expect(buildSearch(REFERENCE_BUILD)).toBe('');
  });

  it('writes only the fields that differ, in a fixed order, and reads them back', () => {
    const build = {
      ...REFERENCE_BUILD,
      goggles: 'digital-analog' as const,
      cameraMm: 21 as const,
      escCells: [2, 4] as const,
      kv: 2400,
    };
    const search = buildSearch(build);
    expect(search).toBe('?esc=2-4&kv=2400&camera=21&goggles=digital-analog');
    expect(parseBuild(search)).toEqual(build);
  });

  it('leaves a KV that is not entered out of the address', () => {
    expect(buildSearch({ ...REFERENCE_BUILD, kv: null })).toBe('');
    expect(buildSearch({ ...REFERENCE_BUILD, kv: null, cells: 4 })).toBe('?cells=4');
    expect(parseBuild('?kv=')).toEqual(REFERENCE_BUILD);
  });

  it('round-trips every field', () => {
    const build = {
      frameSizeIn: 7,
      frameStackMm: 20,
      frameCameraMm: 14,
      frameMotorMm: 9,
      stackMm: 25.5,
      escCells: [1, 2],
      fcCells: [3, 8],
      motorMm: 12,
      kv: 500,
      propIn: 3,
      cells: 2,
      cameraMm: 28,
      vtxVideo: 'digital',
      goggles: 'digital',
    } as const;
    expect(parseBuild(buildSearch(build))).toEqual(build);
  });

  it('falls back to the reference for unknown or malformed values', () => {
    expect(parseBuild('?stack=31&cells=9&kv=abc&video=x&esc=6-3&frame=5.0x&zzz=1')).toEqual(
      REFERENCE_BUILD,
    );
    expect(parseBuild('?kv=2400.5').kv).toBe(REFERENCE_BUILD.kv);
    expect(parseBuild('?kv=99999').kv).toBe(REFERENCE_BUILD.kv);
    expect(parseBuild('?kv=499').kv).toBe(REFERENCE_BUILD.kv);
    expect(parseBuild('?kv=%E0%A4%A').kv).toBe(REFERENCE_BUILD.kv);
  });
});
