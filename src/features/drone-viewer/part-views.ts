import { MathUtils } from 'three';

import type { PartId } from '@/shared/domain/parts';

/** A direction to look at the drone from: around it (azimuth) and above it (elevation). */
export interface View {
  /** Angle around the vertical axis from the drone's rear (+z), towards its right (+x). */
  azimuthRad: number;
  elevationRad: number;
}

type Vec3 = [x: number, y: number, z: number];

/** Where a camera at `position` (relative to the drone's centre) looks from. */
export function viewFromPosition([x, y, z]: Vec3): View {
  return {
    azimuthRad: Math.atan2(x, z),
    elevationRad: Math.atan2(y, Math.hypot(x, z)),
  };
}

/** The camera position for a view at `distance` from the drone's centre. */
export function viewToPosition({ azimuthRad, elevationRad }: View, distance: number): Vec3 {
  const flat = distance * Math.cos(elevationRad);
  return [
    flat * Math.sin(azimuthRad),
    distance * Math.sin(elevationRad),
    flat * Math.cos(azimuthRad),
  ];
}

/** The starting view: the drone's front three-quarter, slightly from above. */
export const DEFAULT_CAMERA_POSITION: Vec3 = [0.22, 0.18, -0.28];
export const DEFAULT_VIEW = viewFromPosition(DEFAULT_CAMERA_POSITION);

/** Nearly head-on and a little to the right, looking into the camera's lens. */
const FRONT_VIEW: View = {
  azimuthRad: MathUtils.degToRad(160),
  elevationRad: MathUtils.degToRad(18),
};

/** High over the right rear quarter, looking down into the open frame and the rear bay. */
const REAR_VIEW: View = {
  azimuthRad: MathUtils.degToRad(35),
  elevationRad: MathUtils.degToRad(45),
};

/**
 * The view that shows a part best, or null when the current view already shows it (or nothing is
 * selected), so the drone is only turned when it has to be.
 */
export function partView(part: PartId | null): View | null {
  switch (part) {
    case 'camera':
      return FRONT_VIEW;
    case 'vtx':
    case 'receiver':
    case 'extras':
      return REAR_VIEW;
    default:
      return null;
  }
}

const TURN_LAMBDA = 7.5;
const SETTLE_RAD = 0.001;

/** One animation frame of turning towards `target`, the short way round. */
export function stepView(
  current: View,
  target: View,
  deltaS: number,
  reduceMotion: boolean,
): { view: View; settled: boolean } {
  if (reduceMotion) return { view: target, settled: true };
  // The azimuth difference wrapped to [−π, π], so the drone turns the short way.
  const turn = Math.atan2(
    Math.sin(target.azimuthRad - current.azimuthRad),
    Math.cos(target.azimuthRad - current.azimuthRad),
  );
  const azimuthRad = MathUtils.damp(
    current.azimuthRad,
    current.azimuthRad + turn,
    TURN_LAMBDA,
    deltaS,
  );
  const elevationRad = MathUtils.damp(
    current.elevationRad,
    target.elevationRad,
    TURN_LAMBDA,
    deltaS,
  );
  const remaining = Math.max(
    Math.abs(turn - (azimuthRad - current.azimuthRad)),
    Math.abs(target.elevationRad - elevationRad),
  );
  return remaining < SETTLE_RAD
    ? { view: target, settled: true }
    : { view: { azimuthRad, elevationRad }, settled: false };
}
