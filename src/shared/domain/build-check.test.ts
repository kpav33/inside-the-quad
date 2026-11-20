import { describe, expect, it } from 'vitest';

import {
  BUILD_OPTIONS,
  type Build,
  CHECK_IDS,
  type CheckId,
  type CheckResult,
  checkBuild,
  REFERENCE_BUILD,
} from './build-check';

function result(change: Partial<Build>, id: CheckId): CheckResult {
  const found = checkBuild({ ...REFERENCE_BUILD, ...change }).find((r) => r.id === id);
  if (!found) throw new Error(`no ${id} result`);
  return found;
}

function expectResult(
  change: Partial<Build>,
  id: CheckId,
  status: CheckResult['status'],
  reason: string,
) {
  expect(result(change, id)).toMatchObject({ status, reason });
}

describe('REFERENCE_BUILD', () => {
  it('is the reference 5" drone', () => {
    expect(REFERENCE_BUILD).toEqual({
      frameSizeIn: 5,
      frameStackMm: 30.5,
      frameCameraMm: 19,
      frameMotorMm: 16,
      stackMm: 30.5,
      escCells: [3, 6],
      fcCells: [3, 6],
      motorMm: 16,
      kv: 1950,
      propIn: 5,
      cells: 6,
      cameraMm: 19,
      vtxVideo: 'analog',
      goggles: 'analog',
    });
  });

  it('passes every check, in order', () => {
    const results = checkBuild(REFERENCE_BUILD);
    expect(results.map((r) => r.id)).toEqual([...CHECK_IDS]);
    expect(CHECK_IDS).toEqual([
      'stack',
      'camera',
      'motor-mount',
      'props',
      'voltage',
      'kv',
      'video',
    ]);
    expect(results.every((r) => r.status === 'fits')).toBe(true);
  });

  it('offers each reference value in its pick list', () => {
    for (const [field, options] of Object.entries(BUILD_OPTIONS)) {
      const value = REFERENCE_BUILD[field as keyof Build];
      expect(options.some((o) => JSON.stringify(o) === JSON.stringify(value))).toBe(true);
    }
  });

  it('offers the design pick lists', () => {
    expect(BUILD_OPTIONS.frameSizeIn).toEqual([3, 5, 7]);
    expect(BUILD_OPTIONS.frameStackMm).toEqual([30.5, 25.5, 20]);
    expect(BUILD_OPTIONS.frameCameraMm).toEqual([28, 21, 19, 14]);
    expect(BUILD_OPTIONS.frameMotorMm).toEqual([16, 12, 9]);
    expect(BUILD_OPTIONS.stackMm).toEqual([30.5, 25.5, 20]);
    expect(BUILD_OPTIONS.escCells).toEqual([
      [1, 2],
      [2, 4],
      [3, 6],
      [3, 8],
    ]);
    expect(BUILD_OPTIONS.fcCells).toEqual(BUILD_OPTIONS.escCells);
    expect(BUILD_OPTIONS.motorMm).toEqual([16, 12, 9]);
    expect(BUILD_OPTIONS.kv).toBeUndefined();
    expect(BUILD_OPTIONS.propIn).toEqual([3, 4, 5, 6, 7]);
    expect(BUILD_OPTIONS.cells).toEqual([2, 3, 4, 5, 6]);
    expect(BUILD_OPTIONS.cameraMm).toEqual([28, 21, 19, 14]);
    expect(BUILD_OPTIONS.vtxVideo).toEqual(['analog', 'digital']);
    expect(BUILD_OPTIONS.goggles).toEqual(['analog', 'digital', 'digital-analog']);
  });
});

