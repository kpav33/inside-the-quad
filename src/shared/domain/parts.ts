/** The drone parts the app can explain. Selecting one selects every instance of it. */
export const PART_IDS = [
  'frame',
  'motors',
  'props',
  'esc',
  'fc',
  'battery',
  'strap',
  'receiver',
  'camera',
  'vtx',
  'extras',
] as const;

export type PartId = (typeof PART_IDS)[number];

export function isPartId(value: unknown): value is PartId {
  return (PART_IDS as readonly unknown[]).includes(value);
}

/** Boards under the top plate. Selecting one opens the frame so it can be seen. */
export const INSIDE_PARTS = ['esc', 'fc', 'receiver', 'vtx'] as const satisfies readonly PartId[];

export function isInsidePart(part: PartId | null): boolean {
  return (INSIDE_PARTS as readonly (PartId | null)[]).includes(part);
}
