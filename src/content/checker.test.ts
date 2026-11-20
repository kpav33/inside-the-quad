import { describe, expect, it } from 'vitest';

import {
  BUILD_OPTIONS,
  type Build,
  CHECK_IDS,
  checkBuild,
  REFERENCE_BUILD,
} from '@/shared/domain/build-check';

import { CHECKER, checkLesson, checkName, checkReason, optionLabel } from './checker';
import { UI } from './ui';

/** Builds that reach every reason `checkBuild` can give (the cases from its tests). */
const CASES: Partial<Build>[] = [
  {},
  { stackMm: 20 },
  { cameraMm: 14 },
  { cameraMm: 21 },
  { motorMm: 12 },
  { propIn: 3 },
  { propIn: 7 },
  { escCells: [2, 4] },
  { fcCells: [2, 4] },
  { cells: 2 },
  { cells: 4, kv: 2500 },
  { cells: 4, kv: 1950 },
  { kv: 2100 },
  { kv: 2400 },
  { cells: 3, kv: 2500 },
  { frameSizeIn: 7, propIn: 7, kv: 1300 },
  { kv: null },
  { goggles: 'digital-analog' },
  { goggles: 'digital' },
  { vtxVideo: 'digital', goggles: 'digital' },
  { vtxVideo: 'digital' },
];

function reasonFor(change: Partial<Build>, id: string): string {
  const build = { ...REFERENCE_BUILD, ...change };
  const result = checkBuild(build).find((r) => r.id === id);
  if (!result) throw new Error(id);
  return checkReason(result, build);
}

describe('checker copy', () => {
  it('names every check and links it to a lesson', () => {
    expect(CHECK_IDS.map(checkName)).toEqual([
      'Stack mounting',
      'Camera width',
      'Motor mount',
      'Prop size',
      'Voltage',
      'Motor KV',
      'Video system',
    ]);
    expect(CHECK_IDS.map(checkLesson)).toEqual([
      'frame',
      'frame',
      'motors',
      'props',
      'battery',
      'motors',
      'vtx',
    ]);
  });

  it('has a sentence for every reason a check can give', () => {
    const reasons = new Set<string>();
    for (const change of CASES) {
      const build = { ...REFERENCE_BUILD, ...change };
      for (const result of checkBuild(build)) {
        reasons.add(result.reason);
        const text = checkReason(result, build);
        expect(text, result.reason).toMatch(/^[A-Z0-9].*\.$/);
        expect(text, result.reason).not.toMatch(/undefined|null|NaN/);
      }
    }
    expect(reasons.size).toBe(27);
  });

  it('puts the numbers involved in the reason', () => {
    const narrower = reasonFor({ cameraMm: 14 }, 'camera');
    expect(narrower).toContain('14 mm');
    expect(narrower).toContain('19 mm');
    expect(reasonFor({ escCells: [2, 4] }, 'voltage')).toMatch(/ESC.*2–4S|6S/);
    expect(reasonFor({ escCells: [2, 4] }, 'voltage')).toContain('6S');
    expect(reasonFor({ kv: 2400 }, 'kv')).toContain('2400 KV');
  });

  it('scopes the voltage check to the ESC and FC, and says to check the camera and VTX', () => {
    // Review 07, finding 1: how the camera and VTX are powered isn't an input, so it isn't checked.
    const text = reasonFor({}, 'voltage');
    expect(text).toMatch(/ESC’s 3–6S and the FC’s 3–6S/);
    expect(text).toMatch(/Check what your camera and VTX need/);
    expect(text).toMatch(/some builds power the VTX straight from the battery/);
    expect(text).not.toMatch(/battery doesn’t reach them/);
  });

  it('ties the high-KV warning to 5″ props, not to every KV', () => {
    // Review 07, finding 2.
    const text = reasonFor({ kv: 2400 }, 'kv');
    expect(text).toContain('5″ props');
    expect(text).not.toMatch(/motors are made for 4S/);
    expect(reasonFor({ propIn: 3, kv: 2900 }, 'kv')).toContain('3″ props');
  });

  it('says digital video must be one system, without naming brands', () => {
    expect(reasonFor({ vtxVideo: 'digital', goggles: 'digital' }, 'video')).toMatch(
      /same digital system/,
    );
  });

  it('labels every pick-list option', () => {
    expect(optionLabel('stackMm', 30.5)).toBe('30.5 mm');
    expect(optionLabel('escCells', [3, 6])).toBe('3–6S');
    expect(optionLabel('cells', 6)).toBe('6S');
    expect(optionLabel('propIn', 5)).toBe('5″');
    expect(optionLabel('goggles', 'digital-analog')).toBe('Digital with an analog receiver');
    for (const [field, options] of Object.entries(BUILD_OPTIONS)) {
      for (const option of options) {
        expect(optionLabel(field as keyof Build, option as never)).not.toBe('');
      }
    }
  });

  it('groups every field under its part, frame first', () => {
    expect(CHECKER.groups.map((g) => g.heading)).toEqual([
      'Frame',
      'FC/ESC stack',
      'Motors',
      'Props',
      'Battery',
      'Camera',
      'VTX',
      'Goggles',
    ]);
    const fields = CHECKER.groups.flatMap((g) => g.fields.map((f) => f.field)).sort();
    expect(fields).toEqual(Object.keys(REFERENCE_BUILD).sort());
  });

  it('names no brands and no prices', () => {
    const text = JSON.stringify([
      CHECKER,
      UI.checker,
      CASES.flatMap((change) => {
        const build = { ...REFERENCE_BUILD, ...change };
        return checkBuild(build).map((r) => checkReason(r, build));
      }),
    ]);
    expect(text).not.toMatch(/DJI|Walksnail|HDZero|Radiomaster|TBS|Fat ?Shark|ISDT|\$|€/i);
  });

  it('summarises the results by status', () => {
    expect(UI.checker.summary({ fits: 7, check: 0, fails: 0 })).toBe('7 fit');
    expect(UI.checker.summary({ fits: 6, check: 0, fails: 1 })).toBe('6 fit · 1 doesn’t');
    expect(UI.checker.summary({ fits: 5, check: 1, fails: 1 })).toBe(
      '5 fit · 1 doesn’t · 1 to check',
    );
  });
});
