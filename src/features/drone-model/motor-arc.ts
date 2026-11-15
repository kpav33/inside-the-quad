const MIN_SWEEP = (30 * Math.PI) / 180;
const MAX_SWEEP = (200 * Math.PI) / 180;

/**
 * How far a prop's spin arc reaches for its motor's speed (0–1): a short arc at `idle`, most of a
 * turn at full speed. The arcs stand still; their length is the speed.
 */
export function arcSweep(speed: number, idle: number): number {
  const share = Math.min(Math.max((speed - idle) / (1 - idle), 0), 1);
  return MIN_SWEEP + share * (MAX_SWEEP - MIN_SWEEP);
}
