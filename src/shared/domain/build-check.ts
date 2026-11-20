import { REFERENCE_5_INCH } from './drone-spec';
import type { PartId } from './parts';

/** Battery sizes a board is rated for, in cells: [fewest, most]. */
export type CellRange = readonly [min: number, max: number];

/** A planned build: the numbers on each part's shop page that decide whether they fit. */
export interface Build {
  frameSizeIn: 3 | 5 | 7;
  frameStackMm: 30.5 | 25.5 | 20;
  frameCameraMm: 28 | 21 | 19 | 14;
  frameMotorMm: 16 | 12 | 9;
  stackMm: 30.5 | 25.5 | 20;
  escCells: CellRange;
  fcCells: CellRange;
  motorMm: 16 | 12 | 9;
  /** Typed by hand; null when not entered (or not a whole number in 500–5000). */
  kv: number | null;
  propIn: 3 | 4 | 5 | 6 | 7;
  cells: 2 | 3 | 4 | 5 | 6;
  cameraMm: 28 | 21 | 19 | 14;
  vtxVideo: 'analog' | 'digital';
  goggles: 'analog' | 'digital' | 'digital-analog';
}

export type CheckId = 'stack' | 'camera' | 'motor-mount' | 'props' | 'voltage' | 'kv' | 'video';
export type CheckStatus = 'fits' | 'check' | 'fails';

export interface CheckResult {
  id: CheckId;
  status: CheckStatus;
  /** Why, as a key the copy turns into words (e.g. 'camera-narrower', 'esc-cells'). */
  reason: string;
  /** The drone parts this check is about, lit on the drawing. */
  parts: readonly PartId[];
}

const CELL_RANGES: readonly CellRange[] = [
  [1, 2],
  [2, 4],
  [3, 6],
  [3, 8],
];

/** The pick list for each field; KV has none (it is typed). */
export const BUILD_OPTIONS: { readonly [K in keyof Build]?: readonly Build[K][] } = {
  frameSizeIn: [3, 5, 7],
  frameStackMm: [30.5, 25.5, 20],
  frameCameraMm: [28, 21, 19, 14],
  frameMotorMm: [16, 12, 9],
  stackMm: [30.5, 25.5, 20],
  escCells: CELL_RANGES,
  fcCells: CELL_RANGES,
  motorMm: [16, 12, 9],
  propIn: [3, 4, 5, 6, 7],
  cells: [2, 3, 4, 5, 6],
  cameraMm: [28, 21, 19, 14],
  vtxVideo: ['analog', 'digital'],
  goggles: ['analog', 'digital', 'digital-analog'],
};

/** Typed KV values outside this range count as not entered. */
export const KV_RANGE = [500, 5000] as const;

const spec = REFERENCE_5_INCH;

function pick<T>(options: readonly T[] | undefined, value: unknown): T {
  const found = options?.find((option) => JSON.stringify(option) === JSON.stringify(value));
  if (found === undefined) throw new Error(`${JSON.stringify(value)} is not a pick-list value`);
  return found;
}

/** The reference drone as a build: every check fits. */
export const REFERENCE_BUILD: Build = {
  frameSizeIn: pick(BUILD_OPTIONS.frameSizeIn, spec.prop.diameterIn),
  frameStackMm: pick(BUILD_OPTIONS.frameStackMm, spec.frame.stackMountMm),
  frameCameraMm: pick(BUILD_OPTIONS.frameCameraMm, spec.camera.widthMm),
  frameMotorMm: pick(BUILD_OPTIONS.frameMotorMm, spec.motor.mountPatternMm),
  stackMm: pick(BUILD_OPTIONS.stackMm, spec.frame.stackMountMm),
  escCells: pick(BUILD_OPTIONS.escCells, spec.esc.batteryCells),
  fcCells: pick(BUILD_OPTIONS.fcCells, spec.fc.batteryCells),
  motorMm: pick(BUILD_OPTIONS.motorMm, spec.motor.mountPatternMm),
  kv: spec.motor.kv,
  propIn: pick(BUILD_OPTIONS.propIn, spec.prop.diameterIn),
  cells: pick(BUILD_OPTIONS.cells, spec.motor.batteryCells),
  cameraMm: pick(BUILD_OPTIONS.cameraMm, spec.camera.widthMm),
  vtxVideo: spec.camera.signal,
  goggles: spec.camera.signal,
};

