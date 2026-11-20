import {
  type Build,
  type CellRange,
  type CheckId,
  type CheckResult,
  KV_BANDS_5_INCH,
} from '@/shared/domain/build-check';
import type { PartId } from '@/shared/domain/parts';

type Field = keyof Build;

export interface CheckerGroup {
  heading: string;
  fields: readonly { field: Field; label: string }[];
}

/** The Check a build sheet's own words; the shared interface text is in `UI.checker`. */
export const CHECKER = {
  lead: 'Pick your parts’ numbers from their shop pages, and see whether they fit together. It starts filled in with the drone in this app, so everything fits.',
  groups: [
    {
      heading: 'Frame',
      fields: [
        { field: 'frameSizeIn', label: 'Size (largest prop)' },
        { field: 'frameStackMm', label: 'Stack holes' },
        { field: 'frameCameraMm', label: 'Camera mount' },
        { field: 'frameMotorMm', label: 'Motor mount' },
      ],
    },
    {
      heading: 'FC/ESC stack',
      fields: [
        { field: 'stackMm', label: 'Hole spacing' },
        { field: 'escCells', label: 'ESC rated for' },
        { field: 'fcCells', label: 'FC rated for' },
      ],
    },
    {
      heading: 'Motors',
      fields: [
        { field: 'motorMm', label: 'Mount' },
        { field: 'kv', label: 'KV' },
      ],
    },
    { heading: 'Props', fields: [{ field: 'propIn', label: 'Size' }] },
    { heading: 'Battery', fields: [{ field: 'cells', label: 'Cells' }] },
    { heading: 'Camera', fields: [{ field: 'cameraMm', label: 'Width' }] },
    { heading: 'VTX', fields: [{ field: 'vtxVideo', label: 'Video' }] },
    { heading: 'Goggles', fields: [{ field: 'goggles', label: 'Video' }] },
  ] satisfies readonly CheckerGroup[],
  kvHint: 'A whole number, 500–5000',
} as const;

const VIDEO_LABELS: Record<Build['goggles'], string> = {
  analog: 'Analog',
  digital: 'Digital',
  'digital-analog': 'Digital with an analog receiver',
};

const cellRange = ([min, max]: CellRange) => `${min}–${max}S`;
const mm = (value: number) => `${value} mm`;
const inches = (value: number) => `${value}″`;

/** How a pick-list value is shown: `30.5 mm`, `3–6S`, `5″`, `Digital with an analog receiver`. */
export function optionLabel<F extends Field>(field: F, value: Build[F]): string {
  switch (field) {
    case 'frameSizeIn':
    case 'propIn':
      return inches(value as number);
    case 'escCells':
    case 'fcCells':
      return cellRange(value as CellRange);
    case 'cells':
      return `${value as number}S`;
    case 'kv':
      return value === null ? '' : `${value as number} KV`;
    case 'vtxVideo':
    case 'goggles':
      return VIDEO_LABELS[value as Build['goggles']];
    default:
      return mm(value as number);
  }
}

const NAMES: Record<CheckId, string> = {
  stack: 'Stack mounting',
  camera: 'Camera width',
  'motor-mount': 'Motor mount',
  props: 'Prop size',
  voltage: 'Voltage',
  kv: 'Motor KV',
  video: 'Video system',
};

const LESSONS: Record<CheckId, PartId> = {
  stack: 'frame',
  camera: 'frame',
  'motor-mount': 'motors',
  props: 'props',
  voltage: 'battery',
  kv: 'motors',
  video: 'vtx',
};

export function checkName(id: CheckId): string {
  return NAMES[id];
}

/** The lesson that explains a check. */
export function checkLesson(id: CheckId): PartId {
  return LESSONS[id];
}

const [kv6Low, kv6High] = KV_BANDS_5_INCH[6];
const [kv4Low, kv4High] = KV_BANDS_5_INCH[4];
const bands = `about ${kv6Low}–${kv6High} KV on 6S and ${kv4Low}–${kv4High} KV on 4S`;

