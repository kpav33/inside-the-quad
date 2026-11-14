import type { SpinDirection } from './layout';

/** The hub's radius and each blade's width, in millimetres. */
export const HUB_RADIUS_MM = 7;
export const BLADE_WIDTH_MM = 12;
export const BLADE_THICKNESS_MM = 1.5;

const BLADE_ANGLE_RAD = (12 * Math.PI) / 180;

/** Rotation about the blade's long axis. Wrong-signed, every prop would be mounted backwards. */
export function bladeTwist(spin: SpinDirection): number {
  return spin === 'cw' ? -BLADE_ANGLE_RAD : BLADE_ANGLE_RAD;
}

/** Each blade's angle around the hub's vertical axis, in radians. */
export function bladeAngle(index: number, blades: number): number {
  return (index * 2 * Math.PI) / blades;
}

/** How far a twisted blade's edges reach above and below the hub's middle, in millimetres. */
export function bladeHalfHeightMm(): number {
  return (BLADE_WIDTH_MM / 2) * Math.sin(BLADE_ANGLE_RAD) + BLADE_THICKNESS_MM / 2;
}
