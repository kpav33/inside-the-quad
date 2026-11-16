import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import type { Camera, Vector3 } from 'three';

import { FIT_VIEWS, ZOOM_RANGE } from './fit';
import {
  DEFAULT_VIEW,
  MOVES_VIEW,
  type View,
  viewFromPosition,
  viewToPosition,
} from './part-views';
import { type DroneFit, useDroneFit } from './useDroneFit';

/** The camera parts of OrbitControls this file uses. */
interface Controls {
  target: Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => void;
}

/**
 * Points the camera at the drone: at the starting view's fit the first time (`previous` null);
 * afterwards it keeps the direction the camera faces and scales its distance by how that
 * direction's fit changed, so the visitor's angle and zoom both survive a resize. The zoom limits
 * span every view the camera turns to.
 */
function applyFit(
  camera: Camera,
  controls: Controls,
  fit: DroneFit,
  previous: DroneFit | null,
  start: View,
) {
  const [cx, cy, cz] = fit.centre;
  controls.target.set(cx, cy, cz);
  if (previous === null) {
    const [x, y, z] = viewToPosition(start, fit.distanceFor(start));
    camera.position.set(cx + x, cy + y, cz + z);
  } else {
    const offset = camera.position.clone().sub(controls.target);
    const view = viewFromPosition([offset.x, offset.y, offset.z]);
    offset.multiplyScalar(fit.distanceFor(view) / previous.distanceFor(view));
    camera.position.copy(controls.target).add(offset);
  }
  const fits = FIT_VIEWS.map((view) => fit.distanceFor(view));
  controls.minDistance = Math.min(...fits) * ZOOM_RANGE.min;
  controls.maxDistance = Math.max(...fits) * ZOOM_RANGE.max;
  controls.update();
}

/**
 * Frames the drone so it fills the canvas: from the starting view on load, and on every resize by
 * rescaling the camera's distance for the direction it faces. With `sphere`, the drone fits at
 * any attitude (the moves sheet).
 */
export function FitCamera({
  sphere = false,
  ground = null,
}: {
  sphere?: boolean;
  ground?: number | null;
}) {
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const fit = useDroneFit(sphere, ground);
  const previous = useRef<{ fit: DroneFit; mode: string } | null>(null);

  useLayoutEffect(() => {
    if (!controls) return;
    // Opening or leaving the moves sheet starts again from that sheet's starting view: on the
    // moves sheet, from behind and above, as a pilot sees the drone.
    const mode = `${String(sphere)}:${String(ground)}`;
    const last = previous.current?.mode === mode ? previous.current.fit : null;
    applyFit(camera, controls, fit, last, sphere ? MOVES_VIEW : DEFAULT_VIEW);
    previous.current = { fit, mode };
    invalidate();
  }, [controls, camera, fit, sphere, ground, invalidate]);

  return null;
}
