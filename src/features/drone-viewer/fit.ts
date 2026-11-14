import { MathUtils } from 'three';

import { DEFAULT_VIEW, FRONT_VIEW, REAR_VIEW, type View, viewToPosition } from './part-views';

export type Vec3 = [x: number, y: number, z: number];

/** The views the app shows the drone from: the start, and the two the camera turns to. */
export const FIT_VIEWS: readonly View[] = [DEFAULT_VIEW, FRONT_VIEW, REAR_VIEW];

/** Space left around the drone, as a share of the half-canvas (normalised device units). */
export const FIT_MARGIN = 0.04;

/** How far the visitor may zoom, as factors of the fitted distance. */
export const ZOOM_RANGE = { min: 0.5, max: 2 } as const;

/** Whether every point lands inside ±limit on both screen axes for a camera at `distance`. */
function fitsAt(
  points: readonly Vec3[],
  centre: Vec3,
  view: View,
  distance: number,
  tanHalfFov: number,
  aspect: number,
  limit: number,
): boolean {
  // Camera basis: looking from `position` towards `centre`, with +y up.
  const [ox, oy, oz] = viewToPosition(view, distance);
  const f = [-ox / distance, -oy / distance, -oz / distance] as const;
  const rLength = Math.hypot(f[2], f[0]);
  const r = [-f[2] / rLength, 0, f[0] / rLength] as const;
  const u = [
    r[1] * f[2] - r[2] * f[1],
    r[2] * f[0] - r[0] * f[2],
    r[0] * f[1] - r[1] * f[0],
  ] as const;
  return points.every(([px, py, pz]) => {
    const dx = px - (centre[0] + ox);
    const dy = py - (centre[1] + oy);
    const dz = pz - (centre[2] + oz);
    const depth = dx * f[0] + dy * f[1] + dz * f[2];
    if (depth <= 0) return false;
    const x = (dx * r[0] + dy * r[1] + dz * r[2]) / (depth * tanHalfFov * aspect);
    const y = (dx * u[0] + dy * u[1] + dz * u[2]) / (depth * tanHalfFov);
    return Math.abs(x) <= limit && Math.abs(y) <= limit;
  });
}

/**
 * The smallest camera distance from `centre`, along `view`, at which every point projects inside
 * the canvas less `margin` on each side, for a perspective camera with this vertical field of
 * view and aspect ratio. Same units as the points.
 */
export function fitDistance(
  points: readonly Vec3[],
  centre: Vec3,
  view: View,
  aspect: number,
  fovDeg: number,
  margin: number,
): number {
  const tanHalfFov = Math.tan(MathUtils.degToRad(fovDeg) / 2);
  const limit = 1 - margin;
  const fits = (d: number) => fitsAt(points, centre, view, d, tanHalfFov, aspect, limit);
  let far = 1;
  while (!fits(far)) far *= 2;
  let near = 0;
  for (let i = 0; i < 40; i++) {
    const mid = (near + far) / 2;
    if (fits(mid)) far = mid;
    else near = mid;
  }
  return far;
}
