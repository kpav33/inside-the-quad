import type { DroneSpec } from '@/shared/domain/drone-spec';

/** Modelling dimensions not covered by the spec, in millimetres. */
export const MOTOR_BASE_HEIGHT_MM = 3;
export const PROP_HUB_HEIGHT_MM = 8;

/** Height of the bell's top above the arm, where the propeller sits. */
export function motorTopMm(spec: DroneSpec): number {
  return MOTOR_BASE_HEIGHT_MM + spec.motor.bellHeightMm;
}
