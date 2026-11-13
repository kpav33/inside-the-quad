/** FPV drones are named by prop size. Typical ranges, in millimetres, for the intro's comparison. */
export type SizeClassId = 'whoop' | '3in' | '5in' | '7in';

export interface SizeClass {
  id: SizeClassId;
  /** Propeller diameter. */
  propMm: readonly [min: number, max: number];
  /** Diagonal distance between motor centres (wheelbase). */
  frameMm: readonly [min: number, max: number];
}

export const SIZE_CLASSES: readonly SizeClass[] = [
  { id: 'whoop', propMm: [31, 40], frameMm: [65, 75] },
  { id: '3in', propMm: [76, 76], frameMm: [120, 150] },
  { id: '5in', propMm: [127, 127], frameMm: [220, 230] },
  { id: '7in', propMm: [178, 178], frameMm: [280, 320] },
];

/** The one size a class is drawn at: the middle of its frame range. */
export function drawingSizeMm(sizeClass: SizeClass): number {
  return (sizeClass.frameMm[0] + sizeClass.frameMm[1]) / 2;
}

/** A range as written in copy: "31–40 mm", or "127 mm" when both ends match. */
export function formatRangeMm([min, max]: readonly [number, number]): string {
  return min === max ? `${min} mm` : `${min}–${max} mm`;
}
