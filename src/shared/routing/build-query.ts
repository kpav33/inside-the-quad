import {
  BUILD_OPTIONS,
  type Build,
  type CellRange,
  KV_RANGE,
  REFERENCE_BUILD,
} from '@/shared/domain/build-check';

/** Each field's name in the address, in the order they are written. */
const KEYS: { readonly [K in keyof Build]: string } = {
  frameSizeIn: 'frame',
  frameStackMm: 'frame-stack',
  frameCameraMm: 'frame-camera',
  frameMotorMm: 'frame-motor',
  stackMm: 'stack',
  escCells: 'esc',
  fcCells: 'fc',
  motorMm: 'motor',
  kv: 'kv',
  propIn: 'props',
  cells: 'cells',
  cameraMm: 'camera',
  vtxVideo: 'video',
  goggles: 'goggles',
};

const FIELDS = Object.keys(KEYS) as (keyof Build)[];

function write(value: Build[keyof Build]): string {
  if (Array.isArray(value)) return (value as CellRange).join('-');
  return String(value);
}

/** A typed KV: a whole number in range, else null. */
function readKv(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const kv = Number(raw);
  return kv >= KV_RANGE[0] && kv <= KV_RANGE[1] ? kv : null;
}

/**
 * Reads a build from a query string. A field that is missing, unknown, out of its pick list or
 * malformed keeps the reference value; nothing throws.
 */
export function parseBuild(search: string): Build {
  const params = new URLSearchParams(search);
  const build: Record<string, unknown> = { ...REFERENCE_BUILD };
  for (const field of FIELDS) {
    const raw = params.get(KEYS[field]);
    if (raw === null) continue;
    if (field === 'kv') {
      const kv = readKv(raw);
      if (kv !== null) build.kv = kv;
      continue;
    }
    const option = BUILD_OPTIONS[field]?.find((candidate) => write(candidate) === raw);
    if (option !== undefined) build[field] = option;
  }
  return build as unknown as Build;
}

/**
 * The query string for a build: `''` for the reference, else `?key=value&…` with only the fields
 * that differ, in a fixed order. A KV that isn't entered is left out.
 */
export function buildSearch(build: Build): string {
  const params = new URLSearchParams();
  for (const field of FIELDS) {
    const value = build[field];
    if (value === null) continue;
    if (write(value) !== write(REFERENCE_BUILD[field])) params.set(KEYS[field], write(value));
  }
  const search = params.toString();
  return search === '' ? '' : `?${search}`;
}
