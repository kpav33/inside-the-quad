import type { DroneSpec } from '@/shared/domain/drone-spec';

/** Modelling dimensions not covered by the spec, in millimetres. */
export const MOTOR_BASE_HEIGHT_MM = 3;
export const PROP_HUB_HEIGHT_MM = 8;

/** Height of the bell's top above the arm, where the propeller sits. */
export function motorTopMm(spec: DroneSpec): number {
  return MOTOR_BASE_HEIGHT_MM + spec.motor.bellHeightMm;
}

/** Grippy pad between the top plate and the battery. */
export const BATTERY_PAD_MM = 1;
/** The battery's power lead and XT60 plug, hanging out of the back of the pack. */
export const BATTERY_LEAD_LENGTH_MM = 12;
export const XT60_MM = { width: 16, height: 8, length: 15 } as const;

/** Standoffs between the plates: radius, and inset from the body's corners. */
export const STANDOFF_RADIUS_MM = 2.5;
export const STANDOFF_INSET_MM = 4;
