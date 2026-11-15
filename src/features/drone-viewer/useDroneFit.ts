import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import type { PerspectiveCamera } from 'three';

import { closedExtentsMm, droneOutlineMm } from '@/features/drone-model';
import { mm, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { FIT_MARGIN, fitDistance, sphereFitDistance, type Vec3 } from './fit';
import type { View } from './part-views';

/** The drone's outline in metres (the scene's units), closed and with the stack opened. */
const OUTLINE: readonly Vec3[] = droneOutlineMm(REFERENCE_5_INCH).map(([x, y, z]) => [
  mm(x),
  mm(y),
  mm(z),
]);
const CLOSED = closedExtentsMm(REFERENCE_5_INCH);
/** The middle of the closed drone, so it sits centred; the lifted stack still fits above it. */
const CENTRE: Vec3 = [0, mm((CLOSED.bottomMm + CLOSED.topMm) / 2), 0];
/** The middle the drone turns about on the moves sheet. */
export const DRONE_CENTRE: Readonly<Vec3> = CENTRE;
/** The smallest sphere about the centre that holds the drone however it is turned. */
const RADIUS = Math.max(
  ...OUTLINE.map(([x, y, z]) => Math.hypot(x - CENTRE[0], y - CENTRE[1], z - CENTRE[2])),
);

export interface DroneFit {
  /** What the camera looks at and turns around. */
  centre: Vec3;
  /** The camera distance at which the drone fills the canvas from this view. */
  distanceFor: (view: View) => number;
}

/**
 * How far the camera must be to fit the drone, for the canvas's current shape. With `sphere`, far
 * enough for any turn of the drone (the moves sheet, where it rolls and flips).
 */
export function useDroneFit(sphere = false): DroneFit {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);
  const aspect = width / Math.max(height, 1);
  const fov = camera.fov;
  return useMemo(() => {
    const cache = new Map<View, number>();
    return {
      centre: CENTRE,
      distanceFor: (view) => {
        let distance = cache.get(view);
        if (distance === undefined) {
          distance = sphere
            ? sphereFitDistance(RADIUS, fov, aspect)
            : fitDistance(OUTLINE, CENTRE, view, aspect, fov, FIT_MARGIN);
          cache.set(view, distance);
        }
        return distance;
      },
    };
  }, [aspect, fov, sphere]);
}