export const CHECK_IDS: readonly CheckId[] = [
  'stack',
  'camera',
  'motor-mount',
  'props',
  'voltage',
  'kv',
  'video',
];

/**
 * KV bands the motors lesson gives for a 5" quad, by cell count. They hold for 5" props: smaller
 * props take higher-KV motors, so on other props the lessons can't judge the KV.
 */
export const KV_BANDS_5_INCH = { 6: [1750, 1950], 4: [2400, 2700] } as const;

const within = (value: number, [min, max]: readonly [number, number]) =>
  value >= min && value <= max;

type Verdict = Pick<CheckResult, 'status' | 'reason'>;

function stack(b: Build): Verdict {
  return b.stackMm === b.frameStackMm
    ? { status: 'fits', reason: 'stack-match' }
    : { status: 'fails', reason: 'stack-differ' };
}

function camera(b: Build): Verdict {
  if (b.cameraMm === b.frameCameraMm) return { status: 'fits', reason: 'camera-match' };
  return b.cameraMm < b.frameCameraMm
    ? { status: 'check', reason: 'camera-narrower' }
    : { status: 'fails', reason: 'camera-wider' };
}

function motorMount(b: Build): Verdict {
  return b.motorMm === b.frameMotorMm
    ? { status: 'fits', reason: 'motor-match' }
    : { status: 'fails', reason: 'motor-differ' };
}

function props(b: Build): Verdict {
  if (b.propIn > b.frameSizeIn) return { status: 'fails', reason: 'props-larger' };
  return b.frameSizeIn - b.propIn <= 1
    ? { status: 'fits', reason: 'props-match' }
    : { status: 'check', reason: 'props-smaller' };
}

function voltage(b: Build): Verdict {
  const esc = within(b.cells, b.escCells);
  const fc = within(b.cells, b.fcCells);
  if (esc && fc) return { status: 'fits', reason: 'voltage-ok' };
  return { status: 'fails', reason: !esc && !fc ? 'both-cells' : !esc ? 'esc-cells' : 'fc-cells' };
}

function kv(b: Build): Verdict {
  if (b.kv === null) return { status: 'check', reason: 'kv-missing' };
  if (b.propIn !== 5) return { status: 'check', reason: 'kv-other-size' };
  if (b.cells === 6) {
    if (within(b.kv, KV_BANDS_5_INCH[6])) return { status: 'fits', reason: 'kv-6s' };
    if (b.kv >= KV_BANDS_5_INCH[4][0]) return { status: 'fails', reason: 'kv-too-high-6s' };
    return { status: 'check', reason: 'kv-outside-6s' };
  }
  if (b.cells === 4) {
    return within(b.kv, KV_BANDS_5_INCH[4])
      ? { status: 'fits', reason: 'kv-4s' }
      : { status: 'check', reason: 'kv-outside-4s' };
  }
  return { status: 'check', reason: 'kv-other-cells' };
}

function video(b: Build): Verdict {
  if (b.vtxVideo === 'analog') {
    if (b.goggles === 'analog') return { status: 'fits', reason: 'analog-analog' };
    return b.goggles === 'digital-analog'
      ? { status: 'fits', reason: 'analog-receiver' }
      : { status: 'fails', reason: 'analog-to-digital' };
  }
  return b.goggles === 'analog'
    ? { status: 'fails', reason: 'digital-to-analog' }
    : { status: 'check', reason: 'same-system' };
}

const CHECKS: Record<CheckId, { run: (b: Build) => Verdict; parts: readonly PartId[] }> = {
  stack: { run: stack, parts: ['frame', 'fc', 'esc'] },
  camera: { run: camera, parts: ['frame', 'camera'] },
  'motor-mount': { run: motorMount, parts: ['frame', 'motors'] },
  props: { run: props, parts: ['frame', 'props'] },
  voltage: { run: voltage, parts: ['battery', 'esc', 'fc'] },
  kv: { run: kv, parts: ['motors', 'battery'] },
  video: { run: video, parts: ['vtx', 'camera'] },
};

/** Runs the seven checks on a build, in `CHECK_IDS` order. */
export function checkBuild(build: Build): CheckResult[] {
  return CHECK_IDS.map((id) => ({ id, ...CHECKS[id].run(build), parts: CHECKS[id].parts }));
}
