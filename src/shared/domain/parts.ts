/** The drone parts the app can explain. Selecting one selects every instance of it. */
export const PART_IDS = ['frame', 'motors', 'props'] as const;

export type PartId = (typeof PART_IDS)[number];

export const PART_LABELS: Record<PartId, string> = {
  frame: 'Frame',
  motors: 'Motors',
  props: 'Propellers',
};
