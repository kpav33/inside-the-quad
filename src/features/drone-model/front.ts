import type { DroneSpec } from '@/shared/domain/drone-spec';

import type { Box, Vec3 } from './rear';

const CAMERA_LIFT_MM = 2;
const CAMERA_SETBACK_MM = 10;
const PLATE_THICKNESS_MM = 2;
const PLATE_DEPTH_MM = 18;

/** Where the camera sits: centred between its plates near the front, tilted up. */
export function cameraPlacement(spec: DroneSpec): { centre: Vec3; tiltRad: number } {
  const { armThicknessMm, bodyLengthMm } = spec.frame;
  const width = spec.camera.widthMm;
  return {
    centre: [0, armThicknessMm + CAMERA_LIFT_MM + width / 2, -bodyLengthMm / 2 + CAMERA_SETBACK_MM],
    tiltRad: (spec.camera.tiltDeg * Math.PI) / 180,
  };
}

/** The two camera side plates, just wider than the camera, from the bottom to the top plate. */
export function cameraPlates(spec: DroneSpec): [Box, Box] {
  const { armThicknessMm, standoffHeightMm, bodyLengthMm } = spec.frame;
  const x = spec.camera.widthMm / 2 + 1 + PLATE_THICKNESS_MM / 2;
  const plate = (side: number): Box => ({
    centre: [
      side * x,
      armThicknessMm + standoffHeightMm / 2,
      -bodyLengthMm / 2 + PLATE_DEPTH_MM / 2,
    ],
    size: [PLATE_THICKNESS_MM, standoffHeightMm, PLATE_DEPTH_MM],
  });
  return [plate(-1), plate(1)];
}
