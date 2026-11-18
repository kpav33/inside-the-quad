/** The gear you hold and wear, in reading order: one sheet each, in their own chapter. */
export const GEAR_IDS = ['radio', 'goggles', 'charger'] as const;

export type GearId = (typeof GEAR_IDS)[number];

export function isGearId(value: unknown): value is GearId {
  return (GEAR_IDS as readonly unknown[]).includes(value);
}
