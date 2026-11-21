import { type DroneSpec, mm } from '@/shared/domain/drone-spec';
import type { AnchorId } from '@/shared/domain/paths';

import { droneOutlineMm } from './extents';
import { anchorPoints } from './path-anchors';
import type { Vec3 } from './rear';
import { explodedOffsets } from './stack';

/** One stop of a path as the drawing needs it. */
export interface LeaderStop {
  anchors: readonly AnchorId[];
  /** Indexes of the stops this one feeds. */
  feeds: readonly number[];
  /** The number drawn at the stop, matching the list on the sheet. */
  marker: number;
  /** The label of an off-drone end ("Your radio"); left out for a stop on the drone. */
  endLabel?: string;
}

/** A path on the drawing, at its current step (0-based). */
export interface Leader {
  stops: readonly LeaderStop[];
  step: number;
  /** The path is playing: its dashes keep flowing until Stop. */
  playing?: boolean;
}

export const toScene = ([x, y, z]: Vec3): Vec3 => [mm(x), mm(y), mm(z)];

/** The drone's fitted outline in scene metres, which the off-drone ends are kept clear of. */
export function outlineScene(spec: DroneSpec): Vec3[] {
  return droneOutlineMm(spec).map(toScene);
}

/** The scene points of a stop: every anchor's points, in metres. */
export function stopPoints(spec: DroneSpec, stop: LeaderStop): Vec3[] {
  // Every path passes a board under the top plate, so the frame is always open on a path sheet.
  const lift = explodedOffsets(spec, true);
  return stop.anchors.flatMap((anchor) => anchorPoints(spec, anchor, lift)).map(toScene);
}

/**
 * Where each stop's numbered balloon sits on the drawing, in scene metres: at the stop's first
 * point. The viewer draws the balloons over the canvas at these points.
 */
export function leaderMarkerPoints(spec: DroneSpec, stops: readonly LeaderStop[]): Vec3[] {
  return stops.map((stop) => stopPoints(spec, stop)[0] ?? [0, 0, 0]);
}

/** Where an anchor touches the closed drone, in scene metres (the flight sheets keep it closed). */
export function closedAnchorPoint(spec: DroneSpec, anchor: AnchorId): Vec3 | null {
  return anchorPoints(spec, anchor, explodedOffsets(spec, false)).map(toScene)[0] ?? null;
}
