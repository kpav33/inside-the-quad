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

/** How long the dashes flow after a step changes, showing which way the path runs (WCAG 2.2.2 lets
 * moving content start by itself if it stops within five seconds). */
export const FLOW_BURST_MS = 5000;

/**
 * Whether the current stretch's dashes flow: while the path plays (Stop pauses them), and for a
 * few seconds after a step changes; never while the drawing is unseen or motion is reduced.
 */
export function dashesFlow({
  playing,
  sinceStepMs,
  onScreen,
  reduceMotion,
}: {
  playing: boolean;
  sinceStepMs: number;
  onScreen: boolean;
  reduceMotion: boolean;
}): boolean {
  if (!onScreen || reduceMotion) return false;
  return playing || sinceStepMs < FLOW_BURST_MS;
}
