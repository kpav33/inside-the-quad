import type { Camera } from 'three';
import { Vector3 } from 'three';

import type { Vec3 } from './rear';
import {
  endBalloon,
  endRect,
  placeEnd,
  type Rect,
  type ScreenPoint,
  screenPoint,
} from './screen-layout';

interface Size {
  width: number;
  height: number;
}

const scratch = new Vector3();

/** A scene point as canvas pixels for this camera. */
export function project(point: Vec3, camera: Camera, size: Size): ScreenPoint {
  scratch.set(...point).project(camera);
  return screenPoint([scratch.x, scratch.y], size);
}

/** The box the drone's outline covers on screen. */
export function projectedRect(points: readonly Vec3[], camera: Camera, size: Size): Rect {
  const rect = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (const point of points) {
    const [x, y] = project(point, camera, size);
    rect.left = Math.min(rect.left, x);
    rect.right = Math.max(rect.right, x);
    rect.top = Math.min(rect.top, y);
    rect.bottom = Math.max(rect.bottom, y);
  }
  return rect;
}

/** Where an off-drone end sits on screen for this view: its box, and its balloon's centre. */
export function endOnScreen(
  outline: readonly Vec3[],
  camera: Camera,
  size: Size,
): { box: Rect; balloon: ScreenPoint } {
  const centre = placeEnd(projectedRect(outline, camera, size), size);
  return { box: endRect(centre), balloon: endBalloon(centre) };
}

/**
 * The scene point under a canvas pixel, at the depth of `near` (a point on the drone the end's
 * line joins), so the leader's end meets the end's balloon on screen.
 */
export function unprojectAt([x, y]: ScreenPoint, near: Vec3, camera: Camera, size: Size): Vec3 {
  const depth = scratch.set(...near).project(camera).z;
  scratch.set((x / size.width) * 2 - 1, 1 - (y / size.height) * 2, depth).unproject(camera);
  return [scratch.x, scratch.y, scratch.z];
}
