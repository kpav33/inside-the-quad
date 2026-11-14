import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import type { Camera, Vector3 } from 'three';

import { type Vec3, ZOOM_RANGE } from './fit';
import { DEFAULT_VIEW, viewToPosition } from './part-views';
import { useDroneFit } from './useDroneFit';

/** The camera parts of OrbitControls this file uses. */
interface Controls {
  target: Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => void;
}

/**
 * Points the camera at `centre`: at `fitted` along the starting view the first time (`previous`
 * null), afterwards keeping its direction and scaling its distance by `fitted / previous`.
 */
function applyFit(
  camera: Camera,
  controls: Controls,
  centre: Vec3,
  fitted: number,
  previous: number | null,
) {
  const [cx, cy, cz] = centre;
  controls.target.set(cx, cy, cz);
  if (previous === null) {
    const [x, y, z] = viewToPosition(DEFAULT_VIEW, fitted);
    camera.position.set(cx + x, cy + y, cz + z);
  } else {
    const offset = camera.position
      .clone()
      .sub(controls.target)
      .multiplyScalar(fitted / previous);
    camera.position.copy(controls.target).add(offset);
  }
  controls.minDistance = fitted * ZOOM_RANGE.min;
  controls.maxDistance = fitted * ZOOM_RANGE.max;
  controls.update();
}

/**
 * Frames the drone so it fills the canvas: from the starting view on load, and on every resize by
 * scaling the camera's distance (keeping the direction the visitor turned to and their zoom).
 */
export function FitCamera() {
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const fit = useDroneFit();
  const fitted = fit.distanceFor(DEFAULT_VIEW);
  const previous = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!controls) return;
    applyFit(camera, controls, fit.centre, fitted, previous.current);
    previous.current = fitted;
    invalidate();
  }, [controls, camera, fit, fitted, invalidate]);

  return null;
}
