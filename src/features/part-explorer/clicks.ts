/** Pointer movement (px) between press and release that still counts as a click, not a drag. */
export const MAX_CLICK_MOVEMENT_PX = 4;

/**
 * react-three-fiber fires onClick even after the pointer moved, e.g. at the end of an orbit drag,
 * and reports the movement as `event.delta`. Only near-stationary clicks should select a part.
 */
export function isDeliberateClick(delta: number): boolean {
  return delta <= MAX_CLICK_MOVEMENT_PX;
}