/** One line saying why a check came out as it did, with the numbers involved. */
export function checkReason(result: CheckResult, b: Build): string {
  const cells = `${b.cells}S`;
  const kv = `${b.kv ?? ''} KV`;
  const reasons: Record<string, () => string> = {
    'stack-match': () =>
      `The stack’s ${mm(b.stackMm)} holes match the frame’s ${mm(b.frameStackMm)} holes.`,
    'stack-differ': () =>
      `The stack’s holes are ${mm(b.stackMm)} apart, the frame’s ${mm(b.frameStackMm)}: the boards won’t screw on.`,
    'camera-match': () =>
      `The ${mm(b.cameraMm)} camera fits the frame’s ${mm(b.frameCameraMm)} camera mount.`,
    'camera-narrower': () =>
      `The ${mm(b.cameraMm)} camera is narrower than the frame’s ${mm(b.frameCameraMm)} mount. It can fit with adapter brackets; check that you can get them.`,
    'camera-wider': () =>
      `The ${mm(b.cameraMm)} camera is wider than the frame’s ${mm(b.frameCameraMm)} mount: it won’t fit between the side plates.`,
    'motor-match': () =>
      `The motors’ ${mm(b.motorMm)} hole pattern matches the frame’s ${mm(b.frameMotorMm)} motor mounts.`,
    'motor-differ': () =>
      `The motors’ holes are ${mm(b.motorMm)} apart, the frame’s motor mounts ${mm(b.frameMotorMm)}: the screws won’t line up.`,
    'props-match': () =>
      `${inches(b.propIn)} props fit a ${inches(b.frameSizeIn)} frame with room between the blades.`,
    'props-smaller': () =>
      `${inches(b.propIn)} props fit a ${inches(b.frameSizeIn)} frame, but the frame is bigger and heavier than they need. Check that this is what you meant.`,
    'props-larger': () =>
      `${inches(b.propIn)} props are too big for a ${inches(b.frameSizeIn)} frame: the blades would hit each other or the frame.`,
    'voltage-ok': () =>
      `A ${cells} battery is within the ESC’s ${cellRange(b.escCells)} and the FC’s ${cellRange(b.fcCells)} ratings. Check what your camera and VTX need too: on this app’s drone they run from the flight controller’s regulated power, but some builds power the VTX straight from the battery.`,
    'esc-cells': () =>
      `The ESC is rated for ${cellRange(b.escCells)}, not a ${cells} battery: it can burn out.`,
    'fc-cells': () =>
      `The FC is rated for ${cellRange(b.fcCells)}, not a ${cells} battery: it can burn out.`,
    'both-cells': () =>
      `The ESC (${cellRange(b.escCells)}) and the FC (${cellRange(b.fcCells)}) aren’t rated for a ${cells} battery: they can burn out.`,
    'kv-missing': () => 'Enter the motors’ KV, a whole number from 500 to 5000, to check it.',
    'kv-other-size': () =>
      `The lessons give KV numbers for 5″ props only: ${bands}. Check ${kv} with the motor maker for ${inches(b.propIn)} props.`,
    'kv-6s': () => `${kv} suits 6S with 5″ props (${kv6Low}–${kv6High} KV).`,
    'kv-4s': () => `${kv} suits 4S with 5″ props (${kv4Low}–${kv4High} KV).`,
    'kv-too-high-6s': () =>
      `With 5″ props, ${kv4Low} KV and up is for 4S. On 6S, ${kv} motors swinging 5″ props spin too fast, draw too much current and overheat.`,
    'kv-outside-6s': () =>
      `${kv} is outside the usual ${kv6Low}–${kv6High} KV for 6S with 5″ props. Check it with the motor maker.`,
    'kv-outside-4s': () =>
      `${kv} is outside the usual ${kv4Low}–${kv4High} KV for 4S with 5″ props. Check it with the motor maker.`,
    'kv-other-cells': () =>
      `The lessons give KV numbers for 5″ props on 4S and 6S only: ${bands}. Check ${kv} on ${cells} with the motor maker.`,
    'analog-analog': () => 'Analog goggles show the analog VTX’s video.',
    'analog-receiver': () => 'The goggles’ analog receiver shows the analog VTX’s video.',
    'analog-to-digital': () =>
      'Digital goggles without an analog receiver can’t show an analog VTX’s video.',
    'same-system': () =>
      'Digital goggles show a digital VTX only if both are the same digital system. Check that they are.',
    'digital-to-analog': () => 'Analog goggles can’t show a digital VTX’s video.',
  };
  const reason = reasons[result.reason];
  if (!reason) throw new Error(`No words for the reason ${result.reason}`);
  return reason();
}
