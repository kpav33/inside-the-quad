import type { SpinDirection } from './layout';

const BLADE_ANGLE_RAD = (12 * Math.PI) / 180;

/** Rotation about the blade's long axis. Wrong-signed, every prop would be mounted backwards. */
export function bladeTwist(spin: SpinDirection): number {
  return spin === 'cw' ? -BLADE_ANGLE_RAD : BLADE_ANGLE_RAD;
}
