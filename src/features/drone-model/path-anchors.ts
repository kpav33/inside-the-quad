import type { DroneSpec } from '@/shared/domain/drone-spec';
import type { AnchorId } from '@/shared/domain/paths';

import { BATTERY_PAD_MM, motorTopMm, PROP_HUB_HEIGHT_MM } from './dimensions';
import { droneOutlineMm } from './extents';
import { CAMERA_BODY_DEPTH_MM, cameraPlacement } from './front';
import { motorPlacements } from './layout';
import { type Box, escBox, rearBay, type Vec3, xt60Box } from './rear';
import { type LiftGroup, stackLayers } from './stack';

/** How far along the rear tip line, from the left, each off-drone end sits. */
const END_ALONG = { radio: 0.3, goggles: 0.7 } as const;

/** The top middle of a box, raised by its lift. */
function topOf({ centre: [x, y, z], size: [, height] }: Box, liftMm = 0): Vec3 {
  return [x, y + height / 2 + liftMm, z];
}

/**
 * The rearmost blade-tip corners of the fitted outline, one each side (left first). Any point
 * between them stays in view, since the camera is fitted to keep every outline point in frame.
 */
export function rearTipCorners(spec: DroneSpec): [Vec3, Vec3] {
  const outline = droneOutlineMm(spec);
  const rearmost = (side: number) =>
    outline
      .filter(([x]) => Math.sign(x) === side)
      .reduce((best, point) => (point[2] > best[2] ? point : best));
  return [rearmost(-1), rearmost(1)];
}

/** Where an off-drone end (the radio or goggles) is drawn: on the rear tip line. */
export function endPoint(spec: DroneSpec, end: 'radio' | 'goggles'): Vec3 {
  const [left, right] = rearTipCorners(spec);
  const t = END_ALONG[end];
  return [0, 1, 2].map((i) => (left[i] ?? 0) + t * ((right[i] ?? 0) - (left[i] ?? 0))) as Vec3;
}

/**
 * Where a path's leader touches an anchor, in millimetres: one point per instance (four for the
 * motors and props, in motor order), on top of the piece so the leader is not hidden inside it,
 * and lifted with its layer when the frame is open.
 */
export function anchorPoints(
  spec: DroneSpec,
  anchor: AnchorId,
  lift: Record<LiftGroup, number>,
): Vec3[] {
  const bay = rearBay(spec);
  const layers = stackLayers(spec);
  const motorTop = spec.frame.armThicknessMm + motorTopMm(spec);
  const motorsAt = (y: number) =>
    motorPlacements(spec).map(({ position: [x, , z] }): Vec3 => [x * 1000, y, z * 1000]);
  switch (anchor) {
    case 'radio':
    case 'goggles':
      return [endPoint(spec, anchor)];
    case 'motors':
      return motorsAt(motorTop);
    case 'props':
      return motorsAt(motorTop + PROP_HUB_HEIGHT_MM);
    case 'fc':
      return [[0, layers.fc.topMm + lift.fc, 0]];
    case 'esc': {
      // A front corner of the board, so the leader is not hidden under the flight controller.
      const [, y] = topOf(escBox(spec), lift.esc);
      const corner = spec.esc.boardSizeMm / 2 - 4;
      return [[corner, y, -corner]];
    }
    case 'capacitor':
      return [topOf(bay.capacitor, lift.esc)];
    case 'xt60':
      return [topOf(xt60Box(spec), lift.topPlate)];
    case 'battery': {
      const top = layers.topPlate.topMm + BATTERY_PAD_MM + spec.battery.packHeightMm;
      return [[0, top + lift.topPlate, 0]];
    }
    case 'receiver':
      return [topOf(bay.receiver, lift.rearBay)];
    case 'receiverAntenna':
      return [bay.receiverAntenna.tip];
    case 'vtx':
      return [topOf(bay.vtx, lift.rearBay)];
    case 'vtxAntenna': {
      const [x, y, z] = bay.vtxAntenna.tip;
      return [[x, y + lift.rearBay, z]];
    }
    case 'camera': {
      // The lens face, which the starting view looks at.
      const [x, y, z] = cameraPlacement(spec).centre;
      return [[x, y, z - CAMERA_BODY_DEPTH_MM / 2]];
    }
  }
}

const distance = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The leader's lines from one stop's points to the next's: one point fans out to all; equal
 * counts pair by index (motor to its prop); otherwise each target joins its nearest source.
 */
export function leaderSegments(from: readonly Vec3[], to: readonly Vec3[]): [Vec3, Vec3][] {
  const [only] = from;
  if (from.length === 1 && only) return to.map((point) => [only, point]);
  if (from.length === to.length) {
    return from.flatMap((point, i) => {
      const target = to[i];
      return target ? [[point, target] as [Vec3, Vec3]] : [];
    });
  }
  return to.flatMap((point) => {
    const nearest = from.reduce<Vec3 | null>(
      (best, candidate) =>
        best === null || distance(candidate, point) < distance(best, point) ? candidate : best,
      null,
    );
    return nearest ? [[nearest, point] as [Vec3, Vec3]] : [];
  });
}
