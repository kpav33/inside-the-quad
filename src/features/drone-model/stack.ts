import { MathUtils } from 'three';

import type { DroneSpec } from '@/shared/domain/drone-spec';

/** The layers that move when the stack opens, from the bottom up. */
export const STACK_LAYERS = ['esc', 'fc', 'topPlate'] as const;
export type StackLayer = (typeof STACK_LAYERS)[number];

/** Modelling heights not covered by the spec, in millimetres. */
export const ESC_STANDOFF_MM = 5;
export const ESC_HEIGHT_MM = 4.6;
export const FC_STANDOFF_MM = 5;
export const FC_HEIGHT_MM = 4;

/** What moves when the frame opens: the stack layers, plus the rear bay (VTX and receiver). */
export type LiftGroup = StackLayer | 'rearBay';

/** How far each group lifts when the frame opens, in millimetres. The rear bay rises into the gap
 * behind the stack so it can be seen past the lifted top plate. */
const OPEN_LIFT_MM: Record<LiftGroup, number> = { esc: 15, fc: 32, topPlate: 50, rearBay: 30 };

// About 95 % of the way in 200 ms, matching the brief's 150–200 ms state transitions.
const EASE_LAMBDA = 15;
const SETTLE_MM = 0.01;

/** Where each layer sits when the stack is closed, measured up from the bottom of the frame. */
export function stackLayers(
  spec: DroneSpec,
): Record<StackLayer, { bottomMm: number; topMm: number }> {
  const { armThicknessMm, standoffHeightMm, topPlateThicknessMm } = spec.frame;
  const escBottom = armThicknessMm + ESC_STANDOFF_MM;
  const fcBottom = escBottom + ESC_HEIGHT_MM + FC_STANDOFF_MM;
  const plateBottom = armThicknessMm + standoffHeightMm;
  return {
    esc: { bottomMm: escBottom, topMm: escBottom + ESC_HEIGHT_MM },
    fc: { bottomMm: fcBottom, topMm: fcBottom + FC_HEIGHT_MM },
    topPlate: { bottomMm: plateBottom, topMm: plateBottom + topPlateThicknessMm },
  };
}

/**
 * How far each layer is lifted, in millimetres: nothing when closed, and an exploded-view drawing
 * when open. The spec is a parameter so other drone sizes can change the lift later.
 */
export function explodedOffsets(_spec: DroneSpec, open: boolean): Record<LiftGroup, number> {
  return open ? { ...OPEN_LIFT_MM } : { esc: 0, fc: 0, topPlate: 0, rearBay: 0 };
}

/** One animation frame of easing a lift towards its target, in millimetres. */
export function stepLift(
  current: number,
  target: number,
  deltaS: number,
  reduceMotion: boolean,
): { value: number; settled: boolean } {
  if (reduceMotion) return { value: target, settled: true };
  const value = MathUtils.damp(current, target, EASE_LAMBDA, deltaS);
  return Math.abs(target - value) < SETTLE_MM
    ? { value: target, settled: true }
    : { value, settled: false };
}
