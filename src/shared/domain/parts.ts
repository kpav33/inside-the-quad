/** The drone parts the app can explain. Selecting one selects every instance of it. */
export const PART_IDS = ['frame', 'motors', 'props', 'esc', 'fc', 'battery'] as const;

export type PartId = (typeof PART_IDS)[number];

/** Boards mounted in the stack between the frame plates. Selecting one opens the stack. */
export const STACK_PARTS = ['esc', 'fc'] as const satisfies readonly PartId[];

export function isStackPart(part: PartId | null): boolean {
  return (STACK_PARTS as readonly (PartId | null)[]).includes(part);
}
