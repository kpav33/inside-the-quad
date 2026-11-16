import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import type { PerspectiveCamera } from 'three';

import { closedExtentsMm, droneOutlineMm } from '@/features/drone-model';
import { mm, REFERENCE_5_INCH } from '@/shared/domain/drone-spec';

import { FIT_MARGIN, fitDistance, sphereFitDistance, type Vec3 } from './fit';
import { groundFit } from './vtx-gauge';
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
/** How far the closed drone's bottom sits below its middle. */
export const DRONE_BOTTOM = CENTRE[1] - mm(CLOSED.bottomMm);
/** The smallest sphere about the centre that holds the drone however it is turned. */
const RADIUS = Math.max(
  ...OUTLINE.map(([x, y, z]) => Math.hypot(x - CENTRE[0], y - CENTRE[1], z - CENTRE[2])),
);
/** That sphere's radius, for framing the fall on the what-if sheet. */
export const DRONE_RADIUS = RADIUS;

export interface DroneFit {
  /** What the camera looks at and turns around. */
  centre: Vec3;
  /** The camera distance at which the drone fills the canvas from this view. */
  distanceFor: (view: View) => number;
}

/**
 * How far the camera must be to fit the drone, for the canvas's current shape. With `sphere`, far
 * enough for any turn of the drone (the flight sheets, where it rolls and flips); with `ground` too
 * (metres below hover, the what-if sheet), framed to hold its fall to the ground line as well.
 */
export function useDroneFit(sphere = false, ground: number | null = null): DroneFit {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const { width, height } = useThree((state) => state.size);
  const aspect = width / Math.max(height, 1);
  const fov = camera.fov;
  return useMemo(() => {
    const cache = new Map<View, number>();
    const fall = sphere && ground !== null ? groundFit(RADIUS, ground, DRONE_BOTTOM) : null;
    const centre: Vec3 = fall ? [CENTRE[0], CENTRE[1] + fall.centreY, CENTRE[2]] : CENTRE;
    return {
      centre,
      distanceFor: (view) => {
        let distance = cache.get(view);
        if (distance === undefined) {
          distance = fall
            ? sphereFitDistance(fall.radius, fov, aspect)
            : sphere
              ? sphereFitDistance(RADIUS, fov, aspect)
              : fitDistance(OUTLINE, CENTRE, view, aspect, fov, FIT_MARGIN);
          cache.set(view, distance);
        }
        return distance;
      },
    };
  }, [aspect, fov, sphere, ground]);
}
