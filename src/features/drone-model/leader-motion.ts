/** The path leader's dash and gap length, in scene metres (4 mm). */
export const LEADER_DASH_M = 0.004;

/** How fast the dashes travel, in scene metres per second: about one dash and gap a second. */
const DASH_SPEED = 2 * LEADER_DASH_M;

/**
 * The dash offset of the current stretch of a path leader after `elapsedS` seconds. A falling
 * offset runs the dashes from the line's start to its end, toward the next stop. With reduced
 * motion the dashes hold still.
 */
export function dashOffset(elapsedS: number, reduceMotion: boolean): number {
  return reduceMotion ? 0 : -elapsedS * DASH_SPEED;
}