describe('checkBuild', () => {
  it('stack: same holes fit, different holes do not', () => {
    expectResult({}, 'stack', 'fits', 'stack-match');
    expectResult({ stackMm: 20 }, 'stack', 'fails', 'stack-differ');
    expectResult({ frameStackMm: 25.5 }, 'stack', 'fails', 'stack-differ');
  });

  it('camera: same width fits, narrower needs checking, wider does not fit', () => {
    expectResult({}, 'camera', 'fits', 'camera-match');
    expectResult({ cameraMm: 14 }, 'camera', 'check', 'camera-narrower');
    expectResult({ cameraMm: 21 }, 'camera', 'fails', 'camera-wider');
  });

  it('motor mount: same pattern fits, different does not', () => {
    expectResult({}, 'motor-mount', 'fits', 'motor-match');
    expectResult({ motorMm: 12 }, 'motor-mount', 'fails', 'motor-differ');
  });

  it('props: frame size or 1" smaller fits, 2" smaller needs checking, larger fails', () => {
    expectResult({}, 'props', 'fits', 'props-match');
    expectResult({ propIn: 4 }, 'props', 'fits', 'props-match');
    expectResult({ propIn: 3 }, 'props', 'check', 'props-smaller');
    expectResult({ propIn: 6 }, 'props', 'fails', 'props-larger');
    expectResult({ propIn: 7 }, 'props', 'fails', 'props-larger');
    expectResult({ frameSizeIn: 7, propIn: 7 }, 'props', 'fits', 'props-match');
  });

  it('voltage: cells within both ratings fit; the reason names which rating misses', () => {
    expectResult({}, 'voltage', 'fits', 'voltage-ok');
    expectResult({ escCells: [2, 4] }, 'voltage', 'fails', 'esc-cells');
    expectResult({ fcCells: [2, 4] }, 'voltage', 'fails', 'fc-cells');
    expectResult({ escCells: [1, 2], fcCells: [2, 4] }, 'voltage', 'fails', 'both-cells');
    expectResult({ cells: 2, escCells: [3, 8], fcCells: [2, 4] }, 'voltage', 'fails', 'esc-cells');
    expectResult({ cells: 2 }, 'voltage', 'fails', 'both-cells');
    expectResult({ cells: 4, escCells: [2, 4], fcCells: [3, 8] }, 'voltage', 'fits', 'voltage-ok');
  });

  it('kv: the motors lesson bands fit, 4S motors on 6S fail, anything else needs checking', () => {
    expectResult({ kv: 1750 }, 'kv', 'fits', 'kv-6s');
    expectResult({ kv: 1950 }, 'kv', 'fits', 'kv-6s');
    expectResult({ cells: 4, kv: 2500 }, 'kv', 'fits', 'kv-4s');
    expectResult({ cells: 4, kv: 1950 }, 'kv', 'check', 'kv-outside-4s');
    expectResult({ kv: 2100 }, 'kv', 'check', 'kv-outside-6s');
    expectResult({ kv: 1600 }, 'kv', 'check', 'kv-outside-6s');
    expectResult({ kv: 2400 }, 'kv', 'fails', 'kv-too-high-6s');
    expectResult({ cells: 3, kv: 2500 }, 'kv', 'check', 'kv-other-cells');
    expectResult({ frameSizeIn: 7, propIn: 7, kv: 1300 }, 'kv', 'check', 'kv-other-size');
    expectResult({ frameSizeIn: 7, propIn: 7, kv: 2600 }, 'kv', 'check', 'kv-other-size');
  });

  it('kv: judges the lesson bands only on 5" props, whatever the frame', () => {
    // Review 07, finding 2: small props take high-KV motors on 6S; the lessons don't cover them.
    expectResult({ propIn: 3, kv: 2900 }, 'kv', 'check', 'kv-other-size');
    expectResult({ propIn: 4, kv: 2400 }, 'kv', 'check', 'kv-other-size');
    expectResult({ frameSizeIn: 7, propIn: 5, kv: 1950 }, 'kv', 'fits', 'kv-6s');
    expectResult({ kv: null }, 'kv', 'check', 'kv-missing');
  });

  it('video: analog needs an analog receiver; digital needs the same system', () => {
    expectResult({}, 'video', 'fits', 'analog-analog');
    expectResult({ goggles: 'digital-analog' }, 'video', 'fits', 'analog-receiver');
    expectResult({ goggles: 'digital' }, 'video', 'fails', 'analog-to-digital');
    expectResult({ vtxVideo: 'digital', goggles: 'digital' }, 'video', 'check', 'same-system');
    expectResult(
      { vtxVideo: 'digital', goggles: 'digital-analog' },
      'video',
      'check',
      'same-system',
    );
    expectResult({ vtxVideo: 'digital' }, 'video', 'fails', 'digital-to-analog');
  });

  it('lights the parts each check is about', () => {
    const parts = Object.fromEntries(checkBuild(REFERENCE_BUILD).map((r) => [r.id, r.parts]));
    expect(parts).toEqual({
      stack: ['frame', 'fc', 'esc'],
      camera: ['frame', 'camera'],
      'motor-mount': ['frame', 'motors'],
      props: ['frame', 'props'],
      voltage: ['battery', 'esc', 'fc'],
      kv: ['motors', 'battery'],
      video: ['vtx', 'camera'],
    });
  });
});
