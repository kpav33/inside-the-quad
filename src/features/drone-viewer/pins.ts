/** How a path stop's pin is drawn at the current step. */
export type PinState = 'passed' | 'current' | 'ahead' | 'hidden';

/**
 * Stops passed and the current one show their numbers; stops ahead are hidden, except an
 * off-drone end, whose label shows from the start so the path's destination is always in view.
 */
export function pinState(index: number, step: number, isEnd: boolean): PinState {
  if (index < step) return 'passed';
  if (index === step) return 'current';
  return isEnd ? 'ahead' : 'hidden';
}

/** A point in normalised view coordinates (−1 to 1, y up) as canvas pixels (y down). */
export function screenPoint(
  [x, y]: readonly [number, number],
  { width, height }: { width: number; height: number },
): [number, number] {
  return [((x + 1) / 2) * width, ((1 - y) / 2) * height];
}
